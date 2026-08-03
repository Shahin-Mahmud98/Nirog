import Link from "next/link";
import { LayoutDashboard, Package, ClipboardList, FileText } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/prescriptions", label: "Prescriptions", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[200px_1fr] gap-8">
      <aside className="space-y-1">
        <h2 className="font-display font-semibold text-lg mb-4">Admin panel</h2>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 text-sm font-medium text-inksoft hover:text-teal-deep px-3 py-2 rounded-lg hover:bg-teal-light"
            >
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
      </aside>
      <div>{children}</div>
    </div>
  );
}
