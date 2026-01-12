"use client";

import { useEffect, useState } from "react";

/* ================= FILTER OPTIONS ================= */

type FunctionOption = {
  key: string;
  label: string;
};

const FUNCTION_OPTIONS: FunctionOption[] = [
  { key: "all", label: "All" },
  { key: "asset-creation", label: "Asset Creation" },
  { key: "customer-master", label: "Customer Master Creation/Modification" },
  { key: "engineering-bom-note", label: "Engineering BOM Note" },
  { key: "engineering-bom-note-change", label: "Engineering BOM Note Change" },
  { key: "hiring-indent", label: "Hiring Indent" },
  { key: "npv-submission", label: "NPV Submission" },
  { key: "part-code-creation", label: "Part Code Creation" },
  { key: "part-code-modification", label: "Part Code Modification" },
  { key: "project-approval", label: "Project Approval" },
  { key: "routing-master", label: "Routing Master Creation/Modification" },
  { key: "selling-price-updation", label: "Selling Price Updation" },
  { key: "vendor-master", label: "Vendor Master Creation/Modification" },
];

/* ================= DATA TYPE ================= */

type ApprovedRequest = {
  id: number;
  plant: string;
  owner: string;
  new_material_description: string;
  part_code: string;
  status: string;
  approver: string;
  submission_date: string;
  modified_date: string;
  validation_status: string;
  validated_by: string;
};

/* ================= PAGE ================= */

export default function ApprovedRequestsPage() {
  const [selectedFunction, setSelectedFunction] = useState("all");
  const [requests, setRequests] = useState<ApprovedRequest[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */

  async function fetchApprovedRequests(functionKey: string) {
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/approved-requests/?function=${functionKey}`
      );

      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch approved requests", err);
      setRequests([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchApprovedRequests(selectedFunction);
  }, [selectedFunction]);

  /* ================= UI ================= */

  return (
    <>
      <h1>Approved Requests</h1>
      <p>Read-only history of approved / completed requests</p>

      {/* FILTER */}
      <label>Filter by Function</label>
      <br />

      <select
        value={selectedFunction}
        onChange={(e) => setSelectedFunction(e.target.value)}
      >
        {FUNCTION_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      {/* STATE */}
      {loading && <p>Loading...</p>}

      {!loading && requests.length === 0 && (
        <p>No approved requests found.</p>
      )}

      {/* TABLE */}
      {!loading && requests.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table border={1} cellPadding={8} width="100%">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plant</th>
                <th>Owner</th>
                <th>New Material Description</th>
                <th>Part Code</th>
                <th>Status</th>
                <th>Approver</th>
                <th>Submission Date</th>
                <th>Modified Date</th>
                <th>Validation Status</th>
                <th>Validated By</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.plant}</td>
                  <td>{r.owner}</td>
                  <td>{r.new_material_description}</td>
                  <td>{r.part_code || "-"}</td>
                  <td>{r.status}</td>
                  <td>{r.approver || "-"}</td>
                  <td>
                    {r.submission_date
                      ? new Date(r.submission_date).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    {r.modified_date
                      ? new Date(r.modified_date).toLocaleString()
                      : "-"}
                  </td>
                  <td>{r.validation_status || "-"}</td>
                  <td>{r.validated_by || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
