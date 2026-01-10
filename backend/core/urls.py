from django.urls import path
from .views import (
    ping,
    submit_part_code_demo,
    my_requests,
    approve_requests,
    approve_request_action,
    validation_requests,
    validation_request_action,
)

urlpatterns = [
    path("ping/", ping),

    # CREATE REQUEST
    path("part-code/submit-demo/", submit_part_code_demo),

    # MY REQUESTS
    path("my-requests/", my_requests),

    # APPROVER
    path("approve-requests/", approve_requests),
    path("approve-requests/<int:id>/action/", approve_request_action),

    # VALIDATION
    path("validation-requests/", validation_requests),
    path("validation-requests/<int:request_id>/action/", validation_request_action),
]
