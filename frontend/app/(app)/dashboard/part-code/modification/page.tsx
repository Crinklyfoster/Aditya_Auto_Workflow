"use client";

import { useState } from "react";

/* ========= SAP-ALIGNED DROPDOWN DATA ========= */

// Shared plant list (used in 3 places)
const PLANTS = [
  "BP01", "BP02", "BP03", "BP04", "BP05", "BP06", "BP07",
  "BP08", "BP09", "BP10", "BP11", "BP12", "BP13", "BP14",
  "AM01",
  "AV01",
  "EA01",
  "SY01",
];

// Sales Views
const SALES_VIEWS = [
  { value: "DOM", label: "Domestic Sales" },
  { value: "EXP", label: "Export" },
  { value: "SUB", label: "Sub Contract" },
  { value: "STO", label: "Stock Transfer" },
];

// Tax Indication of the Material
const TAX_INDICATIONS = [
  { value: "0", label: "0 - Taxable Under GST" },
  { value: "1", label: "1 - GST - Exempted" },
];

// Procurement Type
const PROCUREMENT_TYPES = [
  { value: "E", label: "E - In-house Production" },
  { value: "F", label: "F - External Procurement" },
  { value: "F-30", label: "F-30 - Special Procurement" },
];

// Production Version Update
const PRODUCTION_VERSION_OPTIONS = [
  { value: "REM", label: "REM" },
];

// Quality Management
const QUALITY_MANAGEMENT_OPTIONS = [
  { value: "PUR", label: "Purchasing" },
  { value: "PROD", label: "Production" },
];

/* =========================================== */

export default function PartCodeModificationPage() {
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

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    console.log("PART CODE MODIFICATION (DEMO)");
    console.log("FORM DATA:", form);
    console.log(
      "ATTACHMENTS:",
      files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }))
    );

    alert(
      "Demo submission successful.\n\n" +
      "No backend, SAP, or SharePoint integration yet."
    );
  }

  return (
    <>
      <h1>Part Code Modification</h1>
      <p>Demo form aligned with SAP / Power Apps structure.</p>

      <div className="form-grid">
        {/* Plant */}
        <div>
          <label>* Plant</label>
          <select value={form.plant} onChange={(e) => update("plant", e.target.value)}>
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
            onChange={(e) => update("sapPartCode", e.target.value)}
          />
        </div>

        {/* New Description */}
        <div className="full">
          <label>* New Material Description</label>
          <input
            value={form.newDescription}
            onChange={(e) => update("newDescription", e.target.value)}
          />
        </div>

        {/* HSN Code */}
        <div>
          <label>HSN Code</label>
          <input
            value={form.hsnCode}
            onChange={(e) => update("hsnCode", e.target.value)}
          />
        </div>

        {/* From – To State */}
        <div>
          <label>From State – To State</label>
          <input
            value={form.fromToState}
            onChange={(e) => update("fromToState", e.target.value)}
          />
        </div>

        {/* Tax % */}
        <div>
          <label>Tax %</label>
          <input
            value={form.taxPercent}
            onChange={(e) => update("taxPercent", e.target.value)}
          />
        </div>

        {/* Sales Views */}
        <div>
          <label>Sales Views</label>
          <select
            value={form.salesViews}
            onChange={(e) => update("salesViews", e.target.value)}
          >
            <option value="">-- Select --</option>
            {SALES_VIEWS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Supplying Plant */}
        <div>
          <label>Supplying Plant</label>
          <select
            value={form.supplyingPlant}
            onChange={(e) => update("supplyingPlant", e.target.value)}
          >
            <option value="">-- Select --</option>
            {PLANTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Receiving Plant */}
        <div>
          <label>* Receiving Plant</label>
          <select
            value={form.receivingPlant}
            onChange={(e) => update("receivingPlant", e.target.value)}
          >
            <option value="">-- Select --</option>
            {PLANTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Tax Indication */}
        <div>
          <label>Tax Indication of the Material</label>
          <select
            value={form.taxIndication}
            onChange={(e) => update("taxIndication", e.target.value)}
          >
            <option value="">-- Select --</option>
            {TAX_INDICATIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Procurement Type */}
        <div>
          <label>Procurement Type</label>
          <select
            value={form.procurementType}
            onChange={(e) => update("procurementType", e.target.value)}
          >
            <option value="">-- Select --</option>
            {PROCUREMENT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Storage Location */}
        <div>
          <label>Activate Storage Location</label>
          <input
            value={form.storageLocation}
            onChange={(e) => update("storageLocation", e.target.value)}
          />
        </div>

        {/* Production Version */}
        <div>
          <label>Production Version Update</label>
          <select
            value={form.productionVersion}
            onChange={(e) => update("productionVersion", e.target.value)}
          >
            <option value="">-- Select --</option>
            {PRODUCTION_VERSION_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quality Management */}
        <div>
          <label>Quality Management</label>
          <select
            value={form.qualityManagement}
            onChange={(e) => update("qualityManagement", e.target.value)}
          >
            <option value="">-- Select --</option>
            {QUALITY_MANAGEMENT_OPTIONS.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div className="full">
          <label>* Detailed Query Remarks</label>
          <textarea
            rows={4}
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
          />
        </div>

        {/* Attachments */}
        <div className="full">
          <label>Attachments</label>
          <input type="file" multiple onChange={handleFileChange} />

          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, i) => (
                <li key={i}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                  <button type="button" onClick={() => removeFile(i)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
