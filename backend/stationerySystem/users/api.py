import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import TeacherProfile, TeacherClassSubject, Class, Subject
from .serializers import (
    ClassSerializer,
    SubjectSerializer,
    TeacherProfileSerializer,
    TeacherClassSubjectSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Request object handling and form-style validation
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('firstName')
        last_name = request.data.get('lastName')
        bio = request.data.get('bio', '')
        class_subjects = request.data.get('classSubjects', [])

        if not all([email, password, first_name, last_name]):
            return Response(
                {"error": "Email, password, first name, and last name are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not class_subjects:
            return Response(
                {"error": "Please add at least one class and subject you teach."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Aggregate query (checking for duplicate users)
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Dynamic object creation using OOP model
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='teacher',
            )

            profile = TeacherProfile.objects.create(user=user, bio=bio)

            # Iterative processing (looping through class-subject pairs)
            for cs in class_subjects:
                try:
                    class_obj = Class.objects.get(id=cs['classId'])
                    subject_obj = Subject.objects.get(id=cs['subjectId'])

                    # Dynamic generation of cross-table objects
                    TeacherClassSubject.objects.create(
                        teacher=profile,
                        class_taught=class_obj,
                        subject=subject_obj
                    )
                except (Class.DoesNotExist, Subject.DoesNotExist) as e:
                    logger.warning(f"Invalid class or subject ID during signup: {str(e)}")
                    continue
            
            # Token-based authentication (JWT)
            refresh = RefreshToken.for_user(user)
            serializer = TeacherProfileSerializer(profile)
            return Response(
                {
                    "message": "Teacher account created successfully.",
                    "profile": serializer.data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }
                },
                status=status.HTTP_201_CREATED
            )

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Teacher signup error: {str(e)}")
            return Response(
                {"error": "An error occurred during teacher signup."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Request/response object handling and user authentication
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Custom logic for role-based access
        if role and user.role != role:
            return Response(
                {"error": f"You don't have permission to log in as a {role}."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Server-side generation of authentication tokens (JWT)
        refresh = RefreshToken.for_user(user)
        serializer = TeacherProfileSerializer(user.teacher_profile) if user.is_teacher else None
        return Response(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
                "profile": serializer.data if serializer else None,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK
        )
    
# Generic class-based views (CRUD with permission control)
class ClassListCreateView(generics.ListCreateAPIView): # ability to view class list
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated] 

class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]  

class SubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]  

class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]  

class TeacherProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Custom object retrieval based on logged-in user
        return self.request.user.teacher_profile

    def put(self, request, *args, **kwargs):
        profile = self.get_object()
        user = request.user

        # Update TeacherProfile. (Partial update of model fields using serializers)
        profile_serializer = self.get_serializer(profile, data=request.data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()

        # Update User fields if provided. (Conditional updates and attribute access)
        if 'first_name' in request.data or 'last_name' in request.data:
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.save()

        # Return updated profile
        updated_serializer = self.get_serializer(profile)
        return Response(updated_serializer.data)

class TeacherClassesView(generics.ListCreateAPIView):
    serializer_class = TeacherClassSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Querying with filters on related fields
        return TeacherClassSubject.objects.filter(teacher=self.request.user.teacher_profile)
        
    def perform_create(self, serializer):
        # Automatically assigning foreign key based on current user
        serializer.save(teacher=self.request.user.teacher_profile)

class TeacherClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeacherClassSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeacherClassSubject.objects.filter(teacher=self.request.user.teacher_profile)
