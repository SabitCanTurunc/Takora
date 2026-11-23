import { db } from "@/prisma/db";
import { aktifIsletmeId } from "@/lib/tenant";
import { Users, Plus, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YeniMusteriDialog } from "@/components/dialogs/yeni-musteri-dialog";

export default async function MusterilerPage() {
  let isletmeId: string | null = null;
  try {
    isletmeId = await aktifIsletmeId();
  } catch {
    isletmeId = null;
  }

  const musteriler = isletmeId
    ? await db.orm.public.Musteri.where({ isletmeId }).all()
    : [];

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Müşteriler</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Kayıtlı müşteri profilleri ({musteriler.length})
          </p>
        </div>
        <YeniMusteriDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Müşteri Ekle
            </Button>
          }
        />
      </div>

      {musteriler.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <Users className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300">Henüz müşteri yok</h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-1">
            İlk müşterinizi ekleyin. İletişim bilgileri ve araçları tek yerde takip edin.
          </p>
          <div className="mt-5">
            <YeniMusteriDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {musteriler.map((m) => (
            <Card key={m.id} className="p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
                    {m.ad}
                    {m.soyad ? ` ${m.soyad}` : ""}
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {m.telefon ? (
                    <a
                      href={`tel:${m.telefon}`}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      {m.telefon}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      Telefon belirtilmedi
                    </span>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      {m.email}
                    </a>
                  )}
                </div>

                {m.notlar && (
                  <p className="mt-3 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg">
                    {m.notlar}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}