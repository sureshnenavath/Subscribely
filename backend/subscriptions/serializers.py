from rest_framework import serializers
from .models import Plan, Subscription

class PlanSerializer(serializers.ModelSerializer):
    features = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = ['id', 'name', 'monthly_price', 'yearly_price', 'features', 'trial_days']

    def get_features(self, obj):
        return obj.features_list

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'plan_id', 'status', 'start_date', 'end_date', 'cancel_date', 'created_at']
        read_only_fields = ['id', 'status', 'start_date', 'end_date', 'cancel_date', 'created_at']

class SubscribeSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    is_yearly = serializers.BooleanField(default=False)