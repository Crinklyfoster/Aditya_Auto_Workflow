from django.urls import path
from .views import (
    ping,

    # CREATE / CREATOR
    create_requests,            # Create Requests
    created_requests,           # Created Requests (history)

    # INSTANCE (VIEW / CORRECTION)
    request_detail,         # View single request
               

    # APPROVER
    approve_requests,           # Approver queue
    approve_request_action,     # Approver action
    approved_requests,          # Approver history

    # VALIDATOR
    validation_requests,        # Validator queue
    validation_request_action,  # Validator action
    validated_requests,         # Validator history
)

urlpatterns = [
    # -------------------------
    # HEALTH
    # -------------------------
    path("ping/", ping),

    # -------------------------
    # CREATE / CREATOR
    # -------------------------
    path("create-requests/", create_requests),
    path("created-requests/", created_requests),

    # -------------------------
    # INSTANCE VIEW / CORRECTION
    # -------------------------
    path("requests/<int:id>/", request_detail),      # GET & # PUT
            

    # -------------------------
    # APPROVER
    # -------------------------
    path("approve-requests/", approve_requests),
    path("approve-requests/<int:id>/action/", approve_request_action),
    path("approved-requests/", approved_requests),

    # -------------------------
    # VALIDATOR
    # -------------------------
    path("validation-requests/", validation_requests),
    path(
        "validation-requests/<int:request_id>/action/",
        validation_request_action,
    ),
    path("validated-requests/", validated_requests),
]
