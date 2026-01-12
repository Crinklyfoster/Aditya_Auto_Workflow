"use client";

import { useEffect, useRef, useState } from "react";

/* ================= TYPES ================= */

type ValidationRequest = {
  id: number;
  plant: string;
  owner: string;
  new_material_description: string;
  part_code: string;
  submission_date: string;
  status: string;
  approver: string;
  modified_date: string;
  validation_status: string;
  validated_by: string;
};

type ActionType = "APPROVE" | "REJECT" | "RETURN" | "";

type FunctionOption = {
  key: string;
  label: string;
};

/* ================= FUNCTION FILTER OPTIONS ================= */

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

/* ================= COMPONENT ================= */

export default function ValidationRequestsPage() {
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedFunction, setSelectedFunction] = useState<string>("all");
  const [requests, setRequests] = useState<ValidationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [actions, setActions] = useState<Record<number, ActionType>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  /* ================= FETCH ================= */

  async function fetchValidationRequests(functionKey: string) {
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/validation-requests/?function=${functionKey}`
      );

      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch validation requests", err);
      setRequests([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchValidationRequests(selectedFunction);
  }, [selectedFunction]);

  /* ================= ACTION SUBMIT ================= */

  async function submitAction(id: number) {
    const action = actions[id];
    const remark = (remarks[id] || "").trim();

    if (!action) {
      alert("Please select an action");
      return;
    }

    if (action === "RETURN" && !remark) {
      alert("Reason for return is mandatory");
      return;
    }

    const confirmMsg =
      action === "APPROVE"
        ? "Approve this request?"
        : action === "REJECT"
        ? "Reject this request?"
        : "Return this request for correction?";

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(id);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/validation-requests/${id}/action/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            remarks: remark || undefined,
          }),
        }
      );

      if (!res.ok) {
        alert("Action failed");
        setSubmitting(null);
        return;
      }

      // remove row after successful action
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }

    setSubmitting(null);
  }

  /* ================= UI ================= */

  return (
    <>
      <h1>Validation Requests</h1>
      <p>Final validation queue (action-based)</p>

      {/* -------- FUNCTION FILTER -------- */}
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
        <p>No requests pending validation.</p>
      )}

      {!loading && requests.length > 0 && (
        <div ref={tableScrollRef} style={{ overflow: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plant</th>
                <th>Owner</th>
                <th>Description</th>
                <th>Part Code</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Approver</th>
                <th>Action</th>
                <th>Reason for Return</th>
                <th>Modified</th>
                <th>Validation Status</th>
                <th>Validated By</th>
                <th>Submit</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => {
                const action = actions[r.id] || "";
                const remark = remarks[r.id] || "";

                const canSubmit =
                  action &&
                  (action !== "RETURN" || remark.trim().length > 0) &&
                  submitting !== r.id;

                return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.plant}</td>
                    <td>{r.owner}</td>
                    <td>{r.new_material_description}</td>
                    <td>{r.part_code}</td>
                    <td>{new Date(r.submission_date).toLocaleString()}</td>
                    <td>{r.status}</td>
                    <td>{r.approver || "-"}</td>

                    <td>
                      <select
                        value={action}
                        onChange={(e) =>
                          setActions((prev) => ({
                            ...prev,
                            [r.id]: e.target.value as ActionType,
                          }))
                        }
                      >
                        <option value="">-- Select --</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                        <option value="RETURN">Return for Correction</option>
                      </select>
                    </td>

                    <td>
                      {action === "RETURN" && (
                        <textarea
                          rows={2}
                          placeholder="Mandatory reason"
                          value={remark}
                          onChange={(e) =>
                            setRemarks((prev) => ({
                              ...prev,
                              [r.id]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </td>

                    <td>{new Date(r.modified_date).toLocaleString()}</td>
                    <td>{r.validation_status || "-"}</td>
                    <td>{r.validated_by || "-"}</td>

                    <td>
                      <button
                        disabled={!canSubmit}
                        onClick={() => submitAction(r.id)}
                      >
                        {submitting === r.id ? "Processing..." : "Submit"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
