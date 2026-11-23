"use client";

import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { YeniIsDialog } from "@/components/dialogs/yeni-is-dialog";
import { IsDetayDialog, type IsDetay } from "@/components/dialogs/is-detay-dialog";

type IsKaydi = {
  id: string;
  baslik: string;
  musteriId: string | null;
  aracId: string | null;
  asama: "BEKLIYOR" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "TESLIM_EDILDI" | "IPTAL";
  tahminiTutar: number | null;
  aciklama: string | null;
  saat?: string;
  tarih?: string;
  musteriAd: string;
  telefon?: string;
  plaka?: string;
  markaModel?: string;
  notlar: { id: string; metin: string; tarih: string }[];
  fotolar: { id: string; key: string }[];
  takipToken?: string | null;
};

const asamaBadge: Record<
  IsKaydi["asama"],
  { label: string; variant: "default" | "warning" | "info" | "success" | "outline" }
> = {
  BEKLIYOR: { label: "Bekliyor", variant: "default" },
  DEVAM_EDIYOR: { label: "Devam Ediyor", variant: "info" },
  TAMAMLANDI: { label: "Tamamlandı", variant: "success" },
  TESLIM_EDILDI: { label: "Teslim Edildi", variant: "outline" },
  IPTAL: { label: "İptal", variant: "warning" },
};

export default function IslerView({
  isler,
}: {
  isler: IsKaydi[];
}) {
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<string>("TUMU");

  const filtrelenmis = isler.filter((i) => {
    if (filtre === "TUMU") return true;
    return i.asama === filtre;
  });

  const seciliIs = isler.find((i) => i.id === seciliId) || null;

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">İş Kayıtları</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Tüm servis ve bakım işlemlerini takip edin ({isler.length})
          </p>
        </div>
        <YeniIsDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Yeni İş Aç
            </Button>
          }
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: "TUMU", label: "Tümü" },
          { key: "BEKLIYOR", label: "Bekleyenler" },
          { key: "DEVAM_EDIYOR", label: "Devam Edenler" },
          { key: "TAMAMLANDI", label: "Hazır / Tamamlanan" },
          { key: "TESLIM_EDILDI", label: "Teslim Edilenler" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFiltre(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              filtre === tab.key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtrelenmis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <ClipboardList className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300">Bu filtrede iş bulunamadı</h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-1">
            Yeni bir iş kaydı eklemek için butona tıklayın.
          </p>
          <div className="mt-5">
            <YeniIsDialog />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtrelenmis.map((is) => {
                const badge = asamaBadge[is.asama];
                return (
                  <li key={is.id}>
                    <button
                      type="button"
                      onClick={() => setSeciliId(is.id)}
                      className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {is.baslik}
                          </p>
                          <span className="text-xs text-zinc-400 font-mono">#{is.id.slice(-4)}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 flex items-center flex-wrap gap-2">
                          <span>{is.musteriAd}</span>
                          {is.plaka && (
                            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                              {is.plaka}
                            </span>
                          )}
                          {is.markaModel && <span className="text-zinc-400">({is.markaModel})</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {is.saat && <span className="text-xs text-zinc-400">{is.saat}</span>}
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <IsDetayDialog
        isKaydi={seciliIs as unknown as IsDetay}
        open={Boolean(seciliIs)}
        onOpenChange={(acik) => {
          if (!acik) setSeciliId(null);
        }}
      />
    </div>
  );
}