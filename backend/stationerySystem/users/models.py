from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _

# Entity: Subject - Represents a school subject.
class Subject(models.Model):
    # Custom field constraints
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

#  Entity: Class - Represents a class in the school.
class Class(models.Model):
    name = models.CharField(max_length=100, unique=True)
    grade_level = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} (Grade {self.grade_level})"

# Entity: TeacherProfile - Extends user with teacher-specific data.
class TeacherProfile(models.Model):
    # One-to-one relationship (OOP modeling)
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )

    #  Many-to-many through intermediate table
    classes_taught = models.ManyToManyField(
        Class,
        through='TeacherClassSubject',
        related_name='teachers'
    )
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()}'s Profile"

# Entity: TeacherClassSubject - Connects a teacher with a class and subject.
class TeacherClassSubject(models.Model):
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE)
    class_taught = models.ForeignKey(Class, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    # Composite uniqueness constraint
    class Meta:
        unique_together = ('teacher', 'class_taught', 'subject')
    
    def __str__(self):
        return f"{self.teacher.user.get_full_name()} teaches {self.subject} for {self.class_taught}"
    

# Custom UserManager for creating standard users and superusers.
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and saves a user with the given email and password.
        """
        if not email:
            # Input validation
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        # OOP - dynamic object creation
        user = self.model(email=email, **extra_fields)
        # Secure password hashing
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email and password.
        """
        # # Set required admin flags
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

         # Validation checks
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


# Custom User Model - Handles authentication and user roles.
class User(AbstractBaseUser, PermissionsMixin): # Inheritance and polymorphism
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('stock_manager', 'Stock Manager'),
        ('teacher', 'Teacher'),
    )

    email = models.EmailField(_('email address'), unique=True)  # Email-based login
    first_name = models.CharField(_('first name'), max_length=100, blank=True)
    last_name = models.CharField(_('last name'), max_length=100, blank=True)
    role = models.CharField(
        _('role'), max_length=20, 
        choices=ROLE_CHOICES, default='teacher', 
        help_text=_('Designates the role of the user.'))
    is_staff = models.BooleanField(_('staff status'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    # Auto-timestamps
    date_joined = models.DateTimeField(_('date joined'),auto_now_add=True, help_text=_('The date and time when the user joined.'))

    # Custom user manager for creation logic
    objects = UserManager()

    #  Email as unique login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ('-date_joined',)

    def __str__(self):
        return self.email
    
    # Utility method
    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = f'{self.first_name} {self.last_name}'
        return full_name.strip()

    def get_short_name(self):
        """
        Returns the short name for the user (usually the first name).
        """
        return self.first_name

    # # Role-based properties for routing/permissions
    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_stock_manager(self):
        return self.role == 'stock_manager'

    @property
    def is_teacher(self):
        return self.role == 'teacher'