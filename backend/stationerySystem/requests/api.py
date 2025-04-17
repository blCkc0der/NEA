from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny  # Allow anyone in development
from .models import Request
from .serializers import RequestSerializer, RequestUpdateSerializer
from django.db import transaction   # Transaction ensures atomic updates
from django.contrib.auth import get_user_model
from inventory.models import InventoryItem


User = get_user_model()

class RequestViewSet(viewsets.ModelViewSet):
    serializer_class = RequestSerializer
    permission_classes = [AllowAny]  # In production, restrict this

    """
        Returns a queryset depending on the user's role.
        Admins and stock managers can see all requests,
        while teachers only see their own.
    """
    def get_queryset(self):
        queryset = Request.objects.select_related(
            'user__teacher_profile',
            'item'
        ).prefetch_related(
            'user__teacher_profile__teacherclasssubject_set__class_taught',
            'user__teacher_profile__teacherclasssubject_set__subject'
        )   # Complex cross-table joins with select_related & prefetch_related

        user = self.request.user
        if not user.is_authenticated:
            # In development, return all requests if unauthenticated
            return Request.objects.all()
        # Use the 'role' field for queryset filtering
        if user.role in ['stock_manager', 'admin']:
            return Request.objects.all()
        return Request.objects.filter(user=user)    # Filter for teacher-specific view

    def create(self, request, *args, **kwargs):
        """
        Handles creation of a new request. If the user is not authenticated,
        defaults to the first teacher (for development only).
        Supports single and bulk request creation.
        """
        user = self.request.user
        if not user.is_authenticated:
            # Use a default user for development (e.g., first teacher or superuser)
            try:
                user = User.objects.filter(role='teacher').first() or User.objects.first()
                if not user:
                    return Response(
                        {"error": "No users exist in the database for development"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": "Create at least one user for development"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Use properties for object-level checks
            #  Role-based authorization logic
            if not user.is_teacher and not user.is_admin:
                return Response(
                    {"error": "Only teachers can create requests"},
                    status=status.HTTP_403_FORBIDDEN
                )

        data = request.data

        # Support for bulk creation of requests
        if isinstance(data, list):  # Handle bulk creation
            serializer = self.get_serializer(data=data, many=True)
        else:
            serializer = self.get_serializer(data=data)
            
        serializer.is_valid(raise_exception=True)
        
        # Use of transactions for data integrity
        with transaction.atomic():
            instances = serializer.save(user=user)
            if not isinstance(instances, list):
                instances = [instances]
            
            for instance in instances:
                # Prevent over-requesting inventory
                if instance.quantity > instance.item.quantity:
                    return Response(
                        {"error": f"Requested quantity exceeds available stock for {instance.item.name}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['patch'], permission_classes=[AllowAny])
    def update_status(self, request, pk=None):
        """
        Updates the status of a request 
        Only stock managers or admins can perform this.
        """
        user = self.request.user
        if not user.is_authenticated:
            # Use a default stock manager for development
            try:
                user = User.objects.filter(role='stock_manager').first() or User.objects.first()
                if not user:
                    return Response(
                        {"error": "No stock managers exist in the database for development"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": "Create at least one user for development"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Use properties for object-level checks
            if not user.is_stock_manager and not user.is_admin:
                return Response(
                    {"error": "Only stock managers can update request status"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
        request_instance = self.get_object()
        serializer = RequestUpdateSerializer(request_instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            serializer.save(stock_manager=user)
            # Deduct inventory if approved
            if serializer.data['status'] == Request.APPROVED:
                if request_instance.quantity > request_instance.item.quantity:
                    return Response(
                        {"error": "Not enough items in stock"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                request_instance.item.quantity -= request_instance.quantity
                request_instance.item.save()
                
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Allows updating specific fields.
        If approved, automatically deducts from inventory.
        """
        instance = self.get_object()
        new_status = request.data.get('status')
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        # Update status
        instance.status = new_status
        instance.save()

        # If approved, deduct from inventory
        if new_status == 'approved' and item_id and quantity:
            try:
                item = InventoryItem.objects.get(id=item_id)
                if item.quantity >= quantity:
                    item.quantity -= quantity
                    item.save()
                else:
                    return Response(
                        {"error": "Not enough items in inventory"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except InventoryItem.DoesNotExist:
                return Response(
                    {"error": "Item not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """
        Shortcut endpoint to quickly approve a request.
        """
        request_obj = self.get_object()
        serializer = self.get_serializer(
            request_obj, 
            data={'status': 'approved'}, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)