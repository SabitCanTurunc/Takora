"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/utils";

const kayitSchema = z.object({
  adSoyad: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
  isletmeAdi: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export async function kayitOl(formData: FormData) {
  const hamVeri = {
    adSoyad: formData.get("adSoyad"),
    isletmeAdi: formData.get("isletmeAdi"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = kayitSchema.safeParse(hamVeri);
  if (!parsed.success) {
    const ilkHata = parsed.error.issues[0]?.message || "Lütfen formu eksiksiz doldurun.";
    return { hata: ilkHata };
  }

  const mevcutKullanici = await db.orm.public.User.where({
    email: parsed.data.email,
  }).first();

  if (mevcutKullanici) {
    return { hata: "Bu e-posta adresi zaten kayıtlı." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await db.orm.public.User.create({
    email: parsed.data.email,
    name: parsed.data.adSoyad,
    passwordHash,
  });

  const slug = `${slugify(parsed.data.isletmeAdi)}-${Date.now().toString(36)}`;

  const isletme = await db.orm.public.Isletme.create({
    ad: parsed.data.isletmeAdi,
    slug,
    sektor: "oto-servis",
  });

  await db.orm.public.IsletmeUye.create({
    isletmeId: isletme.id,
    userId: user.id,
    rol: "SAHIP",
    aktif: true,
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { hata: "Oturum açılırken bir sorun oluştu." };
    }
    throw error;
  }

  return null;
}