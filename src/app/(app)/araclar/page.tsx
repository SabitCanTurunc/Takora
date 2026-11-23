import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import { Car, Plus, User, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YeniAracDialog } from "@/components/dialogs/yeni-arac-dialog";

export default async function AraclarPage() {
  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  const musteriler = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all()
    : [];
  const musteriIds = musteriler.map((m) => m.id);

  const araclar = isletmeId && musteriIds.length > 0
    ? await db.orm.public.Arac.where((a) => a.musteriId.in(musteriIds)).all()
    : [];

  const musteriMap = new Map(musteriler.map((m) => [m.id, m]));

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Araçlar</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Kayıtlı müşteri araçları ({araclar.length})
          </p>
        </div>
        <YeniAracDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Araç Ekle
            </Button>
          }
        />
      </div>

      {araclar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <Car className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300">Henüz kayıtlı araç yok</h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-1">
            Müşteri araçlarını ekleyin. Plaka, marka, model ve kilometreleri takip edin.
          </p>
          <div className="mt-5">
            <YeniAracDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {araclar.map((a) => {
            const musteri = musteriMap.get(a.musteriId);
            return (
              <Card key={a.id} className="p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-1 rounded-md font-bold tracking-wide">
                        {a.plaka}
                      </span>
                      {a.yil && (
                        <span className="text-xs text-zinc-400">({a.yil})</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-zinc-900 dark:text-white text-base mt-2">
                    {a.marka || "Marka/Model belirtilmedi"}
                  </h3>

                  <div className="flex flex-col gap-1.5 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      Sahibi:{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">
                        {musteri?.ad || "Bilinmiyor"}
                      </strong>
                    </span>
                    {a.km != null && (
                      <span className="flex items-center gap-2">
                        <Gauge className="h-3.5 w-3.5 text-zinc-400" />
                        Güncel Km: {a.km.toLocaleString("tr-TR")} km
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}