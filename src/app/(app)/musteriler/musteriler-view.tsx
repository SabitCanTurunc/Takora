"use client";

import { useState, useMemo } from "react";
import { Users, Plus, Phone, Mail, Car, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YeniMusteriDialog } from "@/components/dialogs/yeni-musteri-dialog";
import { IsDetayDialog, type IsDetay } from "@/components/dialogs/is-detay-dialog";

type Musteri = {
  id: string;
  ad: string;
  soyad: string | null;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
};

type Arac = {
  id: string;
  musteriId: string;
  plaka: string | null;
  marka: string | null;
  yil: number | null;
  km: number | null;
};

export type MusteriIs = {
  id: string;
  musteriId: string | null;
  aracId: string | null;
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
  musteriler: Musteri[];
  araclar: Arac[];
  isler: MusteriIs[];
}

export default function MusterilerView({ musteriler, araclar, isler }: Props) {
  const [seciliMusteriId, setSeciliMusteriId] = useState<string | null>(null);
  const [seciliIsId, setSeciliIsId] = useState<string | null>(null);
  const [arama, setArama] = useState("");

  const filtrelenmisMusteriler = useMemo(() => {
    const term = arama.trim().toLowerCase();
    if (!term) return musteriler;
    return musteriler.filter((m) => {
      const adSoyad = `${m.ad} ${m.soyad || ""}`.toLowerCase();
      return (
        adSoyad.includes(term) ||
        (m.telefon || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term) ||
        (m.notlar || "").toLowerCase().includes(term)
      );
    });
  }, [musteriler, arama]);

  const seciliMusteri = musteriler.find((m) => m.id === seciliMusteriId) || null;
  const musteriAraclar = seciliMusteri
    ? araclar.filter((a) => a.musteriId === seciliMusteri.id)
    : [];
  const musteriIsler = seciliMusteri
    ? isler.filter((i) => i.musteriId === seciliMusteri.id)
    : [];
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

      <input
        type="search"
        placeholder="Müşteri adı, telefon veya e-posta ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      {filtrelenmisMusteriler.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
            <Users className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300">Henüz müşteri yok</h3>
          <div className="mt-5">
            <YeniMusteriDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrelenmisMusteriler.map((m) => (
            <Card
              key={m.id}
              className="p-5 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSeciliMusteriId(m.id)}
            >
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
                  {m.ad} {m.soyad || ""}
                </h3>
                <div className="flex flex-col gap-1.5 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {m.telefon && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      {m.telefon}
                    </span>
                  )}
                  {m.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      {m.email}
                    </span>
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

      {/* Müşteri Detay Dialog */}
      {seciliMusteri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSeciliMusteriId(null)}>
          <div
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {seciliMusteri.ad} {seciliMusteri.soyad || ""}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Müşteri Profili</p>
              </div>
              <button
                onClick={() => setSeciliMusteriId(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-500 block mb-1">Telefon</span>
                <p className="text-sm font-medium">{seciliMusteri.telefon || "-"}</p>
              </div>
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-500 block mb-1">E-posta</span>
                <p className="text-sm font-medium">{seciliMusteri.email || "-"}</p>
              </div>
            </div>

            {seciliMusteri.notlar && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg text-sm mb-4">
                {seciliMusteri.notlar}
              </div>
            )}

            {/* Araçlar */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Car className="h-4 w-4" /> Araçlar ({musteriAraclar.length})
              </h3>
              {musteriAraclar.length === 0 ? (
                <p className="text-xs text-zinc-400">Kayıtlı araç yok.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {musteriAraclar.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-sm font-bold">{a.plaka}</span>
                        {a.marka && (
                          <span className="text-xs text-zinc-500 ml-2">{a.marka}</span>
                        )}
                      </div>
                      {a.km != null && (
                        <span className="text-xs text-zinc-400">{a.km.toLocaleString("tr-TR")} km</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* İş Geçmişi */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> İş Geçmişi ({musteriIsler.length})
              </h3>
              {musteriIsler.length === 0 ? (
                <p className="text-xs text-zinc-400">İş kaydı yok.</p>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  {musteriIsler.map((is) => (
                    <li key={is.id}>
                      <button
                        type="button"
                        onClick={() => setSeciliIsId(is.id)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{is.baslik}</p>
                          <p className="text-xs text-zinc-500">
                            {is.plaka} {is.markaModel ? `(${is.markaModel})` : ""}
                          </p>
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