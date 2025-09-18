from django.contrib import admin
from .models import Payment, WebhookEvent

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'method', 'status', 'razorpay_payment_id', 'payment_date')
    list_filter = ('status', 'method', 'payment_date')
    search_fields = ('user__email', 'razorpay_payment_id', 'razorpay_order_id')
    readonly_fields = ('payment_date', 'created_at')

@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'processed', 'created_at')
    list_filter = ('event_type', 'processed', 'created_at')
    readonly_fields = ('created_at',)