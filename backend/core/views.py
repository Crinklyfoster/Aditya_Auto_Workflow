import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework import status

from .models import DemoUser
from .auth import DemoJWTAuthentication


@api_view(['POST'])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Email and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = DemoUser.objects.get(email=email, is_active=True)
    except DemoUser.DoesNotExist:
        return Response(
            {"error": "Invalid user"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    payload = {
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=8),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return Response({"token": token})


@api_view(['GET'])
@authentication_classes([DemoJWTAuthentication])
def protected_view(request):
    return Response({
        "message": "Authenticated",
        "user": request.user["email"]
    })
