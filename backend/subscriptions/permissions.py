from rest_framework.permissions import BasePermission

class IsActiveSubscriber(BasePermission):
    """Allows access only to users with an active subscription."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        try:
            return user.subscriptions.filter(status='active').exists()
        except Exception:
            return False
