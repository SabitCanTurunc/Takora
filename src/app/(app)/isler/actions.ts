"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { aktifIsletmeId, yetkiKontrol } from "@/lib/tenant";
import { r2, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getWhatsappProvider } from "@/lib/whatsapp";
import { plakaExtract } from "@/lib/ai";

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
  // Önce telefon ile ara
  if (telefon) {
    const temizTel = telefon.replace(/\D/g, "");
    const musteriler = await db.orm.public.Musteri.where({ isletmeId }).all();
    const mevcut = musteriler.find(
      (m) => m.telefon && m.telefon.replace(/\D/g, "") === temizTel
    );
    if (mevcut) return mevcut;
  }

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
  isletmeId: string,
  musteriId: string,
  plaka?: string,
  markaModel?: string
) {
  if (!plaka) return null;

  const temiz = plaka.replace(/\s+/g, "").toUpperCase();

  // Aynı işletmedeki tüm müşterilerin araçlarında plakayı ara
  const musteriler = await db.orm.public.Musteri.where({ isletmeId }).all();
  const musteriIds = new Set(musteriler.map((m) => m.id));
  const tumAraclar = await db.orm.public.Arac.all();
  const mevcut = tumAraclar.find(
    (a) =>
      musteriIds.has(a.musteriId) &&
      a.plaka &&
      a.plaka.replace(/\s+/g, "").toUpperCase() === temiz
  );
  if (mevcut) return mevcut;

  return db.orm.public.Arac.create({
    musteriId,
    plaka: plaka.toUpperCase(),
    marka: markaModel || null,
  });
}

export async function isEkle(formData: FormData) {
  await yetkiKontrol("CALISAN");
  const isletmeId = await aktifIsletmeId();

  const baslik = String(formData.get("baslik") || "").trim();
  const musteri = String(formData.get("musteri") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const plaka = String(formData.get("plaka") || "").trim();
  const markaModel = String(formData.get("markaModel") || "").trim();
  const tahminiTutarRaw = String(formData.get("tahminiTutar") || "").trim();
  const kmRaw = String(formData.get("km") || "").trim();
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
    isletmeId,
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
    km: kmRaw ? Number(kmRaw) : null,
  });

  // Araç kilometresini güncelle
  if (aracKaydi && kmRaw) {
    await db.orm.public.Arac.where({ id: aracKaydi.id }).update({
      km: Number(kmRaw),
    });
  }

  revalidatePath("/isler");
  revalidatePath("/musteriler");
  revalidatePath("/araclar");
  revalidatePath("/dashboard");
  return null;
}

export async function isAsamaGuncelle(isId: string, asama: IsAsama) {
  await yetkiKontrol("CALISAN");
  await db.orm.public.Is.where({ id: isId }).update({ asama });
  revalidatePath("/isler");
  return null;
}

export async function isNotEkle(isId: string, icerik: string) {
  if (!icerik.trim()) return { hata: "Not boş olamaz." };
  await yetkiKontrol("CALISAN");
  await db.orm.public.IsNot.create({
    isId,
    icerik: icerik.trim(),
  });
  revalidatePath("/isler");
  return null;
}

export async function takipLinkiOlustur(isId: string) {
  await yetkiKontrol("YONETICI");
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  await db.orm.public.Is.where({ id: isId }).update({
    takipToken: token,
    takipTokenExpiresAt: expiresAt,
  });
  revalidatePath("/isler");
  return { token, url: `/takip/${token}`, expiresAt: expiresAt.toISOString() };
}

export async function takipLinkiIptal(isId: string) {
  await yetkiKontrol("YONETICI");
  await db.orm.public.Is.where({ id: isId }).update({ takipToken: null });
  revalidatePath("/isler");
  return null;
}

export async function fotoEkle(isId: string, formData: FormData) {
  const tip = String(formData.get("tip") || "FOTO").trim();
  if (tip === "FATURA") {
    await yetkiKontrol("SAHIP");
  } else {
    await yetkiKontrol("CALISAN");
  }
  await aktifIsletmeId();
  const files = formData.getAll("foto") as File[];
  const validFiles = files.filter((f) => f && f.size > 0);

  if (validFiles.length === 0) return { hata: "Dosya seçilmedi." };

  for (const file of validFiles) {
    if (!file.type.startsWith("image/")) {
      return { hata: "Sadece resim dosyaları yüklenebilir." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { hata: "Dosya 5MB'dan büyük olamaz." };
    }

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
      tip,
    });
  }

  revalidatePath("/isler");
  return null;
}
export async function whatsappMesajGonder(isId: string, sablonKey: string) {
  await yetkiKontrol("CALISAN");
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

export async function musteriAra(telefon: string) {
  const isletmeId = await aktifIsletmeId();
  if (!telefon.trim()) return { musteri: null, araclar: [] };

  const temizTel = telefon.replace(/\D/g, "");
  const musteriler = await db.orm.public.Musteri.where({ isletmeId }).all();
  const musteri = musteriler.find(
    (m) => m.telefon && m.telefon.replace(/\D/g, "") === temizTel
  );

  if (!musteri) return { musteri: null, araclar: [] };

  const araclar = await db.orm.public.Arac.where({ musteriId: musteri.id }).all();
  return {
    musteri: { id: musteri.id, ad: musteri.ad, telefon: musteri.telefon },
    araclar: araclar.map((a) => ({ id: a.id, plaka: a.plaka, marka: a.marka })),
  };
}

export async function aracAra(plaka: string) {
  const isletmeId = await aktifIsletmeId();
  if (!plaka.trim()) return { musteri: null, arac: null };

  const temizPlaka = plaka.replace(/\s+/g, "").toUpperCase();
  const musteriler = await db.orm.public.Musteri.where({ isletmeId }).all();
  const musteriIds = new Set(musteriler.map((m) => m.id));
  const araclar = await db.orm.public.Arac.all();
  const arac = araclar.find(
    (a) =>
      musteriIds.has(a.musteriId) &&
      a.plaka && a.plaka.replace(/\s+/g, "").toUpperCase() === temizPlaka
  );

  if (!arac) return { musteri: null, arac: null };

  const musteri = musteriler.find((m) => m.id === arac.musteriId) || null;
  return {
    musteri: musteri ? { id: musteri.id, ad: musteri.ad, telefon: musteri.telefon } : null,
    arac: { id: arac.id, plaka: arac.plaka, marka: arac.marka },
  };
}

export async function fotoSil(isId: string, fotoId: string) {
  await aktifIsletmeId();

  const foto = await db.orm.public.IsFoto.where({ id: fotoId }).first();
  if (!foto) return { hata: "Fotoğraf bulunamadı." };

  if ((foto.tip || "FOTO") === "FATURA") {
    await yetkiKontrol("SAHIP");
  } else {
    await yetkiKontrol("CALISAN");
  }

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: foto.key,
      })
    );
  } catch {
    // R2'den silinemezse DB kaydını yine de sil
  }

  await db.orm.public.IsFoto.where({ id: fotoId }).delete();
  revalidatePath("/isler");
  return null;
}

export async function aktifRolGetir() {
  const { aktifUyelik } = await import("@/lib/tenant");
  const { uyelik } = await aktifUyelik();
  return uyelik.rol as string;
}

export async function plakaOcr(formData: FormData) {
  const isletmeId = await aktifIsletmeId();

  const isletme = await db.orm.public.Isletme.where({ id: isletmeId }).first();
  const plan = isletme?.plan || "FREE";

  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) return { hata: "Dosya seçilmedi." };
  if (!file.type.startsWith("image/")) return { hata: "Sadece resim dosyaları yüklenebilir." };

  if (plan === "FREE") {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const kullanimlar = await db.orm.public.OcrKullanim.where({ isletmeId }).all();
    const bugunKullanim = kullanimlar.filter((k) => new Date(k.tarih) >= bugun).length;
    if (bugunKullanim >= 3) {
      return { hata: "Günlük ücretsiz OCR limiti (3) doldu. Premium'a geçin." };
    }
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const resized = await (await import("sharp")).default(inputBuffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  try {
    const plaka = await plakaExtract(resized, "image/jpeg");
    await db.orm.public.OcrKullanim.create({ isletmeId, sayi: 1 });
    return { plaka };
  } catch (error) {
    return { hata: String(error) };
  }
}
