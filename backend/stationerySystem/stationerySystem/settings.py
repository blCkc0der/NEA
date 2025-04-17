from pathlib import Path
from datetime import timedelta

# Base directory of the Django project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-7$a7!1(*7p90)qvns#6$c_m&=15^uvy7m3c46n&mqfl(w#*a!+'

DEBUG = True    # Enables full error pages; only use during development
ALLOWED_HOSTS = [] # Define allowed hosts in production

# Use of custom User model (OOP skill)
AUTH_USER_MODEL = 'users.User'

# JWT Authentication configuration (Token-based Auth)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),  # Short lifespan for access tokens
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),    # Longer lifespan for refresh tokens
    'ROTATE_REFRESH_TOKENS': True,                  # Secure refresh by rotating tokens
    'BLACKLIST_AFTER_ROTATION': True,               # Old tokens will not be usable
    'UPDATE_LAST_LOGIN': False,                     #update the last login time of the user on token refresh
    'ALGORITHM': 'HS256',                           
    'SIGNING_KEY': 'your-secret-key',              
    'VERIFYING_KEY': None,                          
    'AUDIENCE': None,                               
    'ISSUER': None,                                 
    'AUTH_HEADER_TYPES': ('Bearer',),              
    'USER_ID_FIELD': "id",                          
    'USER_ID_CLAIM': 'user_id',                     
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# REST Framework settings (applies default security & authentication globally)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ], 
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', # All endpoints require authentication by default
    ],
}

# CORS (Cross-Origin Resource Sharing) Settings (important for frontend-backend integration)
CORS_ALLOW_ALL_ORIGINS = True  # Development only! Allows frontend to talk to backend

# alternately, specify allowed origins explicitely;
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", #  react/next.js frontend
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True  # Allow cookies/credentials in cross-origin requests

# Registering all installed apps (Modular architecture / SOC)
INSTALLED_APPS = [
    'django.contrib.admin', 
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Custom apps
    'users',
    'inventory',
    'notifications',
    'requests',
    'reports',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken', 
    'rest_framework_simplejwt',
    'corsheaders',
]

# Middleware (keeps the order required by Django, CORS middleware goes first)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'stationerySystem.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],     # Custom template directories if needed
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'stationerySystem.wsgi.application'

# PostgreSQL database configuration (Non-default DB config)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'db_stationery',
        'USER': 'postgres', 
        'PASSWORD': 'coder4life',
        'HOST': 'localhost',
        'PORT': '5432',

    }
}

# Password validators (boilerplate)
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator' },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
