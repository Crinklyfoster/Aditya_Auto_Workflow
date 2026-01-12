"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FunctionOption = {
  key: string;
  label: string;
  route: string;
};

const FUNCTION_OPTIONS: FunctionOption[] = [
  {
    key: "asset-creation",
    label: "Asset Creation",
    route: "/dashboard/asset/creation",
  },
  {
    key: "customer-master",
    label: "Customer Master Creation/Modification",
    route: "/dashboard/customer/master",
  },
  {
    key: "engineering-bom-note",
    label: "Engineering BOM Note",
    route: "/dashboard/engineering/bom-note",
  },
  {
    key: "engineering-bom-note-change",
    label: "Engineering BOM Note Change",
    route: "/dashboard/engineering/bom-note-change",
  },
  {
    key: "hiring-indent",
    label: "Hiring Indent",
    route: "/dashboard/hiring-indent",
  },
  {
    key: "npv-submission",
    label: "NPV Submission",
    route: "/dashboard/npv",
  },
  {
    key: "part-code-creation",
    label: "Part Code Creation",
    route: "/dashboard/part-code/creation",
  },
  {
    key: "part-code-modification",
    label: "Part Code Modification",
    route: "/dashboard/part-code/modification",
  },
  {
    key: "project-approval",
    label: "Project Approval",
    route: "/dashboard/project/approval",
  },
  {
    key: "routing-master",
    label: "Routing Master Creation/Modification",
    route: "/dashboard/routing-master",
  },
  {
    key: "selling-price-updation",
    label: "Selling Price Updation",
    route: "/dashboard/selling-price",
  },
  {
    key: "vendor-master",
    label: "Vendor Master Creation/Modification",
    route: "/dashboard/vendor/master",
  },
];

export default function CreateRequestsPage() {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState("");

  function handleLaunch() {
    const selected = FUNCTION_OPTIONS.find(
      (opt) => opt.key === selectedKey
    );

    if (!selected) {
      alert("Please select a function");
      return;
    }

    router.push(selected.route);
  }

  return (
    <>
      <h1>Create Requests</h1>

      <label>Select Function</label>
      <br />

      <select
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
      >
        <option value="">-- Select --</option>
        {FUNCTION_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      <button onClick={handleLaunch}>Launch</button>
    </>
  );
}
