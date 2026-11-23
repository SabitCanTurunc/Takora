import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import { CalendarClock, Plus, Phone, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YeniRandevuDialog } from "@/components/dialogs/yeni-randevu-dialog";

export default async function RandevularPage() {
  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  const randevularRaw = isletmeId
    ? await db.orm.public.Randevu.where({ isletmeId }).all()
    : [];

  const musteriler = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all()
    : [];
  const musteriMap = new Map(musteriler.map((m) => [m.id, m]));

  const randevular = randevularRaw.map((r) => {
    const musteri = r.musteriId ? musteriMap.get(r.musteriId) : null;
    const dt = new Date(r.tarih);
    return {
      id: r.id,
      baslik: r.baslik,
      musteri: musteri?.ad || "Müşteri",
      telefon: musteri?.telefon || "",
      tarih: dt.toISOString().split("T")[0],
      saat: dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      durum: r.durum as "BEKLIYOR" | "ONAYLANDI" | "TAMAMLANDI" | "IPTAL",
    };
  });

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Randevular</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Müşteri servis randevuları ({randevular.length})
          </p>
        </div>
        <YeniRandevuDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Randevu Oluştur
            </Button>
          }
        />
      </div>

      {randevular.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <CalendarClock className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300">Henüz randevu yok</h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-1">
            Gelecek servis randevularını planlayın ve müşterilerinize zamanında hizmet verin.
          </p>
          <div className="mt-5">
            <YeniRandevuDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {randevular.map((r) => (
            <Card key={r.id} className="p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
                    {r.baslik}
                  </h3>
                  <Badge
                    variant={
                      r.durum === "ONAYLANDI"
                        ? "success"
                        : r.durum === "TAMAMLANDI"
                        ? "outline"
                        : r.durum === "IPTAL"
                        ? "warning"
                        : "default"
                    }
                  >
                    {r.durum === "ONAYLANDI"
                      ? "Onaylandı"
                      : r.durum === "TAMAMLANDI"
                      ? "Tamamlandı"
                      : r.durum === "IPTAL"
                      ? "İptal"
                      : "Bekliyor"}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    Müşteri: {r.musteri}
                  </span>
                  {r.telefon && (
                    <a
                      href={`tel:${r.telefon}`}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      {r.telefon}
                    </a>
                  )}
                  <div className="flex items-center gap-4 text-zinc-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {r.tarih}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      {r.saat}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}