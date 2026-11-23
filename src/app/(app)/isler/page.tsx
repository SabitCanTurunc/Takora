import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import IslerView from "./isler-view";

export default async function IslerPage() {
  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  if (!isletmeId) {
    return <IslerView isler={[]} />;
  }

  const isler = await db.orm.public.Is.where({ isletmeId }).all();
  const musteriler = await db.orm.public.Musteri.where({ isletmeId }).all();
  const musteriMap = new Map(musteriler.map((m) => [m.id, m]));

  const aracIds = isler
    .map((i) => i.aracId)
    .filter((id): id is string => Boolean(id));
  const araclar =
    aracIds.length > 0
      ? await db.orm.public.Arac.where((a) => a.id.in(aracIds)).all()
      : [];
  const aracMap = new Map(araclar.map((a) => [a.id, a]));

  const isIds = isler.map((i) => i.id);
  const notlar =
    isIds.length > 0
      ? await db.orm.public.IsNot.where((n) => n.isId.in(isIds)).all()
      : [];
  const notMap = new Map<string, { id: string; metin: string; tarih: string }[]>();
  for (const n of notlar) {
    const list = notMap.get(n.isId) || [];
    const tarih = new Date(n.createdAt).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    list.push({ id: n.id, metin: n.icerik, tarih: `Bugün ${tarih}` });
    notMap.set(n.isId, list);
  }

  const fotolar =
    isIds.length > 0
      ? await db.orm.public.IsFoto.where((f) => f.isId.in(isIds)).all()
      : [];
  const fotoMap = new Map<string, { id: string; key: string }[]>();
  for (const f of fotolar) {
    const list = fotoMap.get(f.isId) || [];
    list.push({ id: f.id, key: f.key });
    fotoMap.set(f.isId, list);
  }

  const viewIsler = isler.map((is) => {
    const musteri = is.musteriId ? musteriMap.get(is.musteriId) : null;
    const arac = is.aracId ? aracMap.get(is.aracId) : null;
    const createdAt = new Date(is.createdAt);
    return {
      id: is.id,
      baslik: is.baslik,
      musteriId: is.musteriId,
      aracId: is.aracId,
      asama: is.asama as "BEKLIYOR" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "TESLIM_EDILDI" | "IPTAL",
      tahminiTutar: is.tahminiTutar,
      aciklama: is.aciklama,
      saat: createdAt.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      tarih: createdAt.toISOString().split("T")[0],
      musteriAd: musteri?.ad || "Müşteri",
      telefon: musteri?.telefon || undefined,
      plaka: arac?.plaka || undefined,
      markaModel: arac?.marka || undefined,
      notlar: notMap.get(is.id) || [],
      fotolar: fotoMap.get(is.id) || [],
      takipToken: is.takipToken,
    };
  });

  return <IslerView isler={viewIsler} />;
}