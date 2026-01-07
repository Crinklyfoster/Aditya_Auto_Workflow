"use client";

import { useState } from "react";

export default function CreateRequestPage() {
  const [functionType, setFunctionType] = useState("");

  function handleLaunch() {
    if (!functionType) {
      alert("Please select a function");
      return;
    }

    alert(`Demo launch for: ${functionType}`);
  }

  return (
    <>
      <h1>Create Request</h1>

      <label>Select Function</label>
      <select
        value={functionType}
        onChange={(e) => setFunctionType(e.target.value)}
      >
        <option value="">-- Select --</option>
        <option value="Asset Creation">Asset Creation</option>
        <option value="Customer Master Creation/Modification">Customer Master Creation/Modification</option>
        <option value="Engineering BOM Note">Engineering BOM Note</option>
        <option value="Engineering BOM Note Change">Engineering BOM Note Change</option>
        <option value="Hiring Indent">Hiring Indent</option>
        <option value="NPV Submission">NPV Submission</option>          
        <option value="Part Code Creation">Part Code Creation</option>
        <option value="Part Code Modification">Part Code Modification</option>
        <option value="Project Approval">Project Approval</option>
        <option value="Routing Master Creation/Modification">Routing Master Creation/Modification</option>
        <option value="Selling Price Updation">Selling Price Updation</option>
        <option value="Vendor Master Creation/Modification">Vendor Master Creation/Modification</option>       
       
      </select>
      
      <br />
      <br />

      <button onClick={handleLaunch}>Launch</button>
    </>
  );
}
