"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type FunctionOption = {
  key: string;
  label: string;
};

type MyRequest = {
  id: number;
  function: string;
  plant: string;
  created_by: string;
  new_material_description: string;
  sap_part_code: string;
  status: string;
  approver: string | null;
  submission_date: string;
  reason_for_return: string | null;
  last_modified: string;
  validation_status: string;
  validated_by: string | null;
};

/* ================= CONSTANTS ================= */

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

/* ================= PAGE ================= */

export default function MyRequestsPage() {
  const router = useRouter();

  const [selectedFunction, setSelectedFunction] = useState("all");
  const [requests, setRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= DATA LOAD ================= */

  async function fetchRequests(func: string) {
    setLoading(true);

    const url =
      func === "all"
        ? "http://127.0.0.1:8000/api/my-requests/"
        : `http://127.0.0.1:8000/api/my-requests/?function=${func}`;

    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    } else {
      setRequests([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchRequests(selectedFunction);
  }, [selectedFunction]);

  /* ================= ACTIONS ================= */

  function handleResubmit(request: MyRequest) {
    // Opens a NEW form, NOT editing the same row
    router.push(
      `/dashboard/part-code/modification?sourceRequestId=${request.id}`
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <h1>My Requests</h1>

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

      {loading && <p>Loading...</p>}

      {!loading && requests.length === 0 && (
        <p>No requests found.</p>
      )}

      {!loading && requests.length > 0 && (
        <table border={1} cellPadding={8} width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plant</th>
              <th>Owner</th>
              <th>New Material Description</th>
              <th>Part Code</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Approver</th>
              <th>Action</th>
              <th>Reason for Return</th>
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
                <td>{r.created_by}</td>
                <td>{r.new_material_description}</td>
                <td>{r.sap_part_code}</td>
                <td>{new Date(r.submission_date).toLocaleString()}</td>
                <td>{r.status}</td>
                <td>{r.approver ?? "-"}</td>
                <td>{r.reason_for_return ?? "-"}</td>
                <td>{new Date(r.last_modified).toLocaleString()}</td>
                <td>
                  {r.status === "RETURNED_FOR_CORRECTION" && (
                    <button onClick={() => handleResubmit(r)}>
                      Edit & Resubmit
                    </button>
                  )}
                </td>
                <td>{r.validation_status}</td>
                <td>{r.validated_by ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
