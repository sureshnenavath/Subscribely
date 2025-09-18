from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate by reading the JWT access token from an HttpOnly cookie

    This falls back to the standard Authorization header if present.
    """

    def authenticate(self, request):
        # First try the Authorization header (standard behavior)
        header_auth = super().authenticate(request)
        if header_auth is not None:
            return header_auth

        # Next try cookie (name configured by settings.JWT_AUTH_COOKIE)
        cookie_name = getattr(settings, 'JWT_AUTH_COOKIE', 'access_token')
        raw_token = request.COOKIES.get(cookie_name)
        if raw_token is None:
            return None

        # raw_token may include Bearer prefix if frontend set it that way; strip if present
        if isinstance(raw_token, str) and raw_token.lower().startswith('bearer '):
            raw_token = raw_token.split(' ', 1)[1]

        validated_token = None
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception:
            return None

        return self.get_user(validated_token), validated_token
