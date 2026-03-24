"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Clock,
  CalendarOff,
  ArrowLeftRight,
  Users,
  DollarSign,
  Bell,
  CalendarClock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];
};

const navItems: NavItem[] = [
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Clock In/Out", href: "/clock", icon: Clock },
  { label: "Availability", href: "/availability", icon: CalendarClock },
  { label: "Time Off", href: "/time-off", icon: CalendarOff },
  { label: "Shift Swaps", href: "/swaps", icon: ArrowLeftRight },
  { label: "Team", href: "/team", icon: Users, roles: ["OWNER", "MANAGER"] },
  { label: "Payroll", href: "/payroll", icon: DollarSign, roles: ["OWNER"] },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/schedule" className="text-xl font-bold text-primary-600">
            NLschedule
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
