"use client";

import { useState } from "react";

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

  function update(field: string, value: string) {
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
    console.log("FORM DATA:", form);
    console.log("ATTACHMENTS:", files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })));

    alert(
      "Demo submission successful.\n\n" +
      "Files are captured locally only.\n" +
      "No backend upload yet."
    );
  }

  return (
    <>
      <h1>Part Code Modification</h1>
      <p>Demo form – mirrors SAP/Power Apps structure.</p>

      <div className="form-grid">
        <div>
          <label>* Plant</label>
          <input value={form.plant} onChange={e => update("plant", e.target.value)} />
        </div>

        <div>
          <label>* SAP Part Code</label>
          <input value={form.sapPartCode} onChange={e => update("sapPartCode", e.target.value)} />
        </div>

        <div className="full">
          <label>* New Material Description</label>
          <input value={form.newDescription} onChange={e => update("newDescription", e.target.value)} />
        </div>

        <div>
          <label>HSN Code</label>
          <input value={form.hsnCode} onChange={e => update("hsnCode", e.target.value)} />
        </div>

        <div>
          <label>From State – To State</label>
          <input value={form.fromToState} onChange={e => update("fromToState", e.target.value)} />
        </div>

        <div>
          <label>Tax %</label>
          <input value={form.taxPercent} onChange={e => update("taxPercent", e.target.value)} />
        </div>

        <div>
          <label>Sales Views</label>
          <input value={form.salesViews} onChange={e => update("salesViews", e.target.value)} />
        </div>

        <div>
          <label>Supplying Plant</label>
          <input value={form.supplyingPlant} onChange={e => update("supplyingPlant", e.target.value)} />
        </div>

        <div>
          <label>* Receiving Plant</label>
          <input value={form.receivingPlant} onChange={e => update("receivingPlant", e.target.value)} />
        </div>

        <div>
          <label>Tax Indication of the Material</label>
          <input value={form.taxIndication} onChange={e => update("taxIndication", e.target.value)} />
        </div>

        <div>
          <label>Procurement Type</label>
          <input value={form.procurementType} onChange={e => update("procurementType", e.target.value)} />
        </div>

        <div>
          <label>Activate Storage Location</label>
          <input value={form.storageLocation} onChange={e => update("storageLocation", e.target.value)} />
        </div>

        <div>
          <label>Production Version Update</label>
          <input value={form.productionVersion} onChange={e => update("productionVersion", e.target.value)} />
        </div>

        <div>
          <label>Quality Management</label>
          <input value={form.qualityManagement} onChange={e => update("qualityManagement", e.target.value)} />
        </div>

        <div className="full">
          <label>* Detailed Query Remarks</label>
          <textarea
            rows={4}
            value={form.remarks}
            onChange={e => update("remarks", e.target.value)}
          />
        </div>

        <div className="full">
          <label>Attachments</label>
          <input type="file" multiple onChange={handleFileChange} />

          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, i) => (
                <li key={i}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                  <button type="button" onClick={() => removeFile(i)}>Remove</button>
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
