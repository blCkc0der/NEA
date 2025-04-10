from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-7$a7!1(*7p90)qvns#6$c_m&=15^uvy7m3c46n&mqfl(w#*a!+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [] 

AUTH_USER_MODEL = 'users.User'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),  #access token lifetime
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),    #refresh token lifetime
    'ROTATE_REFRESH_TOKENS': True,                  #whether to rotate refresh tokens
    'BLACKLIST_AFTER_ROTATION': True,               #blacklist old tokens after rotation
    'UPDATE_LAST_LOGIN': False,                     #update the last login time of the user on token refresh

    'ALGORITHM': 'HS256',                           #algorithm used for signing
    'SIGNING_KEY': 'your-secret-key',               #key used for signing tokens
    'VERIFYING_KEY': None,                          #public key for verifications (if use asymmetric algorithm)
    'AUDIENCE': None,                               
    'ISSUER': None,                                 

    'AUTH_HEADER_TYPES': ('Bearer',),               #authorization header types
    'USER_ID_FIELD': "id",                          #user id field 
    'USER_ID_CLAIM': 'user_id',                     #claim to use as user id
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# Application definition
REST_FRAMEWORK = {
    
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ], 

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', #Secure all endpoint by default
    ],
}


# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True # for development only! see below for production

# alternately, specify allowed origins explicitely;
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", # your next.js dev server
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True # allow cookies to be sent with requests

INSTALLED_APPS = [
    'django.contrib.admin', 
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'users',
    'rest_framework',
    'rest_framework.authtoken', 
    'inventory',
    'rest_framework_simplejwt',
    'notifications',
    'requests',
    'corsheaders',
    'reports',
]

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
        'DIRS': [],
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


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

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


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
