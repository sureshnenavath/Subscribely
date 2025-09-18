from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import login
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
import logging

logger = logging.getLogger(__name__)

def set_jwt_cookies(response, user):
    """Set JWT tokens in HTTP-only cookies"""
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    
    response.set_cookie(
        settings.JWT_AUTH_COOKIE,
        str(access_token),
        max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        httponly=settings.JWT_AUTH_HTTPONLY,
        secure=settings.JWT_AUTH_SECURE,
        samesite=settings.JWT_AUTH_SAMESITE
    )
    
    response.set_cookie(
        settings.JWT_AUTH_REFRESH_COOKIE,
        str(refresh),
        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        httponly=settings.JWT_AUTH_HTTPONLY,
        secure=settings.JWT_AUTH_SECURE,
        samesite=settings.JWT_AUTH_SAMESITE
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        
        response = Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
        
        set_jwt_cookies(response, user)
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    data = request.data.copy()
    # Accept either 'identifier', or fallback to 'email' or 'username' keys from client
    if 'identifier' not in data:
        if 'email' in data:
            data['identifier'] = data.get('email')
        elif 'username' in data:
            data['identifier'] = data.get('username')

    serializer = UserLoginSerializer(data=data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        response = Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
        set_jwt_cookies(response, user)
        return response
    # Log validation errors to help debug failed login attempts (do not log passwords)
    try:
        identifier = data.get('identifier')
    except Exception:
        identifier = '<unknown>'
    logger.debug('Login failed for identifier=%s errors=%s', identifier, serializer.errors)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    response.delete_cookie(settings.JWT_AUTH_COOKIE)
    response.delete_cookie(settings.JWT_AUTH_REFRESH_COOKIE)
    return response

@api_view(['GET'])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)