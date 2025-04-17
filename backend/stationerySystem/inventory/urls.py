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
    # ---------------------------
    # Main Inventory URLs
    # ---------------------------

    # Fetch or create categories (e.g. "Pens", "Paper")
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # View all inventory items or add new ones
    path('inventory/', InventoryItemView.as_view(), name='inventory-list'),

    # Retrieve, update, or delete a specific inventory item by ID
    path('inventory/<int:pk>/', InventoryItemDetailView.as_view(), name='inventory-detail'),

    # Deduct item quantity from stock (e.g. upon teacher request)
    # Demonstrates partial state-changing backend endpoint
    path('inventory/items/<int:pk>/deduct/', InventoryDeductView.as_view(), name='inventory-deduct'), 
    
    # ---------------------------
    # Teacher Inventory URLs
    # ---------------------------

    # View or assign inventory to teachers
    path('teacher/inventory/',TeacherInventoryView.as_view(), name='teacher-inventory-list'),

     # View or assign inventory to teachers
    path('teacher/inventory/<int:pk>/',TeacherInventoryDetailView.as_view(), name='teacher-inventory-detail'),
]