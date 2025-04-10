from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Category, InventoryItem, TeacherInventoryItem
from .serializers import (
    CategorySerializer,
    InventoryItemSerializer,
    TeacherInventorySerializer
)

# ---------------------
# CATEGORY MANAGEMENT
# ---------------------

class CategoryListView(APIView):
    permission_classes = []  # Explicitly allow unauthenticated access

    def get(self, request):
        # Fetch all stationery categories
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Create a new category, automatically mark it as custom
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(is_custom=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------------
# INVENTORY ITEMS CRUD
# ---------------------

class InventoryItemView(APIView):
    permission_classes = []  # Explicitly allow unauthenticated access

    def get(self, request):
        # List all inventory items with related categories
        items = InventoryItem.objects.select_related('category').all()
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Create a new inventory item
        serializer = InventoryItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------------
# DEDUCT INVENTORY ITEMS
# ---------------------
# Defensive programming (stock validation)

class InventoryDeductView(APIView):
    permission_classes = []  # Set permissions as needed

    def post(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk)
            quantity = request.data.get('quantity', 0)
            
            # Defensive check: ensure quantity is available
            if item.quantity < quantity:
                return Response(
                    {"error": "Not enough items in inventory"},
                    status=status.HTTP_400_BAD_REQUEST
                )

             # Deduct and update item quantity    
            item.quantity -= quantity
            item.save()
            
             # Update status if item is now low
            if item.quantity <= item.low_stock_threshold:
                item.status = 'low_stock'
                item.save()
            
            return Response(
                InventoryItemSerializer(item).data,
                status=status.HTTP_200_OK
            )
            
        except InventoryItem.DoesNotExist:
            return Response(
                {"error": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )
# ---------------------
# INVENTORY ITEM DETAIL VIEW
# ---------------------
# Object-oriented encapsulation and RESTful endpoints

class InventoryItemDetailView(APIView):
    permission_classes = []  # Explicitly allow unauthenticated access

    def get_object(self, pk):
        try:
            return InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return None
    
    def get(self, request, pk):
        item = self.get_object(pk)
        if item:
            serializer = InventoryItemSerializer(item)
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        item = self.get_object(pk)
        if item:
            serializer = InventoryItemSerializer(item, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        item = self.get_object(pk)
        if item:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)

# ---------------------
# TEACHER INVENTORY ASSIGNMENTS
# ---------------------

class TeacherInventoryView(APIView):
    permission_classes = []  # Already set, kept for clarity

    def get(self, request):
        # List all teacher-assigned inventory (for admin/manager review)
        items = TeacherInventoryItem.objects.select_related('item', 'item__category').all()
        serializer = TeacherInventorySerializer(items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Assign a stationery item to a teacher
        serializer = TeacherInventorySerializer(
            data=request.data,
            context={'request': request}  # Context for serializer (optional)
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeacherInventoryDetailView(APIView):
    permission_classes = []  

    def get_object(self, pk):
        try:
            return TeacherInventoryItem.objects.get(pk=pk)
        except TeacherInventoryItem.DoesNotExist:
            return None
    
    def get(self, request, pk):
        item = self.get_object(pk)
        if item:
            serializer = TeacherInventorySerializer(item)
            return Response(serializer.data)
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        item = self.get_object(pk)
        if item:
            serializer = TeacherInventorySerializer(
                item, 
                data=request.data,
                context={'request': request}  # Kept context
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        item = self.get_object(pk)
        if item:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)