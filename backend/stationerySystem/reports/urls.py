from django.urls import path
from .api import ReportView, ReportExportView   # Importing views that handle report generation and export

urlpatterns = [
    # Route for generating and returning dynamic JSON report data
    # Supports different types (stock, teacher, request) and date filtering via query parameters
    path('reports/', ReportView.as_view(), name='reports'),

    # 🔹 Route for exporting reports to Excel or PDF
    # Demonstrates dynamic object/file generation based on user-defined filters
    path('reports/export/', ReportExportView.as_view(), name='export-reports'),
]