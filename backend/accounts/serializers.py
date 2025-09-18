from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'username', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Must include identifier and password')

        # First try authenticating treating the identifier as the model's USERNAME_FIELD
        # (in this project USERNAME_FIELD is 'email')
        user = authenticate(username=identifier, password=password)

        # If that fails and identifier looks like an email, try to resolve the user by email
        if not user and '@' in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                # Since USERNAME_FIELD is email, pass the email to authenticate
                user = authenticate(username=user_obj.email, password=password)
            except User.DoesNotExist:
                user = None

        # If still no user and identifier does not look like an email, it may be the legacy
        # 'username' field. Find the user by username and authenticate using their email
        # because authenticate expects the USERNAME_FIELD value.
        if not user and '@' not in identifier:
            try:
                user_obj = User.objects.get(username__iexact=identifier)
                user = authenticate(username=user_obj.email, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError('Invalid credentials')

        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')

        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    has_active_subscription = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_superuser', 'has_active_subscription'
        )
        read_only_fields = ('id', 'is_staff', 'is_superuser', 'has_active_subscription')

    def get_has_active_subscription(self, obj):
        # Uses the related_name 'subscriptions' on Subscription to check for any active subscription
        try:
            return obj.subscriptions.filter(status='active').exists()
        except Exception:
            return False