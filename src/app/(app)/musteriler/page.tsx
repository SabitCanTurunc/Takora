import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import MusterilerView from "./musteriler-view";

export default async function MusterilerPage() {
  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  const musterilerRaw = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all()
    : [];

  const araclarRaw = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all().then(async (ms) => {
        const ids = ms.map((m) => m.id);
        if (ids.length === 0) return [];
        return db.orm.public.Arac.where((a) => a.musteriId.in(ids)).all();
      })
    : [];

  const islerRaw = isletmeId
    ? await db.orm.public.Is.where({ isletmeId }).all()
    : [];

  const musteriMap = new Map(musterilerRaw.map((m) => [m.id, m]));
  const aracMap = new Map(araclarRaw.map((a) => [a.id, a]));

  const musteriler = musterilerRaw.map((m) => ({
    id: m.id,
    ad: m.ad,
    soyad: m.soyad,
    telefon: m.telefon,
    email: m.email,
    notlar: m.notlar,
  }));

  const araclar = araclarRaw.map((a) => ({
    id: a.id,
    musteriId: a.musteriId,
    plaka: a.plaka,
    marka: a.marka,
    yil: a.yil,
    km: a.km,
  }));

  const isler = islerRaw.map((is) => {
    const musteri = is.musteriId ? musteriMap.get(is.musteriId) : null;
    const arac = is.aracId ? aracMap.get(is.aracId) : null;
    const createdAt = new Date(is.createdAt);
    return {
      id: is.id,
      musteriId: is.musteriId,
      aracId: is.aracId,
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
    <MusterilerView
      musteriler={musteriler}
      araclar={araclar}
      isler={isler as unknown as import("./musteriler-view").MusteriIs[]}
    />
  );
}