"use client";

import { Session } from "next-auth";
import { MobileSidebar, TakoraLogo } from "./sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { cikisYap } from "@/app/(app)/actions";

interface TopbarProps {
  session: Session | null;
}

export function Topbar({ session }: TopbarProps) {
  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar />
        <TakoraLogo />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          aria-label="Bildirimler"
        >
          <Bell className="h-4 w-4" />
        </button>

        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-zinc-900 dark:text-white leading-none">
                {session.user.name || session.user.email}
              </span>
            </div>
            <form action={cikisYap}>
              <Button variant="ghost" size="icon" type="submit" title="Çıkış yap">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
