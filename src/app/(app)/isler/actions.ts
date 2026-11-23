"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId } from "@/lib/tenant";
import { r2, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getWhatsappProvider } from "@/lib/whatsapp";

type IsAsama =
  | "BEKLIYOR"
  | "DEVAM_EDIYOR"
  | "TAMAMLANDI"
  | "TESLIM_EDILDI"
  | "IPTAL";

async function musteriBulVeyaOlustur(
  isletmeId: string,
  ad: string,
  telefon?: string,
  plaka?: string
) {
  const mevcut = (
    await db.orm.public.Musteri.where({ isletmeId, ad }).all()
  )[0];
  if (mevcut) return mevcut;

  return db.orm.public.Musteri.create({
    isletmeId,
    ad,
    telefon: telefon || null,
    notlar: plaka ? `İş kaydı üzerinden otomatik oluşturuldu` : null,
  });
}

async function aracBulVeyaOlustur(
  musteriId: string,
  plaka?: string,
  markaModel?: string
) {
  if (!plaka) return null;

  const temiz = plaka.replace(/\s+/g, "").toUpperCase();
  const mevcutlar = await db.orm.public.Arac.where({ musteriId }).all();
  const mevcut = mevcutlar.find(
    (a) => a.plaka && a.plaka.replace(/\s+/g, "").toUpperCase() === temiz
  );
  if (mevcut) return mevcut;

  return db.orm.public.Arac.create({
    musteriId,
    plaka: plaka.toUpperCase(),
    marka: markaModel || null,
  });
}

export async function isEkle(formData: FormData) {
  const isletmeId = await aktifIsletmeId();

  const baslik = String(formData.get("baslik") || "").trim();
  const musteri = String(formData.get("musteri") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const plaka = String(formData.get("plaka") || "").trim();
  const markaModel = String(formData.get("markaModel") || "").trim();
  const tahminiTutarRaw = String(formData.get("tahminiTutar") || "").trim();
  const aciklama = String(formData.get("aciklama") || "").trim();
  const asama = (String(formData.get("asama") || "BEKLIYOR").trim() ||
    "BEKLIYOR") as IsAsama;

  if (!baslik || !musteri) {
    return { hata: "İş başlığı ve müşteri zorunludur." };
  }

  const musteriKaydi = await musteriBulVeyaOlustur(
    isletmeId,
    musteri,
    telefon,
    plaka
  );
  const aracKaydi = await aracBulVeyaOlustur(
    musteriKaydi.id,
    plaka,
    markaModel
  );

  await db.orm.public.Is.create({
    isletmeId,
    musteriId: musteriKaydi.id,
    aracId: aracKaydi?.id || null,
    baslik,
    aciklama: aciklama || null,
    asama,
    tahminiTutar: tahminiTutarRaw ? Number(tahminiTutarRaw) : null,
  });

  revalidatePath("/isler");
  revalidatePath("/musteriler");
  revalidatePath("/araclar");
  revalidatePath("/dashboard");
  return null;
}

export async function isAsamaGuncelle(isId: string, asama: IsAsama) {
  await aktifIsletmeId();
  await db.orm.public.Is.where({ id: isId }).update({ asama });
  revalidatePath("/isler");
  return null;
}

export async function isNotEkle(isId: string, icerik: string) {
  if (!icerik.trim()) return { hata: "Not boş olamaz." };
  await aktifIsletmeId();
  await db.orm.public.IsNot.create({
    isId,
    icerik: icerik.trim(),
  });
  revalidatePath("/isler");
  return null;
}

export async function takipLinkiOlustur(isId: string) {
  await aktifIsletmeId();
  const token = randomUUID();
  await db.orm.public.Is.where({ id: isId }).update({ takipToken: token });
  revalidatePath("/isler");
  return { token, url: `/takip/${token}` };
}

export async function takipLinkiIptal(isId: string) {
  await aktifIsletmeId();
  await db.orm.public.Is.where({ id: isId }).update({ takipToken: null });
  revalidatePath("/isler");
  return null;
}

export async function fotoEkle(isId: string, formData: FormData) {
  await aktifIsletmeId();

  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) return { hata: "Dosya seçilmedi." };
  if (!file.type.startsWith("image/")) return { hata: "Sadece resim dosyaları yüklenebilir." };
  if (file.size > 5 * 1024 * 1024) return { hata: "Dosya 5MB'dan büyük olamaz." };

  const uzanti = file.name.split(".").pop() || "jpg";
  const key = `isler/${isId}/${randomUUID()}.${uzanti}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  await db.orm.public.IsFoto.create({
    isId,
    key,
  });

  revalidatePath("/isler");
  return null;
}
export async function whatsappMesajGonder(isId: string, sablonKey: string) {
  const isletmeId = await aktifIsletmeId();

  const is = await db.orm.public.Is.where({ id: isId }).first();
  if (!is) return { hata: "İş bulunamadı." };

  const musteri = is.musteriId
    ? await db.orm.public.Musteri.where({ id: is.musteriId }).first()
    : null;

  if (!musteri?.telefon) {
    return { hata: "Müşteri telefonu bulunamadı." };
  }

  const asamaLabel: Record<string, string> = {
    BEKLIYOR: "Bekliyor",
    DEVAM_EDIYOR: "İşlemde",
    TAMAMLANDI: "Hazır / Tamamlandı",
    TESLIM_EDILDI: "Teslim Edildi",
    IPTAL: "İptal",
  };

  let icerik = "";
  if (sablonKey === "TESLIME_HAZIR") {
    icerik = `Merhaba ${musteri.ad}, ${is.baslik} işiniz teslime hazır.`;
  } else {
    icerik = `Merhaba ${musteri.ad}, ${is.baslik} işinizin durumu: ${asamaLabel[is.asama] || is.asama}.`;
  }

  if (is.takipToken) {
    icerik += ` Takip: ${process.env.NEXTAUTH_URL || ""}/takip/${is.takipToken}`;
  }

  const mesaj = await db.orm.public.WhatsappMesaj.create({
    isletmeId,
    aliciTelefon: musteri.telefon,
    sablonKey,
    icerik,
    durum: "BEKLIYOR",
  });

  const provider = getWhatsappProvider();
  const sonuc = await provider.send(musteri.telefon, icerik);

  await db.orm.public.WhatsappMesaj.where({ id: mesaj.id }).update({
    durum: sonuc.ok ? "GONDERILDI" : "HATA",
    hata: sonuc.ok ? null : sonuc.error || null,
  });

  revalidatePath("/isler");
  return sonuc.ok ? null : { hata: sonuc.error || "Gönderim başarısız." };
}
