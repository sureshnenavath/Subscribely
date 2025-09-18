from django.contrib import admin
from django.urls import path, include
from subscriptions import views as subscriptions_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    # Align endpoints with assessment description
    path('api/plans/', include('subscriptions.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/payments/', include('payments.urls')),
    # Use gateway path used in assessment
    path('api/webhooks/gateway/', include('payments.webhook_urls')),
    # Direct mapping for checkout create-session so POST requests hit subscribe_to_plan
    path('api/checkout/create-session/', subscriptions_views.subscribe_to_plan),
]