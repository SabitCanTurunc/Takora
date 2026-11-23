import { Suspense } from "react";
import type { Metadata } from "next";
import GirisForm from "./_components/giris-form";

export const metadata: Metadata = { title: "Giriş Yap" };

export default function GirisPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm h-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse" />}>
      <GirisForm />
    </Suspense>
  );
}
