from django.apps import AppConfig


class AnamnesisConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "anamnesis"

    def ready(self):
        import anamnesis.signals
