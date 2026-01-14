from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import PartCodeModificationRequest
from .utils import get_current_user_email


# ==================================================
# HEALTH CHECK
# ==================================================
@api_view(["GET"])
def ping(request):
    return Response({"status": "ok"})


# ==================================================
# CREATE REQUEST (Create Requests page ONLY)
# ==================================================
@api_view(["POST"])
def create_requests(request):
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

        created=now,
        last_modified=now,
        submitted_at=now,
    )

    return Response(
        {"id": obj.id, "status": obj.status},
        status=status.HTTP_201_CREATED,
    )


# ==================================================
# CREATED REQUESTS (Creator History)
# ==================================================
@api_view(["GET"])
def created_requests(request):
    function = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.all()

    if function and function not in ["all", "part-code-modification"]:
        qs = qs.none()

    qs = qs.order_by("-created")

    return Response([
        {
            "id": r.id,
            "function": "part-code-modification",
            "plant": r.plant,
            "created_by": r.created_by,
            "new_material_description": r.new_material_description,
            "sap_part_code": r.sap_part_code,
            "status": r.status,
            "approver": r.approved_by,
            "submission_date": r.submitted_at,
            "reason_for_return": r.remarks,
            "last_modified": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        }
        for r in qs
    ])

@api_view(["GET", "PUT"])
def request_detail(request, id):
    try:
        r = PartCodeModificationRequest.objects.get(id=id)
    except PartCodeModificationRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    # -------------------------
    # GET → View instance
    # -------------------------
    if request.method == "GET":
        return Response({
            "id": r.id,
            "plant": r.plant,
            "sap_part_code": r.sap_part_code,
            "new_material_description": r.new_material_description,
            "hsn_code": r.hsn_code,
            "from_state_to_state": r.from_state_to_state,
            "tax": r.tax,
            "sales_views": r.sales_views,
            "supplying_plant": r.supplying_plant,
            "receiving_plant": r.receiving_plant,
            "tax_indication_of_the_material": r.tax_indication_of_the_material,
            "procurement_type": r.procurement_type,
            "activate_storage_location": r.activate_storage_location,
            "production_version_update": r.production_version_update,
            "quality_management": r.quality_management,
            "remarks": r.remarks,
            "status": r.status,
        })

    # -------------------------
    # PUT → Resubmit correction
    # -------------------------
    if request.method == "PUT":
        if r.status != "RETURNED_FOR_CORRECTION":
            return Response(
                {"error": "Only returned requests can be edited"},
                status=400,
            )

        data = request.data
        now = timezone.now()

        r.plant = data.get("plant", r.plant)
        r.sap_part_code = data.get("sap_part_code", r.sap_part_code)
        r.new_material_description = data.get(
            "new_material_description", r.new_material_description
        )
        r.hsn_code = data.get("hsn_code", r.hsn_code)
        r.from_state_to_state = data.get("from_state_to_state", r.from_state_to_state)
        r.tax = data.get("tax", r.tax)
        r.sales_views = data.get("sales_views", r.sales_views)
        r.supplying_plant = data.get("supplying_plant", r.supplying_plant)
        r.receiving_plant = data.get("receiving_plant", r.receiving_plant)
        r.tax_indication_of_the_material = data.get(
            "tax_indication_of_the_material",
            r.tax_indication_of_the_material,
        )
        r.procurement_type = data.get("procurement_type", r.procurement_type)
        r.activate_storage_location = data.get(
            "activate_storage_location",
            r.activate_storage_location,
        )
        r.production_version_update = data.get(
            "production_version_update",
            r.production_version_update,
        )
        r.quality_management = data.get(
            "quality_management",
            r.quality_management,
        )
        r.remarks = data.get("remarks", r.remarks)

        # Reset workflow
        r.status = "PENDING_FOR_APPROVAL"
        r.submitted_at = now
        r.last_modified = now
        r.save()

        return Response({"status": r.status})

# ==================================================
# APPROVER QUEUE
# ==================================================
@api_view(["GET"])
def approve_requests(request):
    function_key = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.filter(
        status="PENDING_FOR_APPROVAL"
    )

    if function_key and function_key not in ["all", "part-code-modification"]:
        qs = qs.none()

    qs = qs.order_by("-submitted_at")

    return Response([
        {
            "id": r.id,
            "function": "part-code-modification",
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "submission_date": r.submitted_at,
            "status": r.status,
            "approver": r.approved_by,
            "previous_remarks": r.remarks,
            "modified_date": r.last_modified,
        }
        for r in qs
    ])


# ==================================================
# APPROVER ACTION
# ==================================================
@api_view(["POST"])
def approve_request_action(request, id):
    try:
        req = PartCodeModificationRequest.objects.get(id=id)
    except PartCodeModificationRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    if req.status != "PENDING_FOR_APPROVAL":
        return Response({"error": "Invalid state transition"}, status=400)

    action = request.data.get("action")
    remarks = (request.data.get("remarks") or "").strip()
    actor = get_current_user_email(request)
    now = timezone.now()

    if action not in ["APPROVE", "REJECT", "RETURN"]:
        return Response({"error": "Invalid action"}, status=400)

    if action == "RETURN" and not remarks:
        return Response(
            {"error": "Remarks are mandatory for return"},
            status=400
        )

    if action == "APPROVE":
        req.status = "APPROVED"
        req.approved_at = now
        req.approved_by = actor

    elif action == "REJECT":
        req.status = "REJECTED"
        req.rejected_at = now
        req.rejected_by = actor

    elif action == "RETURN":
        req.status = "RETURNED_FOR_CORRECTION"
        req.last_returned_by_role = "APPROVER"

    if remarks:
        req.remarks = remarks

    req.last_modified = now
    req.save()

    return Response({"status": req.status})

# ==================================================
# APPROVED REQUESTS (Approver History)
# ==================================================
@api_view(["GET"])
def approved_requests(request):
    function_key = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.exclude(
        status="PENDING_FOR_APPROVAL"
    )

    # 🔑 FUNCTION FILTER
    if function_key and function_key != "all":
        if function_key != "part-code-modification":
            qs = qs.none()

    qs = qs.order_by("-last_modified")

    data = [
        {
            "id": r.id,
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "status": r.status,
            "approver": r.approved_by,
            "submission_date": r.submitted_at,
            "modified_date": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        }
        for r in qs
    ]

    return Response(data)

# ==================================================
# VALIDATOR QUEUE
# ==================================================
@api_view(["GET"])
def validation_requests(request):
    function_key = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.filter(status="APPROVED")

    if function_key and function_key not in ["all", "part-code-modification"]:
        qs = qs.none()

    qs = qs.order_by("-submitted_at")

    return Response([
        {
            "id": r.id,
            "function": "part-code-modification",
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "submission_date": r.submitted_at,
            "status": r.status,
            "approver": r.approved_by,
            "modified_date": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        }
        for r in qs
    ])


# ==================================================
# VALIDATOR ACTION
# ==================================================
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
    remarks = (request.data.get("remarks") or "").strip()
    validator = get_current_user_email(request)
    now = timezone.now()

    if action not in ["APPROVE", "REJECT", "RETURN"]:
        return Response({"error": "Invalid action"}, status=400)

    if action == "RETURN" and not remarks:
        return Response(
            {"error": "Remarks are mandatory for return"},
            status=400
        )

    if action == "APPROVE":
        req.status = "VALIDATED"
        req.sap_validation_status = "VALID"
        req.sap_validated_at = now
        req.sap_validated_by = validator

    elif action == "REJECT":
        req.status = "REJECTED"
        req.sap_validation_status = "INVALID"
        req.rejected_at = now
        req.rejected_by = validator

    elif action == "RETURN":
        req.status = "RETURNED_FOR_CORRECTION"
        req.sap_validation_status = "INVALID"
        req.last_returned_by_role = "VALIDATOR"

    if remarks:
        req.sap_remarks_only_for_sap_validation_member_access = remarks

    req.last_modified = now
    req.save()

    return Response({"status": req.status})


# ==================================================
# VALIDATED REQUESTS (Validator History)
# ==================================================
@api_view(["GET"])
def validated_requests(request):
    function_key = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.filter(
        status__in=["VALIDATED", "REJECTED"]
    )

    if function_key and function_key not in ["all", "part-code-modification"]:
        qs = qs.none()

    qs = qs.order_by("-last_modified")

    return Response([
        {
            "id": r.id,
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "submission_date": r.submitted_at,
            "status": r.status,
            "approver": r.approved_by,
            "modified_date": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": r.sap_validated_by,
        }
        for r in qs
    ])
