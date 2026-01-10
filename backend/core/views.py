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
    function_filter = request.GET.get("function")

    qs = PartCodeModificationRequest.objects.filter(
        status="PENDING_FOR_APPROVAL"
    ).order_by("-submitted_at")

    # Filter only if NOT "all"
    if function_filter and function_filter != "all":
        if function_filter != "part-code-modification":
            return Response([])

    data = []
    for r in qs:
        data.append({
            "id": r.id,
            "function": "part-code-modification",  # ✅ FIX
            "plant": r.plant,
            "owner": r.created_by,
            "new_material_description": r.new_material_description,
            "part_code": r.sap_part_code,
            "submission_date": r.submitted_at,
            "status": r.status,
            "approver": None,
            "reason_for_return": r.remarks,
            "modified_date": r.last_modified,
            "validation_status": r.sap_validation_status,
            "validated_by": None,
        })

    return Response(data)



# --------------------------------------------------
# APPROVE REQUEST – ACTION
# --------------------------------------------------

@api_view(["POST"])
def approve_request_action(request, pk):
    try:
        req = PartCodeModificationRequest.objects.get(pk=pk)
    except PartCodeModificationRequest.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    action = request.data.get("action")
    remarks = request.data.get("remarks")

    if action in ["REJECT", "RETURN"] and not remarks:
        return Response(
            {"error": "Remarks required"},
            status=400
        )

    if action == "APPROVE":
        req.status = "APPROVED"
        req.approved_at = timezone.now()
        req.approved_by = "approver@demo.com"

    elif action == "REJECT":
        req.status = "REJECTED"
        req.remarks = remarks
        req.rejected_at = timezone.now()
        req.rejected_by = "approver@demo.com"

    elif action == "RETURN":
        req.status = "RETURNED_FOR_CORRECTION"
        req.remarks = remarks

    else:
        return Response({"error": "Invalid action"}, status=400)

    req.save()
    return Response({"status": "ok"})
