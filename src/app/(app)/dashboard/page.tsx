import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Genel Bakış" };

export default async function DashboardPage() {
  const session = await auth();
  const kullaniciAdi = session?.user?.name?.split(" ")[0] || "Usta";

  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  const islerRaw = isletmeId
    ? await db.orm.public.Is.where({ isletmeId }).all()
    : [];

  const musteriler = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all()
    : [];
  const musteriMap = new Map(musteriler.map((m) => [m.id, m]));

  const aracIds = islerRaw
    .map((i) => i.aracId)
    .filter((id): id is string => Boolean(id));
  const araclar =
    aracIds.length > 0
      ? await db.orm.public.Arac.where((a) => a.id.in(aracIds)).all()
      : [];
  const aracMap = new Map(araclar.map((a) => [a.id, a]));

  const isIds = islerRaw.map((i) => i.id);
  const notlar =
    isIds.length > 0
      ? await db.orm.public.IsNot.where((n) => n.isId.in(isIds)).all()
      : [];
  const notMap = new Map<string, { id: string; metin: string; tarih: string }[]>();
  for (const n of notlar) {
    const tarih = new Date(n.createdAt).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const list = notMap.get(n.isId) || [];
    list.push({ id: n.id, metin: n.icerik, tarih: `Bugün ${tarih}` });
    notMap.set(n.isId, list);
  }

  const fotolar =
    isIds.length > 0
      ? await db.orm.public.IsFoto.where((f) => f.isId.in(isIds)).all()
      : [];
  const fotoMap = new Map<string, { id: string; key: string; tip?: string }[]>();
  for (const f of fotolar) {
    const list = fotoMap.get(f.isId) || [];
    list.push({ id: f.id, key: f.key, tip: f.tip });
    fotoMap.set(f.isId, list);
  }

  const isler = islerRaw.map((is) => {
    const musteri = is.musteriId ? musteriMap.get(is.musteriId) : null;
    const arac = is.aracId ? aracMap.get(is.aracId) : null;
    const createdAt = new Date(is.createdAt);
    return {
      id: is.id,
      baslik: is.baslik,
      musteriAd: musteri?.ad || "Müşteri",
      plaka: arac?.plaka || undefined,
      markaModel: arac?.marka || undefined,
      asama: is.asama as "BEKLIYOR" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "TESLIM_EDILDI" | "IPTAL",
      saat: createdAt.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      telefon: musteri?.telefon || undefined,
      tahminiTutar: is.tahminiTutar,
      km: is.km,
      aciklama: is.aciklama,
      notlar: notMap.get(is.id) || [],
      fotolar: fotoMap.get(is.id) || [],
      takipToken: is.takipToken,
    };
  });

  return <DashboardView kullaniciAdi={kullaniciAdi} isler={isler} />;
}