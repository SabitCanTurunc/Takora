import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import AraclarView from "./araclar-view";

export default async function AraclarPage() {
  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  const musterilerRaw = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all()
    : [];
  const musteriIds = musterilerRaw.map((m) => m.id);

  const araclarRaw =
    isletmeId && musteriIds.length > 0
      ? await db.orm.public.Arac.where((a) => a.musteriId.in(musteriIds)).all()
      : [];

  const islerRaw = isletmeId
    ? await db.orm.public.Is.where({ isletmeId }).all()
    : [];

  const musteriMap = new Map(musterilerRaw.map((m) => [m.id, m]));
  const aracMap = new Map(araclarRaw.map((a) => [a.id, a]));

  const musteriler = musterilerRaw.map((m) => ({
    id: m.id,
    ad: m.ad,
    telefon: m.telefon,
  }));

  const araclar = araclarRaw.map((a) => ({
    id: a.id,
    plaka: a.plaka,
    marka: a.marka,
    yil: a.yil,
    km: a.km,
    musteriId: a.musteriId,
  }));

  const isler = islerRaw.map((is) => {
    const musteri = is.musteriId ? musteriMap.get(is.musteriId) : null;
    const arac = is.aracId ? aracMap.get(is.aracId) : null;
    const createdAt = new Date(is.createdAt);
    return {
      id: is.id,
      aracId: is.aracId,
      musteriId: is.musteriId,
      baslik: is.baslik,
      asama: is.asama,
      saat: createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      plaka: arac?.plaka || undefined,
      markaModel: arac?.marka || undefined,
      telefon: musteri?.telefon || undefined,
      tahminiTutar: is.tahminiTutar,
      aciklama: is.aciklama,
      notlar: [],
    };
  });

  return (
    <AraclarView
      araclar={araclar}
      musteriler={musteriler}
      isler={isler as unknown as import("./araclar-view").Is[]}
    />
  );
}