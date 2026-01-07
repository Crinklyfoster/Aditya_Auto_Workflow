from django.urls import path
from .views import login_view, protected_view

urlpatterns = [
    path('login/', login_view),
    path('protected/', protected_view),
]
