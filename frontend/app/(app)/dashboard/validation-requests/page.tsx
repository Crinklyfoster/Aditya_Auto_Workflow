"use client";

import { useEffect, useState } from "react";

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

export default function ValidationRequestsPage() {
  const [requests, setRequests] = useState<ValidationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [actions, setActions] = useState<Record<number, ActionType>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  // -------------------------
  // FETCH VALIDATION QUEUE
  // -------------------------
  async function fetchValidationRequests() {
    setLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/validation-requests/"
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
    fetchValidationRequests();
  }, []);

  // -------------------------
  // HANDLE ACTION SUBMIT
  // -------------------------
  async function submitAction(requestId: number) {
    const action = actions[requestId];
    const remark = remarks[requestId]?.trim();

    if (!action) {
      alert("Please select an action");
      return;
    }

    if (!remark) {
      alert("Remarks are mandatory");
      return;
    }

    const confirmMsg =
      action === "APPROVE"
        ? "Approve this request?"
        : action === "REJECT"
        ? "Reject this request?"
        : "Return this request for correction?";

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(requestId);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/validation-requests/${requestId}/action/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            remarks: remark,
          }),
        }
      );

      if (!res.ok) {
        alert("Action failed");
        setSubmitting(null);
        return;
      }

      // Remove processed request from queue
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }

    setSubmitting(null);
  }

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <>
      <h1>Validation Requests</h1>
      <p>Final validation queue (read-only, action-based)</p>

      {loading && <p>Loading...</p>}

      {!loading && requests.length === 0 && (
        <p>No requests pending validation.</p>
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
              <th>Submit</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => {
              const action = actions[r.id] || "";
              const remark = remarks[r.id] || "";
              const canSubmit =
                action !== "" &&
                remark.trim().length > 0 &&
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

                  {/* ACTION */}
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

                  {/* REMARKS */}
                  <td>
                    <textarea
                      rows={2}
                      disabled={!action}
                      placeholder={
                        !action
                          ? "Select action first"
                          : "Enter mandatory remarks"
                      }
                      value={remark}
                      onChange={(e) =>
                        setRemarks((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                    />
                  </td>

                  <td>{new Date(r.modified_date).toLocaleString()}</td>
                  <td>{r.validation_status || "-"}</td>
                  <td>{r.validated_by || "-"}</td>

                  {/* SUBMIT */}
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
      )}
    </>
  );
}
