from django.db import models
from django.contrib.auth.hashers import make_password

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # ✅ REQUIRED
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-hash password if not hashed
        if self.password and not self.password.startswith("pbkdf2_"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


# --------------------------------------------------
# Part Code Modification – WORKFLOW MODEL
# --------------------------------------------------

class PartCodeModificationRequest(models.Model):
    plant = models.TextField(null=True, blank=True)
    sap_part_code = models.TextField(null=True, blank=True)
    reason_for_rejection = models.TextField(null=True, blank=True)
    new_material_description = models.TextField(null=True, blank=True)
    hsn_code = models.TextField(null=True, blank=True)
    from_state_to_state = models.TextField(null=True, blank=True)

    tax = models.TextField(null=True, blank=True)
    sales_views = models.TextField(null=True, blank=True)
    supplying_plant = models.TextField(null=True, blank=True)
    receiving_plant = models.TextField(null=True, blank=True)
    tax_indication_of_the_material = models.TextField(null=True, blank=True)
    procurement_type = models.TextField(null=True, blank=True)
    activate_storage_location = models.TextField(null=True, blank=True)
    production_version_update = models.TextField(null=True, blank=True)
    quality_management = models.TextField(null=True, blank=True)

    remarks = models.TextField(null=True, blank=True)
    sap_remarks_only_for_sap_validation_member_access = models.TextField(null=True, blank=True)

    status = models.TextField()
    sap_validation_status = models.TextField(null=True, blank=True)

    attachment_urls = models.TextField(null=True, blank=True)

    created = models.DateTimeField()
    last_modified = models.DateTimeField()

    created_by = models.TextField(null=True, blank=True)

    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.TextField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.TextField(null=True, blank=True)
    sap_validated_at = models.DateTimeField(null=True, blank=True)
    sap_validated_by = models.TextField(null=True, blank=True)

    last_returned_by_role = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "part_code_modification_requests"
        managed = False   # 🔥 VERY IMPORTANT

    def __str__(self):
        return f"{self.sap_part_code or 'NEW'} | {self.status}"
