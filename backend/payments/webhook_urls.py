from django.urls import path
from . import views

urlpatterns = [
    # Single gateway endpoint used by assessment: POST /api/webhooks/gateway/
    path('', views.razorpay_webhook, name='gateway_webhook'),
]