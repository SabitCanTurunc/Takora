import { TakoraLogo } from "@/components/layout/sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="mb-8">
        <TakoraLogo />
      </div>
      {children}
      <p className="mt-8 text-xs text-zinc-400">
        © {new Date().getFullYear()} Takora. Tüm hakları saklıdır.
      </p>
    </div>
  );
}
