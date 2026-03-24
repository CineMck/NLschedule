"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@prisma/client";

export function Topbar({
  userName,
  role,
  onMenuClick,
}: {
  userName: string;
  role: Role;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <span className="text-sm text-gray-500">Welcome,</span>{" "}
            <span className="text-sm font-medium text-gray-900">{userName}</span>
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
              {ROLE_LABELS[role]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
