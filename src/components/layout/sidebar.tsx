"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Car,
  CalendarClock,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/isler", label: "İşler", icon: ClipboardList },
  { href: "/musteriler", label: "Müşteriler", icon: Users },
  { href: "/araclar", label: "Araçlar", icon: Car },
  { href: "/randevular", label: "Randevular", icon: CalendarClock },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-950 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <TakoraLogo />
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <TakoraLogo />
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </>
  );
}

export function TakoraLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
        <span className="text-white dark:text-zinc-900 text-sm font-bold">T</span>
      </div>
      <span className="text-base font-semibold text-zinc-900 dark:text-white">
        Takora
      </span>
    </Link>
  );
}
