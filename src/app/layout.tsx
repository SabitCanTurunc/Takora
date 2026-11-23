import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Takora", template: "%s | Takora" },
  description: "İşletmenizin günlük işlerini ve müşteri geçmişini tek yerde toplayın.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" data-scroll-behavior="smooth" className={`${GeistSans.variable} h-full`}>
      <body className="h-full bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
