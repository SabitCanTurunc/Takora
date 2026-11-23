"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId } from "@/lib/tenant";
import { geminiExtract, openaiExtract, providerForPlan } from "@/lib/ai";
import sharp from "sharp";

export async function aracEkle(formData: FormData) {
  const isletmeId = await aktifIsletmeId();

  const plaka = String(formData.get("plaka") || "").trim().toUpperCase();
  const markaModel = String(formData.get("markaModel") || "").trim();
  const yilRaw = String(formData.get("yil") || "").trim();
  const kmRaw = String(formData.get("km") || "").trim();
  const musteriAd = String(formData.get("musteri") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();

  if (!plaka || !musteriAd) {
    return { hata: "Plaka ve müşteri adı zorunludur." };
  }

  let musteri = (
    await db.orm.public.Musteri.where({ isletmeId, ad: musteriAd }).all()
  )[0];

  if (!musteri) {
    musteri = await db.orm.public.Musteri.create({
      isletmeId,
      ad: musteriAd,
      telefon: telefon || null,
    });
  }

  await db.orm.public.Arac.create({
    musteriId: musteri.id,
    plaka,
    marka: markaModel || null,
    yil: yilRaw ? Number(yilRaw) : null,
    km: kmRaw ? Number(kmRaw) : null,
  });

  revalidatePath("/araclar");
  revalidatePath("/musteriler");
  return null;
}
export async function ruhsatOcr(formData: FormData) {
  const isletmeId = await aktifIsletmeId();

  const isletme = await db.orm.public.Isletme.where({ id: isletmeId }).first();
  const plan = isletme?.plan || "FREE";

  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) {
    return { hata: "Dosya seçilmedi." };
  }
  if (!file.type.startsWith("image/")) {
    return { hata: "Sadece resim dosyaları yüklenebilir." };
  }

  // Free plan: günlük 3 kullanım limiti
  if (plan === "FREE") {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const kullanimlar = await db.orm.public.OcrKullanim.where({ isletmeId }).all();
    const bugunKullanim = kullanimlar.filter(
      (k) => new Date(k.tarih) >= bugun
    ).length;
    if (bugunKullanim >= 3) {
      return { hata: "Günlük ücretsiz OCR limiti (3) doldu. Premium'a geçin." };
    }
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // Görseli AI'a göndermeden önce boyutlandır ve sıkıştır
  const resizedBuffer = await sharp(inputBuffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const provider = providerForPlan(plan);

  try {
    const sonuc =
      provider === "openai"
        ? await openaiExtract(resizedBuffer, "image/jpeg")
        : await geminiExtract(resizedBuffer, "image/jpeg");

    await db.orm.public.OcrKullanim.create({
      isletmeId,
      sayi: 1,
    });

    return { veri: sonuc };
  } catch (error) {
    return { hata: String(error) };
  }
}
