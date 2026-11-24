"use client";

import { useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  PackageCheck,
  Plus,
  UserPlus,
  Car,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { YeniIsDialog } from "@/components/dialogs/yeni-is-dialog";
import { YeniMusteriDialog } from "@/components/dialogs/yeni-musteri-dialog";
import { YeniAracDialog } from "@/components/dialogs/yeni-arac-dialog";
import { YeniRandevuDialog } from "@/components/dialogs/yeni-randevu-dialog";
import { IsDetayDialog, type IsDetay } from "@/components/dialogs/is-detay-dialog";

type IsKaydi = {
  id: string;
  baslik: string;
  musteriAd: string;
  plaka?: string;
  markaModel?: string;
  asama: "BEKLIYOR" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "TESLIM_EDILDI" | "IPTAL";
  saat: string;
  telefon?: string;
  tahminiTutar?: number | null;
  km?: number | null;
  aciklama?: string | null;
  notlar: { id: string; metin: string; tarih: string }[];
  fotolar: { id: string; key: string; tip?: string }[];
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

interface Props {
  kullaniciAdi: string;
  isler: IsKaydi[];
}

export function DashboardView({ kullaniciAdi, isler }: Props) {
  const [seciliId, setSeciliId] = useState<string | null>(null);

  const bugun = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const ozet = {
    bekleyen: isler.filter((i) => i.asama === "BEKLIYOR").length,
    devamEden: isler.filter((i) => i.asama === "DEVAM_EDIYOR").length,
    tamamlanan: isler.filter((i) => i.asama === "TAMAMLANDI").length,
    teslimHazir: isler.filter((i) => i.asama === "TESLIM_EDILDI").length,
  };

  const seciliIs = isler.find((i) => i.id === seciliId) || null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <p className="text-sm text-zinc-500 capitalize">{bugun}</p>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Merhaba, {kullaniciAdi} 👋
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <OzetKart baslik="Bekleyen" sayi={ozet.bekleyen} icon={ClipboardList} renk="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" />
        <OzetKart baslik="Devam Eden" sayi={ozet.devamEden} icon={Clock} renk="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <OzetKart baslik="Tamamlanan" sayi={ozet.tamamlanan} icon={CheckCircle} renk="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <OzetKart baslik="Teslime Hazır" sayi={ozet.teslimHazir} icon={PackageCheck} renk="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
      </div>

      <div>
        <h2 className="text-sm font-medium text-zinc-500 mb-3">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-2.5">
          <YeniIsDialog trigger={<Button variant="default" size="sm"><Plus className="h-4 w-4" />Yeni İş Aç</Button>} />
          <YeniMusteriDialog trigger={<Button variant="outline" size="sm"><UserPlus className="h-4 w-4" />Müşteri Ekle</Button>} />
          <YeniAracDialog trigger={<Button variant="outline" size="sm"><Car className="h-4 w-4" />Araç Ekle</Button>} />
          <YeniRandevuDialog trigger={<Button variant="outline" size="sm"><CalendarClock className="h-4 w-4" />Randevu Oluştur</Button>} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bugünkü İşler ({isler.length})</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/isler">Tümünü gör</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isler.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-10 w-10 text-zinc-300 mb-3" />
              <p className="text-sm font-medium text-zinc-600">Bugün henüz iş kaydı yok</p>
              <p className="text-xs text-zinc-400 mt-1">
                İlk iş kaydını oluşturmak için &quot;Yeni İş Aç&quot; butonunu kullanın.
              </p>
              <div className="mt-4">
                <YeniIsDialog trigger={<Button size="sm"><Plus className="h-4 w-4" />Yeni İş Oluştur</Button>} />
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isler.map((is) => {
                const badge = asamaBadge[is.asama];
                return (
                  <li key={is.id}>
                    <button
                      type="button"
                      onClick={() => setSeciliId(is.id)}
                      className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {is.baslik}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {is.musteriAd}
                          {is.telefon && (
                            <a
                              href={`tel:${is.telefon}`}
                              onClick={(e) => e.stopPropagation()}
                              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {is.telefon}
                            </a>
                          )}
                          {is.plaka && (
                            <span className="ml-2 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-medium">
                              {is.plaka}
                            </span>
                          )}
                          {is.markaModel && (
                            <span className="ml-2 text-zinc-400">
                              ({is.markaModel})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-zinc-400">{is.saat}</span>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

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

function OzetKart({
  baslik,
  sayi,
  icon: Icon,
  renk,
}: {
  baslik: string;
  sayi: number;
  icon: React.ElementType;
  renk: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`inline-flex p-2 rounded-lg ${renk} mb-3`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{sayi}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{baslik}</p>
      </CardContent>
    </Card>
  );
}