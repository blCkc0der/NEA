from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from django.http import HttpResponse  # Added missing import
from datetime import timedelta, datetime
from io import BytesIO
import xlsxwriter
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from inventory.models import InventoryItem, Category, StockLog
from requests.models import Request
from inventory.serializers import InventoryItemSerializer, CategorySerializer
from requests.serializers import RequestSerializer

class ReportView(APIView):
    """
    API endpoint for generating various inventory reports with filtering capabilities
    """
    
    def get(self, request):
        report_type = request.query_params.get('type', 'stock')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        category = request.query_params.get('category', 'all')
        
        try:
            if report_type == 'stock':
                return self._generate_stock_report(start_date, end_date, category)
            elif report_type == 'requests':
                return self._generate_request_report(start_date, end_date, category)
            elif report_type == 'movement':
                return self._generate_movement_report(start_date, end_date, category)
            elif report_type == 'teacher':
                return self._generate_teacher_report(start_date, end_date, category)
            else:
                return Response(
                    {'error': 'Invalid report type'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_stock_report(self, start_date, end_date, category):
        """Generate stock level report with usage calculations"""
        queryset = InventoryItem.objects.all()
        
        # Apply category filter
        if category != 'all':
            queryset = queryset.filter(category__name=category)
        
        # Get stock data with calculated usage from StockLog
        stock_data = queryset.annotate(
            usage=Sum(
                'stock_logs__change',
                filter=Q(stock_logs__change__lt=0),
                default=0
            )
        ).order_by('category__name', 'name')
        
        serializer = InventoryItemSerializer(stock_data, many=True)
        
        # Calculate summary stats
        total_items = stock_data.count()
        low_stock_items = stock_data.filter(
            quantity__lte=F('low_stock_threshold')
        ).count()
        out_of_stock_items = stock_data.filter(
            quantity=0
        ).count()
        
        return Response({
            'type': 'stock',
            'data': serializer.data,
            'stats': {
                'total_items': total_items,
                'low_stock_items': low_stock_items,
                'out_of_stock_items': out_of_stock_items,
                'categories': self._get_category_stats()
            }
        })
    
    def _generate_request_report(self, start_date, end_date, category):
        """Generate request fulfillment report"""
        queryset = Request.objects.select_related('item', 'user').all()
        
        # Apply date filters
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Apply category filter
        if category != 'all':
            queryset = queryset.filter(item__category__name=category)
        
        serializer = RequestSerializer(queryset, many=True)
        
        # Calculate summary stats
        total_requests = queryset.count()
        approved_requests = queryset.filter(status='approved').count()
        pending_requests = queryset.filter(status='pending').count()
        rejected_requests = queryset.filter(status='rejected').count()
        
        return Response({
            'type': 'requests',
            'data': serializer.data,
            'stats': {
                'total_requests': total_requests,
                'approved_requests': approved_requests,
                'pending_requests': pending_requests,
                'rejected_requests': rejected_requests,
                'popular_items': self._get_popular_items(start_date, end_date)
            }
        })
    
    def _generate_movement_report(self, start_date, end_date, category):
        """Generate stock movement/transaction report"""
        queryset = StockLog.objects.select_related('item', 'changed_by').all()
        
        # Apply date filters
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Apply category filter
        if category != 'all':
            queryset = queryset.filter(item__category__name=category)
        
        # Calculate summary stats
        total_movements = queryset.count()
        stock_in = queryset.filter(change__gt=0).aggregate(
            Sum('change'))['change__sum'] or 0
        stock_out = abs(queryset.filter(change__lt=0).aggregate(
            Sum('change'))['change__sum'] or 0)
        
        return Response({
            'type': 'movement',
            'data': self._serialize_movement_data(queryset),
            'stats': {
                'total_movements': total_movements,
                'stock_in': stock_in,
                'stock_out': stock_out,
                'most_active_items': self._get_most_active_items(start_date, end_date)
            }
        })
    
    def _generate_teacher_report(self, start_date, end_date, category):
        """Generate teacher-specific usage report"""
        queryset = Request.objects.select_related(
            'item', 'user', 'user__teacher_profile'
        ).filter(user__role='teacher')
        
        # Apply date filters
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Apply category filter
        if category != 'all':
            queryset = queryset.filter(item__category__name=category)
        
        # Group by teacher and calculate stats
        teacher_stats = queryset.values(
            'user__id',
            'user__username',
            'user__email'
        ).annotate(
            total_requests=Count('id'),
            approved_requests=Count('id', filter=Q(status='approved')),
            total_items=Sum('quantity'),
            categories_used=Count('item__category', distinct=True)
        ).order_by('-total_requests')
        
        return Response({
            'type': 'teacher',
            'data': list(teacher_stats),
            'stats': {
                'total_teachers': teacher_stats.count(),
                'most_active_teacher': self._get_most_active_teacher(start_date, end_date),
                'most_requested_items': self._get_popular_items(start_date, end_date, limit=5)
            }
        })
    
    # Helper methods for data aggregation
    def _get_category_stats(self):
        return Category.objects.annotate(
            item_count=Count('inventoryitem'),
            low_stock=Count('inventoryitem', filter=Q(
                inventoryitem__quantity__lte=F('inventoryitem__low_stock_threshold'),
                inventoryitem__quantity__gt=0
            )),
            out_of_stock=Count('inventoryitem', filter=Q(
                inventoryitem__quantity=0
            ))
        ).values('name', 'item_count', 'low_stock', 'out_of_stock')
    
    def _get_popular_items(self, start_date, end_date, limit=5):
        queryset = Request.objects.filter(status='approved')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.values(
            'item__name',
            'item__category__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            request_count=Count('id')
        ).order_by('-total_quantity')[:limit]
    
    def _get_most_active_items(self, start_date, end_date, limit=5):
        queryset = StockLog.objects.all()
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.values(
            'item__name',
            'item__category__name'
        ).annotate(
            movement_count=Count('id'),
            net_change=Sum('change')
        ).order_by('-movement_count')[:limit]
    
    def _get_most_active_teacher(self, start_date, end_date):
        queryset = Request.objects.filter(user__role='teacher')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        result = queryset.values(
            'user__username'
        ).annotate(
            request_count=Count('id')
        ).order_by('-request_count').first()
        
        return result or {'user__username': 'N/A', 'request_count': 0}
    
    def _serialize_movement_data(self, queryset):
        return list(queryset.values(
            'timestamp',
            'item__name',
            'item__category__name',
            'change',
            'quantity_after_change',
            'reason',
            'changed_by__username'
        ).order_by('-timestamp'))


class ExportReportView(APIView):
    """
    API endpoint for exporting reports in various formats (PDF, Excel)
    """
    
    def get(self, request):
        export_format = request.query_params.get('format', 'pdf')
        report_type = request.query_params.get('type', 'stock')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        category = request.query_params.get('category', 'all')
        
        # Get the data
        report_view = ReportView()
        response = report_view.get(request)
        
        if response.status_code != status.HTTP_200_OK:
            return response
        
        data = response.data
        
        # Generate export file
        if export_format == 'pdf':
            return self._export_pdf(report_type, data)
        elif export_format == 'excel':
            return self._export_excel(report_type, data)
        else:
            return Response(
                {'error': 'Unsupported export format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _export_pdf(self, report_type, data):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        styles = getSampleStyleSheet()
        
        # Add title
        title = f"{report_type.replace('_', ' ').title()} Report"
        elements.append(Paragraph(title, styles['Title']))
        
        # Add date range if available
        if data.get('stats', {}).get('date_range'):
            elements.append(Paragraph(
                f"Date Range: {data['stats']['date_range']}", 
                styles['Normal']
            ))
        
        # Add appropriate table based on report type
        if report_type == 'stock':
            table_data = self._prepare_stock_table(data['data'])
        elif report_type == 'requests':
            table_data = self._prepare_request_table(data['data'])
        elif report_type == 'movement':
            table_data = self._prepare_movement_table(data['data'])
        else:
            table_data = [['No data available']]
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        
        # Add summary stats if available
        if data.get('stats'):
            elements.append(Paragraph("Summary Statistics", styles['Heading2']))
            stats_text = "\n".join(
                f"{k.replace('_', ' ').title()}: {v}" 
                for k, v in data['stats'].items() 
                if not isinstance(v, (list, dict))
            )
            elements.append(Paragraph(stats_text, styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="{report_type}_report.pdf"'
        )
        return response
    
    def _export_excel(self, report_type, data):
        buffer = BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet(report_type[:31])  # Sheet name max 31 chars
        
        # Add header format
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#D3D3D3',
            'border': 1,
            'align': 'center'
        })
        
        # Add data based on report type
        if report_type == 'stock':
            headers = ["Item", "Category", "Current Stock", "Low Threshold", "Usage", "Status"]
            table_data = self._prepare_stock_table(data['data'])
        elif report_type == 'requests':
            headers = ["Teacher", "Item", "Quantity", "Status", "Date", "Notes"]
            table_data = self._prepare_request_table(data['data'])
        elif report_type == 'movement':
            headers = ["Date", "Item", "Category", "Change", "New Qty", "Reason", "Changed By"]
            table_data = self._prepare_movement_table(data['data'])
        else:
            headers = ["Data"]
            table_data = [["No data available"]]
        
        # Write headers
        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)
        
        # Write data
        for row, row_data in enumerate(table_data[1:], start=1):
            for col, cell_data in enumerate(row_data):
                worksheet.write(row, col, cell_data)
        
        # Add charts for certain reports
        if report_type == 'stock' and len(table_data) > 1:
            chart = workbook.add_chart({'type': 'column'})
            chart.add_series({
                'name': 'Stock Levels',
                'categories': f'={report_type[:31]}!$A$2:$A${len(table_data)}',
                'values': f'={report_type[:31]}!$C$2:$C${len(table_data)}',
            })
            worksheet.insert_chart('H2', chart)
        
        workbook.close()
        buffer.seek(0)
        
        response = HttpResponse(
            buffer,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = (
            f'attachment; filename="{report_type}_report.xlsx"'
        )
        return response
    
    # Table preparation helpers
    def _prepare_stock_table(self, data):
        table = [["Item", "Category", "Current Stock", "Low Threshold", "Usage", "Status"]]
        for item in data:
            table.append([
                item['name'],
                item['category']['name'],
                item['quantity'],
                item['low_stock_threshold'],
                abs(item.get('usage', 0)),
                item['status'].replace('_', ' ').title()
            ])
        return table
    
    def _prepare_request_table(self, data):
        table = [["Teacher", "Item", "Quantity", "Status", "Date", "Notes"]]
        for req in data:
            table.append([
                req['user']['username'],
                req['item']['name'],
                req['quantity'],
                req['status'].title(),
                req['created_at'],
                req.get('notes', '')[:50]  # Truncate long notes
            ])
        return table
    
    def _prepare_movement_table(self, data):
        table = [["Date", "Item", "Category", "Change", "New Qty", "Reason", "Changed By"]]
        for movement in data:
            table.append([
                movement['timestamp'],
                movement['item__name'],
                movement['item__category__name'],
                movement['change'],
                movement['quantity_after_change'],
                movement['reason'],
                movement['changed_by__username'] or 'System'
            ])
        return table