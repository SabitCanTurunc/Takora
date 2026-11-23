"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function girisYap(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { hata: "E-posta veya şifre hatalı." };
        default:
          return { hata: "Giriş sırasında bir hata oluştu." };
      }
    }
    throw error; // redirect throws, re-throw it
  }
}
