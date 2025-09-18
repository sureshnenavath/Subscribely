from rest_framework import serializers
from .models import Payment, WebhookEvent

class PaymentSerializer(serializers.ModelSerializer):
    plan = serializers.SerializerMethodField(read_only=True)
    subscription_id = serializers.IntegerField(source='subscription.id', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'amount', 'method', 'status', 'razorpay_payment_id', 'payment_date', 'plan', 'subscription_id']
        read_only_fields = ['id', 'payment_date', 'plan', 'subscription_id']

    def get_plan(self, obj):
        try:
            return obj.subscription.plan.name
        except Exception:
            return None

class WebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEvent
        fields = ['id', 'event_type', 'processed', 'created_at']
        read_only_fields = ['id', 'created_at']