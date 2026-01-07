from django.contrib import admin
from .models import DemoUser

@admin.register(DemoUser)
class DemoUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'created_at')
