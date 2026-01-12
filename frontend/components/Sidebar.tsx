"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Create Requests", path: "/dashboard/create-requests" },
  { label: "Created Requests", path: "/dashboard/created-requests" },
  { label: "Approve Requests", path: "/dashboard/approve-requests" },
  { label: "Approved Requests", path: "/dashboard/approved-requests" },
  { label: "Validation Requests", path: "/dashboard/validation-requests" },
  { label: "Validated Requests", path: "/dashboard/validated-requests" },
  { label: "Reporting", path: "/dashboard/reporting" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {menuItems.map((item) => {
        const active = pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`sidebar-item ${active ? "active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
