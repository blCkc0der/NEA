from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'    # Uses BigAutoField for PKs 
    name = 'notifications'  # Register the app under this labe

    def ready(self):
        """
        Called when the app is fully loaded.
        Used to import signals, ensuring that signal handlers (e.g., auto-generating notifications)
        are registered when the app starts.

        Demonstrates the use of event-driven architecture using Django's built-in signals framework.
        """
        from . import signals
