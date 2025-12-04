from rest_framework_nested.routers import NestedSimpleRouter, DefaultRouter
from django.urls import path, include
from .views import ConversationViewSet, MessageViewSet, inbox_view

app_name = "messages"

router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")

conversations_router = NestedSimpleRouter(
    router, r"conversations", lookup="conversation"
)
conversations_router.register(
    r"messages", MessageViewSet, basename="conversation-message"
)

urlpatterns = [
    path("", include(router.urls)),
    path("", include(conversations_router.urls)),
    path("inbox/", inbox_view, name="inbox"),
]
