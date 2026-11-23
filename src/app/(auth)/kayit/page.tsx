import { Suspense } from "react";
import type { Metadata } from "next";
import KayitForm from "./_components/kayit-form";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default function KayitPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm h-80 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />}>
      <KayitForm />
    </Suspense>
  );
}
