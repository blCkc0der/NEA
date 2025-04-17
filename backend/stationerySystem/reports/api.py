from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Count, Q, Sum, F   # Aggregate SQL functions
from inventory.models import InventoryItem, StockLog
from requests.models import Request
from inventory.serializers import StockReportSerializer
from requests.serializers import RequestSerializer
from django.contrib.auth import get_user_model
from datetime import datetime
import openpyxl     #Used for Excel export (complex output formatting)
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from django.http import HttpResponse
from io import BytesIO
from rest_framework.authentication import SessionAuthentication
from django.utils.timezone import make_aware

User = get_user_model()

# ----------------------------
# GET REPORT DATA (JSON)
# ----------------------------
class ReportView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        # Get report type and date filters
        report_type = request.query_params.get('type', 'stock')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

         # Defensive programming: Validate date format
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d') if start_date else None
            end_date = datetime.strptime(end_date, '%Y-%m-%d') if end_date else None
        except ValueError:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        data = []
        stats = {}

         # Handle different report types
        if report_type == 'stock':
            queryset = InventoryItem.objects.all()
            if start_date:
                queryset = queryset.filter(updated_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(updated_at__lte=end_date)
            
            # Aggregate logic to count statuses
            serializer_context = {'start_date': start_date, 'end_date': end_date}
            data = StockReportSerializer(queryset, many=True, context=serializer_context).data
            stats = {
                'total_items': queryset.count(),
                'low_stock_items': queryset.filter(status='low_stock').count(),
                'out_of_stock_items': queryset.filter(status='out_of_stock').count(),
            }

        elif report_type == 'requests':
            queryset = Request.objects.select_related('user', 'item').all()
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)
            data = RequestSerializer(queryset, many=True).data
            stats = {
                'total_requests': queryset.count(),
                'approved_requests': queryset.filter(status='approved').count(),
                'pending_requests': queryset.filter(status='pending').count(),
            }

        elif report_type == 'teacher':
            # SQL aggregation with filter condition
            queryset = Request.objects.values(
                'user__email',
                'user__first_name',
                'user__last_name'
            ).annotate(
                total_requests=Count('id'),
                approved_requests=Count('id', filter=Q(status='approved'))
            ).order_by('-total_requests')
            
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)
            
            data = [
                {
                    'user_email': item['user__email'],
                    'user_name': f"{item['user__first_name'] or ''} {item['user__last_name'] or ''}".strip(),
                    'total_requests': item['total_requests'],
                    'approved_requests': item['approved_requests']
                }
                for item in queryset
            ]
            stats = {
                'total_teachers': len(data),
                'total_requests': sum(item['total_requests'] for item in data),
                'approved_requests': sum(item['approved_requests'] for item in data),
            }

        else:
            return Response({"error": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"data": data, "stats": stats})

# ----------------------------
# EXPORT REPORT AS PDF/EXCEL
# ----------------------------
class ReportExportView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        report_type = request.data.get('type', 'stock')
        format_type = request.data.get('format', 'pdf')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        try:
            start_date = make_aware(datetime.strptime(start_date, '%Y-%m-%d')) if start_date else None
            end_date = make_aware(datetime.strptime(end_date, '%Y-%m-%d')) if end_date else None
        except ValueError:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        headers = []
        rows = []

         # Same logic reused to generate report content based on type
        if report_type == 'stock':
            queryset = InventoryItem.objects.all()
            if start_date:
                queryset = queryset.filter(updated_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(updated_at__lte=end_date)
            serializer_context = {'start_date': start_date, 'end_date': end_date}
            data = StockReportSerializer(queryset, many=True, context=serializer_context).data
            headers = ['ID', 'Name', 'Quantity', 'Usage', 'Status']
            rows = [[item['id'], item['name'], item['quantity'], item['usage'], item['status']] for item in data]

        elif report_type == 'requests':
            queryset = Request.objects.select_related('user', 'item').all()
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)
            data = RequestSerializer(queryset, many=True).data
            headers = ['ID', 'Teacher', 'Item', 'Status', 'Date']
            rows = [
                [
                    item['id'],
                    f"{item['user']['first_name'] or ''} {item['user']['last_name'] or ''}".strip() if item['user'] else 'N/A',
                    item['item']['name'] if item['item'] else 'N/A',
                    item['status'],
                    item['created_at']
                ]
                for item in data
            ]

        elif report_type == 'teacher':
            queryset = Request.objects.values(
                'user__email',
                'user__first_name',
                'user__last_name'
            ).annotate(
                total_requests=Count('id'),
                approved_requests=Count('id', filter=Q(status='approved'))
            ).order_by('-total_requests')
            
            if start_date:
                queryset = queryset.filter(created_at__gte=start_date)
            if end_date:
                queryset = queryset.filter(created_at__lte=end_date)
            
            data = [
                {
                    'user_email': item['user__email'],
                    'user_name': f"{item['user__first_name'] or ''} {item['user__last_name'] or ''}".strip(),
                    'total_requests': item['total_requests'],
                    'approved_requests': item['approved_requests']
                }
                for item in queryset
            ]
            headers = ['Teacher Email', 'Teacher Name', 'Total Requests', 'Approved Requests']
            rows = [
                [item['user_email'], item['user_name'], item['total_requests'], item['approved_requests']]
                for item in data
            ]

        else:
            return Response({"error": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)

        if format_type == 'pdf':
            return self.generate_pdf(report_type, headers, rows)
        elif format_type == 'excel':
            return self.generate_excel(report_type, headers, rows)
        else:
            return Response({"error": "Invalid format"}, status=status.HTTP_400_BAD_REQUEST)
    
     # Complex user-defined routine: generates a styled PDF table
    def generate_pdf(self, report_type, headers, rows):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        elements.append(Paragraph(f"{report_type.capitalize()} Report", styles['Title']))

        data = [headers] + rows
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report.pdf"'
        response.write(buffer.getvalue())
        buffer.close()
        return response

    # Complex user-defined routine: Excel export with styling
    def generate_excel(self, report_type, headers, rows):
        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = f"{report_type.capitalize()} Report"

        sheet.append(headers)
        for row in rows:
            sheet.append(row)

        # Adjust column widths dynamically
        for col in sheet.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = max_length + 2
            sheet.column_dimensions[column].width = adjusted_width

        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report.xlsx"'
        response.write(buffer.getvalue())
        buffer.close()
        return response