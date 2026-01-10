
"use client";

import { useEffect, useState } from "react";

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

type ApproveRequest = {
  id: number;
  plant: string;
  owner: string;
  new_material_description: string;
  part_code: string;
  submission_date: string;
  status: string;
  approver: string | null;
  reason_for_return: string | null;
  modified_date: string;
  validation_status: string | null;
};

export default function ApproveRequestsPage() {
  const [selectedKey, setSelectedKey] = useState("all");
  const [requests, setRequests] = useState<ApproveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  async function fetchApproveRequests(fn: string) {
    setLoading(true);

    const url =
      fn === "all"
        ? "http://127.0.0.1:8000/api/approve-requests/"
        : `http://127.0.0.1:8000/api/approve-requests/?function=${fn}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data);
    } catch {
      setRequests([]);
    }

    setLoading(false);
  }

  async function takeAction(id: number, action: string) {
    if ((action === "REJECT" || action === "RETURN") && !remarks[id]) {
      alert("Remarks are mandatory for this action");
      return;
    }

    const res = await fetch(
      `http://127.0.0.1:8000/api/approve-requests/${id}/action/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          remarks: remarks[id] || "",
        }),
      }
    );

    if (res.ok) {
      fetchApproveRequests(selectedKey);
    } else {
      alert("Action failed");
    }
  }

  useEffect(() => {
    fetchApproveRequests(selectedKey);
  }, [selectedKey]);

  return (
    <>
      <h1>Approve Requests</h1>

      <label>Filter by Function</label>
      <br />
      <select
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
      >
        {FUNCTION_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      <br /><br />

      {loading && <p>Loading...</p>}

      {!loading && requests.length > 0 && (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Plant</th>
              <th>Owner</th>
              <th>Description</th>
              <th>Part Code</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.plant}</td>
                <td>{r.owner}</td>
                <td>{r.new_material_description}</td>
                <td>{r.part_code}</td>
                <td>{new Date(r.submission_date).toLocaleString()}</td>
                <td>{r.status}</td>

                <td>
                  <textarea
                    rows={2}
                    value={remarks[r.id] || ""}
                    onChange={(e) =>
                      setRemarks({ ...remarks, [r.id]: e.target.value })
                    }
                  />
                </td>

                <td>
                  <select
                    onChange={(e) =>
                      takeAction(r.id, e.target.value)
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="APPROVE">Approve</option>
                    <option value="REJECT">Reject</option>
                    <option value="RETURN">Return for Correction</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && requests.length === 0 && (
        <p>No requests pending approval.</p>
      )}
    </>
  );
}
