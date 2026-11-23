"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId, aktifUyelik, yetkiKontrol } from "@/lib/tenant";


export async function isletmeGuncelle(formData: FormData) {
  await yetkiKontrol("YONETICI");

  const isletmeId = await aktifIsletmeId();
  const ad = String(formData.get("ad") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const adres = String(formData.get("adres") || "").trim();
  const sektor = String(formData.get("sektor") || "").trim();

  if (!ad) return { hata: "İşletme adı zorunludur." };

  await db.orm.public.Isletme.where({ id: isletmeId }).update({
    ad,
    telefon: telefon || null,
    adres: adres || null,
    sektor: sektor || "oto-servis",
  });

  revalidatePath("/ayarlar");
  return null;
}

export async function uyeEkle(formData: FormData) {
  await yetkiKontrol("YONETICI");

  const isletmeId = await aktifIsletmeId();
  const email = String(formData.get("email") || "").trim();
  const rol = String(formData.get("rol") || "CALISAN").trim();

  if (!email) return { hata: "E-posta zorunludur." };

  const user = await db.orm.public.User.where({ email }).first();
  if (!user) return { hata: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." };

  const mevcut = await db.orm.public.IsletmeUye.where({
    isletmeId,
    userId: user.id,
  }).first();
  if (mevcut) return { hata: "Kullanıcı zaten bu işletmeye üye." };

  await db.orm.public.IsletmeUye.create({
    isletmeId,
    userId: user.id,
    rol: rol as "SAHIP" | "YONETICI" | "CALISAN",
    aktif: true,
  });

  revalidatePath("/ayarlar");
  return null;
}

export async function uyeRolGuncelle(formData: FormData) {
  await yetkiKontrol("SAHIP");

  const uyeId = String(formData.get("uyeId") || "").trim();
  const rol = String(formData.get("rol") || "").trim();

  await db.orm.public.IsletmeUye.where({ id: uyeId }).update({
    rol: rol as "SAHIP" | "YONETICI" | "CALISAN",
  });

  revalidatePath("/ayarlar");
  return null;
}

export async function uyeCikar(formData: FormData) {
  await yetkiKontrol("SAHIP");

  const uyeId = String(formData.get("uyeId") || "").trim();

  const { uyelik } = await aktifUyelik();
  const hedef = await db.orm.public.IsletmeUye.where({ id: uyeId }).first();
  if (!hedef) return { hata: "Üye bulunamadı." };
  if (hedef.id === uyelik.id) return { hata: "Kendinizi çıkaramazsınız." };

  await db.orm.public.IsletmeUye.where({ id: uyeId }).delete();
  revalidatePath("/ayarlar");
  return null;
}