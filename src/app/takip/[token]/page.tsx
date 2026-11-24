import { db } from "@/prisma/db";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function TakipPage({ params }: Props) {
  const { token } = await params;

  const is = await db.orm.public.Is.where({ takipToken: token }).first();
  if (!is) notFound();

  if (is.takipTokenExpiresAt && new Date(is.takipTokenExpiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Linkin süresi doldu
          </h1>
          <p className="text-sm text-zinc-500">
            Bu takip linki artık geçerli değil. Lütfen işletmeden yeni bir link isteyin.
          </p>
        </div>
      </div>
    );
  }

  const musteri = is.musteriId
    ? await db.orm.public.Musteri.where({ id: is.musteriId }).first()
    : null;
  const arac = is.aracId
    ? await db.orm.public.Arac.where({ id: is.aracId }).first()
    : null;
  const fotolar = await db.orm.public.IsFoto.where({ isId: is.id }).all();

  const asamaLabel: Record<string, string> = {
    BEKLIYOR: "Bekliyor",
    DEVAM_EDIYOR: "İşlemde",
    TAMAMLANDI: "Hazır / Tamamlandı",
    TESLIM_EDILDI: "Teslim Edildi",
    IPTAL: "İptal",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {is.baslik}
        </h1>
        <p className="text-sm text-zinc-500">
          İş durumunuz aşağıda görüntülenmektedir.
        </p>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
          <span className="text-xs text-zinc-500 block mb-1">Durum</span>
          <span className="text-base font-semibold text-zinc-900 dark:text-white">
            {asamaLabel[is.asama] || is.asama}
          </span>
        </div>

        {arac?.plaka && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
            <span className="text-xs text-zinc-500 block mb-1">Araç</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {arac.plaka}
              {arac.marka ? ` — ${arac.marka}` : ""}
            </span>
          </div>
        )}

        {musteri?.ad && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
            <span className="text-xs text-zinc-500 block mb-1">Müşteri</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {musteri.ad}
            </span>
          </div>
        )}

        {fotolar.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Fotoğraflar
            </span>
            <div className="grid grid-cols-3 gap-2">
              {fotolar.map((f) => (
                <a
                  key={f.id}
                  href={`/api/fotograf?key=${encodeURIComponent(f.key)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/fotograf?key=${encodeURIComponent(f.key)}`}
                    alt="İş fotoğrafı"
                    className="h-full w-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-400 text-center mt-2">
          Takora ile güvenle takip edin.
        </p>
      </div>
    </div>
  );
}