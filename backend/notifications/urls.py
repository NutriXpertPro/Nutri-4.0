from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, unread_notifications_htmx

app_name = "notification"

router = DefaultRouter()
router.register(r"notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("", include(router.urls)),
    path("unread-htmx/", unread_notifications_htmx, name="unread_notifications_htmx"),
]
