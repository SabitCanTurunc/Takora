import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StoreHydrator } from "@/components/store-hydrator";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/giris");
  }

  return (
    <div className="flex h-full">
      <StoreHydrator />
      <Suspense fallback={<aside className="hidden lg:flex w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full" />}>
        <Sidebar />
      </Suspense>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Suspense fallback={<header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />}>
          <Topbar session={session} />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
