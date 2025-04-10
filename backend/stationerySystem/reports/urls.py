from django.urls import path
from .api import ReportView, ExportReportView

urlpatterns = [
    path('reports/', ReportView.as_view(), name='reports'),
    path('reports/export/', ExportReportView.as_view(), name='export-reports'),
]
