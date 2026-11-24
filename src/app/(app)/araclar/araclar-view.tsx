"use client";

import { useState, useMemo } from "react";
import { Car, Plus, User, Gauge, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YeniAracDialog } from "@/components/dialogs/yeni-arac-dialog";
import { IsDetayDialog, type IsDetay } from "@/components/dialogs/is-detay-dialog";

type Arac = {
  id: string;
  plaka: string | null;
  marka: string | null;
  yil: number | null;
  km: number | null;
  musteriId: string;
};

type Musteri = {
  id: string;
  ad: string;
  telefon: string | null;
};

export type Is = {
  id: string;
  aracId: string | null;
  musteriId: string | null;
  baslik: string;
  asama: string;
  saat?: string;
  plaka?: string;
  markaModel?: string;
  telefon?: string;
  tahminiTutar?: number | null;
  aciklama?: string | null;
  notlar: { id: string; metin: string; tarih: string }[];
};

interface Props {
  araclar: Arac[];
  musteriler: Musteri[];
  isler: Is[];
}

export default function AraclarView({ araclar, musteriler, isler }: Props) {
  const [seciliAracId, setSeciliAracId] = useState<string | null>(null);
  const [seciliIsId, setSeciliIsId] = useState<string | null>(null);
  const [arama, setArama] = useState("");

  const filtrelenmisAraclar = useMemo(() => {
    const term = arama.trim().toLowerCase();
    if (!term) return araclar;
    return araclar.filter((a) => {
      const musteri = musteriler.find((m) => m.id === a.musteriId);
      return (
        (a.plaka || "").toLowerCase().includes(term) ||
        (a.marka || "").toLowerCase().includes(term) ||
        (musteri?.ad || "").toLowerCase().includes(term) ||
        String(a.yil || "").includes(term) ||
        String(a.km || "").includes(term)
      );
    });
  }, [araclar, musteriler, arama]);

  const seciliArac = araclar.find((a) => a.id === seciliAracId) || null;
  const sahip = seciliArac ? musteriler.find((m) => m.id === seciliArac.musteriId) : null;
  const aracIsler = seciliArac ? isler.filter((i) => i.aracId === seciliArac.id) : [];
  const seciliIs = isler.find((i) => i.id === seciliIsId) || null;

  const asamaLabel: Record<string, string> = {
    BEKLIYOR: "Bekliyor",
    DEVAM_EDIYOR: "Devam Ediyor",
    TAMAMLANDI: "Tamamlandı",
    TESLIM_EDILDI: "Teslim Edildi",
    IPTAL: "İptal",
  };

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

      <input
        type="search"
        placeholder="Plaka, marka/model, sahip veya km ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      {filtrelenmisAraclar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <Car className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300">Henüz kayıtlı araç yok</h3>
          <div className="mt-5">
            <YeniAracDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrelenmisAraclar.map((a) => {
            const musteri = musteriler.find((m) => m.id === a.musteriId);
            return (
              <Card
                key={a.id}
                className="p-5 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSeciliAracId(a.id)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-1 rounded-md font-bold tracking-wide">
                        {a.plaka || "-"}
                      </span>
                      {a.yil && <span className="text-xs text-zinc-400">({a.yil})</span>}
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

      {/* Araç Detay Dialog */}
      {seciliArac && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSeciliAracId(null)}>
          <div
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {seciliArac.plaka || "Plaka yok"}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {seciliArac.marka || "Marka/Model belirtilmedi"}
                </p>
              </div>
              <button
                onClick={() => setSeciliAracId(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-500 block mb-1">Sahibi</span>
                <p className="text-sm font-medium">{sahip?.ad || "Bilinmiyor"}</p>
                {sahip?.telefon && (
                  <p className="text-xs text-zinc-500 mt-1">{sahip.telefon}</p>
                )}
              </div>
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-500 block mb-1">Kilometre</span>
                <p className="text-sm font-medium">
                  {seciliArac.km != null ? `${seciliArac.km.toLocaleString("tr-TR")} km` : "-"}
                </p>
              </div>
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-500 block mb-1">Model Yılı</span>
                <p className="text-sm font-medium">{seciliArac.yil || "-"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> İş Geçmişi ({aracIsler.length})
              </h3>
              {aracIsler.length === 0 ? (
                <p className="text-xs text-zinc-400">İş kaydı yok.</p>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  {aracIsler.map((is) => (
                    <li key={is.id}>
                      <button
                        type="button"
                        onClick={() => setSeciliIsId(is.id)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{is.baslik}</p>
                          <p className="text-xs text-zinc-500">{is.saat}</p>
                        </div>
                        <Badge variant={is.asama === "DEVAM_EDIYOR" ? "info" : is.asama === "TAMAMLANDI" ? "success" : "default"}>
                          {asamaLabel[is.asama] || is.asama}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <IsDetayDialog
        isKaydi={seciliIs as unknown as IsDetay}
        open={Boolean(seciliIs)}
        onOpenChange={(acik) => {
          if (!acik) setSeciliIsId(null);
        }}
      />
    </div>
  );
}