from django.urls import path
from .api import (
    CategoryListView,
    InventoryItemView,
    InventoryItemDetailView,
    TeacherInventoryView,
    TeacherInventoryDetailView,
    InventoryDeductView
)

urlpatterns = [
    # Main Inventory URLs
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('inventory/', InventoryItemView.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', InventoryItemDetailView.as_view(), name='inventory-detail'),
    path('inventory/items/<int:pk>/deduct/', InventoryDeductView.as_view(), name='inventory-deduct'), 
    
    # Teacher Inventory URLs
    path('teacher/inventory/',TeacherInventoryView.as_view(), name='teacher-inventory-list'),
    path('teacher/inventory/<int:pk>/',TeacherInventoryDetailView.as_view(), name='teacher-inventory-detail'),
]