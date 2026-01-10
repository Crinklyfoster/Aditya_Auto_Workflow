"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Create Request", path: "/dashboard/create-request" },
  { label: "My Requests", path: "/dashboard/my-requests" },
  { label: "Approve Request", path: "/dashboard/approve-requests" },
  { label: "Validation Request", path: "/dashboard/validation-requests" },
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
