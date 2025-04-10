from django.contrib import admin    # Import Django admin framework
# Import inventory-related models
from .models import InventoryItem, TeacherInventoryItem, Category

# Register each model with the Django admin site to allow admin panel management
# Demonstrates Object-Oriented Design: each model represents a class instance managed via Django's built-in admin UI.

admin.site.register(InventoryItem)  # Admins can view/edit stock items
admin.site.register(TeacherInventoryItem)   # Admins can monitor items assigned to teachers
admin.site.register(Category)   # Admins can monitor items assigned to teachers
