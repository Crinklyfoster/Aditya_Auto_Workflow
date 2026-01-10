from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import PartCodeModificationRequest
from .utils import get_current_user_email


# -------------------------
# HEALTH CHECK
# -------------------------
@api_view(["GET"])
def ping(request):
    return Response({"status": "ok"})


# -------------------------
# CREATE REQUEST (DEMO)
# -------------------------
@api_view(["POST"])
def submit_part_code_demo(request):
    data = request.data
    user_email = get_current_user_email(request)
    now = timezone.now()

    obj = PartCodeModificationRequest.objects.create(
        plant=data.get("plant"),
        sap_part_code=data.get("sapPartCode"),
        new_material_description=data.get("newDescription"),
        hsn_code=data.get("hsnCode"),
        from_state_to_state=data.get("fromToState"),
        tax=data.get("taxPercent"),
        sales_views=data.get("salesViews"),
        supplying_plant=data.get("supplyingPlant"),
        receiving_plant=data.get("receivingPlant"),
        tax_indication_of_the_material=data.get("taxIndication"),
        procurement_type=data.get("procurementType"),
        activate_storage_location=data.get("storageLocation"),
        production_version_update=data.get("productionVersion"),
        quality_management=data.get("qualityManagement"),
        remarks=data.get("remarks"),

        status="PENDING_FOR_APPROVAL",
        created_by=user_email,

        # IMPORTANT (manual timestamps for legacy DB)
        created=now,
        last_modified=now,
        submitted_at=now,
    )

    return Response(
        {"id": obj.id, "status": obj.status},
        status=status.HTTP_201_CREATED,
    )


# -------------------------
# MY REQUESTS
# -------------------------
@api_view(["GET"])
def my_requests(request):
    function = request.GET.get("function")

    if function == "all" or not function:
        qs = PartCodeModificationRequest.objects.all()
    elif function == "part-code-modification":
        qs = PartCodeModificationRequest.objects.all()
    else:
        qs = PartCodeModificationRequest.objects.none()

    qs = qs.order_by("-created")

    data = [
        {
            "id": r.id,
            "plant": r.plant,
            "created_by": r.created_by,
            "sap_part_code": r.sap_part_code,
            "new_material_description": r.new_material_description,
            "status": r.status,
            "approver": r.approved_by,
            "created": r.created,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        }
        for r in qs
    ]

    return Response(data)


# --------------------------------------------------
# APPROVE REQUESTS – FETCH QUEUE
# --------------------------------------------------
@api_view(["GET"])
def approve_requests(request):
    function_key = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.filter(
        status="PENDING_FOR_APPROVAL"
    )

    # Optional function filter (future-proof)
    if function_key and function_key != "all":
        if function_key == "part-code-modification":
            qs = qs  # only model implemented for now
        else:
            qs = qs.none()

    data = []
    for r in qs.order_by("-submitted_at"):
        data.append({
            "id": r.id,
            "function": "Part Code Modification",
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "submission_date": r.submitted_at,
            "status": r.status,
            "approver": r.approved_by,
            "previous_remarks": r.remarks,
            "modified_date": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        })

    return Response(data)


# --------------------------------------------------
# APPROVE REQUEST – ACTION
# --------------------------------------------------

@api_view(["POST"])
def approve_request_action(request, id):
    try:
        req = PartCodeModificationRequest.objects.get(id=id)
    except PartCodeModificationRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    if req.status != "PENDING_FOR_APPROVAL":
        return Response(
            {"error": "Invalid state transition"},
            status=400
        )

    action = request.data.get("action")
    remarks = request.data.get("remarks", "").strip()
    actor = request.user if request.user.is_authenticated else "APPROVER"

    if action not in ["APPROVE", "REJECT", "RETURN"]:
        return Response({"error": "Invalid action"}, status=400)

    if action in ["REJECT", "RETURN"] and not remarks:
        return Response(
            {"error": "Remarks are mandatory"},
            status=400
        )

    if action == "APPROVE":
        req.status = "APPROVED"
        req.approved_at = timezone.now()
        req.approved_by = actor
        req.remarks = remarks or "Approved"

    elif action == "REJECT":
        req.status = "REJECTED"
        req.rejected_at = timezone.now()
        req.rejected_by = actor
        req.remarks = remarks

    elif action == "RETURN":
        req.status = "RETURNED_FOR_CORRECTION"
        req.last_returned_by_role = "APPROVER"
        req.remarks = remarks

    req.save()

    return Response({
        "id": req.id,
        "status": req.status
    }, status=status.HTTP_200_OK)

@api_view(["GET"])
def validation_requests(request):
    qs = PartCodeModificationRequest.objects.filter(status="APPROVED")

    data = []
    for r in qs:
        data.append({
            "id": r.id,
            "function": "part-code-modification",
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "submission_date": r.submitted_at,
            "status": r.status,
            "approver": r.approved_by,
            "reason_for_return": r.sap_remarks_only_for_sap_validation_member_access,
            "modified_date": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        })

    return Response(data)

@api_view(["POST"])
def validation_request_action(request, request_id):
    try:
        req = PartCodeModificationRequest.objects.get(id=request_id)
    except PartCodeModificationRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    if req.status != "APPROVED":
        return Response(
            {"error": "Only approved requests can be validated"},
            status=400
        )

    action = request.data.get("action")
    remarks = request.data.get("remarks", "").strip()
    validator = get_current_user_email(request)

    if action not in ["APPROVE", "REJECT", "RETURN"]:
        return Response({"error": "Invalid action"}, status=400)

    if not remarks:
        return Response({"error": "Remarks are mandatory"}, status=400)

    # ---- ACTION HANDLING ----
    if action == "APPROVE":
        req.status = "VALIDATED"
        req.sap_validation_status = "VALID"
        req.sap_validated_at = timezone.now()
        req.sap_validated_by = validator

    elif action == "REJECT":
        req.status = "REJECTED"
        req.sap_validation_status = "INVALID"
        req.rejected_at = timezone.now()
        req.rejected_by = validator

    elif action == "RETURN":
        req.status = "RETURNED_FOR_CORRECTION"
        req.sap_validation_status = "INVALID"
        req.last_returned_by_role = "VALIDATOR"

    req.sap_remarks_only_for_sap_validation_member_access = remarks
    req.save()

    return Response({"status": req.status})

