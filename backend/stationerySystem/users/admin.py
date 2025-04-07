from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Customising the admin interface for the User model.
class CustomUserAdmin(UserAdmin):
    # Fields displayed in the list view of the admin interface
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')

    # Filters available in admin panel
    list_filter = ('role', 'is_staff', 'is_active')

    # Grouping fields shown when viewing or editing a user
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields':('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
       # ('Important Dates', {'fields': ('date_joined',)}),
    )

    # Fields shown when adding a new user via the admi
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_staff', 'is_active'),
        }),
    )

    # Enable searching for users by key fields
    search_fields = ('email', 'first_name', 'last_name')

    # Default ordering for user listings
    ordering = ('email',)

# Registering the custom UserAdmin for the User model
admin.site.register(User, CustomUserAdmin)

# Registering other user-related models in the admin interface
from .models import Class, Subject, TeacherClassSubject, TeacherProfile

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'grade_level')
    search_fields = ('name', 'grade_level')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )

@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio' )
    search_fields = ('user_email', 'user_first_name', 'user_last_name')

@admin.register(TeacherClassSubject)
class TeacherClassSubjectAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'class_taught', 'subject')
    search_fields = ('class_taught', 'subject' )
