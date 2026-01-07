import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class DemoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization")

        if not header:
            return None

        try:
            prefix, token = header.split(" ")
            if prefix.lower() != "bearer":
                raise AuthenticationFailed("Invalid token prefix")

            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )
        except Exception:
            raise AuthenticationFailed("Invalid or expired token")

        return (payload, None)
