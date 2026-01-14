"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/* ========= SAP-ALIGNED DROPDOWN DATA ========= */

const PLANTS = [
  "BP01","BP02","BP03","BP04","BP05","BP06","BP07",
  "BP08","BP09","BP10","BP11","BP12","BP13","BP14",
  "AM01","AV01","EA01","SY01",
];

const SALES_VIEWS = [
  { value: "DOM", label: "Domestic Sales" },
  { value: "EXP", label: "Export" },
  { value: "SUB", label: "Sub Contract" },
  { value: "STO", label: "Stock Transfer" },
];

const TAX_INDICATIONS = [
  { value: "0", label: "0 - Taxable Under GST" },
  { value: "1", label: "1 - GST - Exempted" },
];

const PROCUREMENT_TYPES = [
  { value: "E", label: "E - In-house Production" },
  { value: "F", label: "F - External Procurement" },
  { value: "F-30", label: "F-30 - Special Procurement" },
];

const PRODUCTION_VERSION_OPTIONS = [{ value: "REM", label: "REM" }];

const QUALITY_MANAGEMENT_OPTIONS = [
  { value: "PUR", label: "Purchasing" },
  { value: "PROD", label: "Production" },
];

/* =========================================== */

export default function PartCodeModificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const requestId = searchParams.get("requestId");

  const isCreateMode = !requestId;
  const isInstanceMode = !!requestId;

  const [status, setStatus] = useState<string | null>(null);
  const canEdit = status === "RETURNED_FOR_CORRECTION";

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    plant: "",
    sapPartCode: "",
    newDescription: "",
    hsnCode: "",
    fromToState: "",
    taxPercent: "",
    salesViews: "",
    supplyingPlant: "",
    receivingPlant: "",
    taxIndication: "",
    procurementType: "",
    storageLocation: "",
    productionVersion: "",
    qualityManagement: "",
    remarks: "",
  });

  /* ================= FETCH INSTANCE ================= */

  useEffect(() => {
    if (!requestId) return;

    setLoading(true);

    fetch(`http://127.0.0.1:8000/api/requests/${requestId}/`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          plant: data.plant || "",
          sapPartCode: data.sap_part_code || "",
          newDescription: data.new_material_description || "",
          hsnCode: data.hsn_code || "",
          fromToState: data.from_state_to_state || "",
          taxPercent: data.tax || "",
          salesViews: data.sales_views || "",
          supplyingPlant: data.supplying_plant || "",
          receivingPlant: data.receiving_plant || "",
          taxIndication: data.tax_indication_of_the_material || "",
          procurementType: data.procurement_type || "",
          storageLocation: data.activate_storage_location || "",
          productionVersion: data.production_version_update || "",
          qualityManagement: data.quality_management || "",
          remarks: data.remarks || "",
        });

        setStatus(data.status);
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  /* ================= HELPERS ================= */

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  }

  /* ================= CREATE ================= */

  async function handleCreate() {
    if (!form.plant || !form.sapPartCode || !form.newDescription) {
      alert("Please fill mandatory fields");
      return;
    }

    setLoading(true);

    const res = await fetch(
      "http://127.0.0.1:8000/api/create-requests/",
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      }
    );

    setLoading(false);

    if (!res.ok) {
      alert("Submission failed");
      return;
    }

    alert("Request submitted");
    router.push("/dashboard/created-requests");
  }

  /* ================= RESUBMIT ================= */

  async function handleResubmit() {
    if (!requestId) return;

    setLoading(true);

    const res = await fetch(
      `http://127.0.0.1:8000/api/requests/${requestId}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plant: form.plant,
          sap_part_code: form.sapPartCode,
          new_material_description: form.newDescription,
          hsn_code: form.hsnCode,
          from_state_to_state: form.fromToState,
          tax: form.taxPercent,
          sales_views: form.salesViews,
          supplying_plant: form.supplyingPlant,
          receiving_plant: form.receivingPlant,
          tax_indication_of_the_material: form.taxIndication,
          procurement_type: form.procurementType,
          activate_storage_location: form.storageLocation,
          production_version_update: form.productionVersion,
          quality_management: form.qualityManagement,
          remarks: form.remarks,
        }),
      }
    );

    setLoading(false);

    if (!res.ok) {
      alert("Resubmission failed");
      return;
    }

    alert("Request resubmitted");
    router.push("/dashboard/created-requests");
  }

  /* ================= UI ================= */

  const readOnly = isInstanceMode && !canEdit;

  return (
    <div className="form-page">
      <h1>Part Code Modification</h1>

      {isInstanceMode && (
        <p>
          <strong>Status:</strong> {status}
        </p>
      )}

      {isInstanceMode && !canEdit && (
        <p style={{ color: "gray" }}>
          This request is read-only.
        </p>
      )}

      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
  {/* Plant */}
        <div>
          <label>* Plant</label>
    <select
      value={form.plant}
      disabled={readOnly}
      onChange={(e) => update("plant", e.target.value)}
    >
            <option value="">-- Select --</option>
      {PLANTS.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
          </select>
        </div>

  {/* SAP Part Code */}
        <div>
          <label>* SAP Part Code</label>
    <input
      value={form.sapPartCode}
      disabled={readOnly}
      onChange={(e) => update("sapPartCode", e.target.value)}
    />
        </div>

  {/* New Material Description */}
        <div className="full">
          <label>* New Material Description</label>
    <input
      value={form.newDescription}
      disabled={readOnly}
      onChange={(e) => update("newDescription", e.target.value)}
    />
        </div>

  <div>
    <label>HSN Code</label>
    <input
      value={form.hsnCode}
      disabled={readOnly}
      onChange={(e) => update("hsnCode", e.target.value)}
    />
  </div>

  <div>
    <label>From State – To State</label>
    <input
      value={form.fromToState}
      disabled={readOnly}
      onChange={(e) => update("fromToState", e.target.value)}
    />
  </div>

  <div>
    <label>Tax %</label>
    <input
      value={form.taxPercent}
      disabled={readOnly}
      onChange={(e) => update("taxPercent", e.target.value)}
    />
  </div>

  <div>
    <label>Sales Views</label>
    <select
      value={form.salesViews}
      disabled={readOnly}
      onChange={(e) => update("salesViews", e.target.value)}
    >
      <option value="">-- Select --</option>
      {SALES_VIEWS.map((v) => (
        <option key={v.value} value={v.value}>{v.label}</option>
      ))}
    </select>
  </div>

  <div>
    <label>Supplying Plant</label>
    <select
      value={form.supplyingPlant}
      disabled={readOnly}
      onChange={(e) => update("supplyingPlant", e.target.value)}
    >
      <option value="">-- Select --</option>
      {PLANTS.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  </div>

  <div>
    <label>* Receiving Plant</label>
    <select
      value={form.receivingPlant}
      disabled={readOnly}
      onChange={(e) => update("receivingPlant", e.target.value)}
    >
      <option value="">-- Select --</option>
      {PLANTS.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  </div>

  <div>
    <label>Tax Indication of the Material</label>
    <select
      value={form.taxIndication}
      disabled={readOnly}
      onChange={(e) => update("taxIndication", e.target.value)}
    >
      <option value="">-- Select --</option>
      {TAX_INDICATIONS.map((t) => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  </div>

  <div>
    <label>Procurement Type</label>
    <select
      value={form.procurementType}
      disabled={readOnly}
      onChange={(e) => update("procurementType", e.target.value)}
    >
      <option value="">-- Select --</option>
      {PROCUREMENT_TYPES.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </select>
  </div>

  <div>
    <label>Activate Storage Location</label>
    <input
      value={form.storageLocation}
      disabled={readOnly}
      onChange={(e) => update("storageLocation", e.target.value)}
    />
  </div>

  <div>
    <label>Production Version Update</label>
    <select
      value={form.productionVersion}
      disabled={readOnly}
      onChange={(e) => update("productionVersion", e.target.value)}
    >
      <option value="">-- Select --</option>
      {PRODUCTION_VERSION_OPTIONS.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </select>
  </div>

  <div>
    <label>Quality Management</label>
    <select
      value={form.qualityManagement}
      disabled={readOnly}
      onChange={(e) => update("qualityManagement", e.target.value)}
    >
      <option value="">-- Select --</option>
      {QUALITY_MANAGEMENT_OPTIONS.map((q) => (
        <option key={q.value} value={q.value}>{q.label}</option>
      ))}
    </select>
  </div>

  <div className="full">
    <label>* Detailed Query Remarks</label>
    <textarea
      rows={4}
      value={form.remarks}
      disabled={readOnly}
      onChange={(e) => update("remarks", e.target.value)}
    />
  </div>

  <div className="full">
    <label>Attachments</label>
    <input
      type="file"
      multiple
      disabled={readOnly}
      onChange={handleFileChange}
    />
  </div>

  {/* ACTION BUTTONS */}
          <div className="full">
    {isCreateMode && (
      <button type="button" onClick={handleCreate} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    )}

    {isInstanceMode && canEdit && (
      <button type="button" onClick={handleResubmit} disabled={loading}>
        {loading ? "Resubmitting..." : "Resubmit"}
      </button>
    )}
  </div>
      </form>
    </div>
  );
}
