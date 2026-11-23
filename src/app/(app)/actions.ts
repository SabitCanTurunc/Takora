"use server";

import { signOut } from "@/lib/auth";

export async function cikisYap() {
  await signOut({ redirectTo: "/giris" });
}
