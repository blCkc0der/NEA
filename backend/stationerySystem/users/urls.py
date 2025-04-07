from django.urls import path
# Importing views (API endpoints) from the users/api.py module
from .api import (
    SignUpView,
    LoginView,
    ClassListCreateView,
    ClassDetailView,
    SubjectListCreateView,
    SubjectDetailView,
    TeacherProfileView,
    TeacherClassesView,
    TeacherClassDetailView
)

#  URL patterns for user-related API endpoints
urlpatterns = [
    # User registration and login endpoints (RESTful design, URL routing)
    path('signup/', SignUpView.as_view(), name='signup'),   # handles user registration
    path('login/', LoginView.as_view(), name='login'), # handles user login and token returns
    
    # Class management (List, Create, Retrieve, Update, Delete)
    path('classes/', ClassListCreateView.as_view(), name='class-list'),  # view of create classes
    path('classes/<int:pk>/', ClassDetailView.as_view(), name='class-detail'),  # Get, update or delete a specific class

    # Subject management
    path('subjects/', SubjectListCreateView.as_view(), name='subject-list'), # view of create subjects
    path('subjects/<int:pk>/', SubjectDetailView.as_view(), name='subject-detail'), # modify a specific subject

    # Teacher profile and class-subject assignment endpoints
    path('teachers/profile/', TeacherProfileView.as_view(), name='teacher-profile'),    # get or update teacher profile
    path('teachers/classes/', TeacherClassesView.as_view(), name='teacher-classes'),    # View all classes a teacher is assigned to
    path('teachers/classes/<int:pk>/',TeacherClassDetailView.as_view(), name='teacher_class_detail'), # Modify a specific class-subject assignment
]