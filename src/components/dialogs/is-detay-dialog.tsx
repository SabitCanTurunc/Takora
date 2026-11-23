"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isAsamaGuncelle, isNotEkle, fotoEkle, takipLinkiOlustur, takipLinkiIptal, whatsappMesajGonder } from "@/app/(app)/isler/actions";
import { formatPara } from "@/lib/utils";
import { Phone, Car, Clock, Send } from "lucide-react";

type AsamaTipi = "BEKLIYOR" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "TESLIM_EDILDI" | "IPTAL";

export interface IsDetay {
  id: string;
  baslik: string;
  asama: AsamaTipi;
  musteriAd?: string;
  musteri?: string;
  telefon?: string | null;
  plaka?: string | null;
  tahminiTutar?: number | null;
  aciklama?: string | null;
  notlar: { id: string; metin: string; tarih: string }[];
  fotolar?: { id: string; key: string }[];
  takipToken?: string | null;
}

interface Props {
  isKaydi: IsDetay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const asamaBadge: Record<
  AsamaTipi,
  { label: string; variant: "default" | "warning" | "info" | "success" | "outline" }
> = {
  BEKLIYOR: { label: "Sırada / Bekliyor", variant: "default" },
  DEVAM_EDIYOR: { label: "Devam Ediyor", variant: "info" },
  TAMAMLANDI: { label: "Tamamlandı (Teslime Hazır)", variant: "success" },
  TESLIM_EDILDI: { label: "Müşteriye Teslim Edildi", variant: "outline" },
  IPTAL: { label: "İptal Edildi", variant: "warning" },
};

export function IsDetayDialog({ isKaydi, open, onOpenChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [yeniNot, setYeniNot] = useState("");
  const [fotoHata, setFotoHata] = useState<string | null>(null);
  const [fotoPending, startFotoTransition] = useTransition();
  const [takipUrl, setTakipUrl] = useState<string | null>(() =>
    isKaydi?.takipToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/takip/${isKaydi.takipToken}`
      : null
  );
  const [takipPending, startTakipTransition] = useTransition();
  const [whatsappPending, startWhatsappTransition] = useTransition();
  const [whatsappSonuc, setWhatsappSonuc] = useState<string | null>(null);

  if (!isKaydi) return null;

  const musteriAd = isKaydi.musteriAd || isKaydi.musteri || "Müşteri";
  const badge = asamaBadge[isKaydi.asama];

  function handleAsama(asama: AsamaTipi) {
    startTransition(async () => {
      await isAsamaGuncelle(isKaydi!.id, asama);
      router.refresh();
    });
  }

  function handleNotEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!yeniNot.trim()) return;
    startTransition(async () => {
      await isNotEkle(isKaydi!.id, yeniNot.trim());
      setYeniNot("");
      router.refresh();
    });
  }

  function handleFotoEkle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("isId", isKaydi!.id);
    startFotoTransition(async () => {
      const sonuc = await fotoEkle(isKaydi!.id, fd);
      if (sonuc?.hata) {
        setFotoHata(sonuc.hata);
        return;
      }
      setFotoHata(null);
      form.reset();
      router.refresh();
    });
  }

  function handleTakipOlustur() {
    startTakipTransition(async () => {
      const sonuc = await takipLinkiOlustur(isKaydi!.id);
      if (sonuc?.url) {
        const full = `${window.location.origin}${sonuc.url}`;
        setTakipUrl(full);
      }
    });
  }

  function handleTakipIptal() {
    startTakipTransition(async () => {
      await takipLinkiIptal(isKaydi!.id);
      setTakipUrl(null);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-xl">{isKaydi.baslik}</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 mt-1">
                İş Kayıt No: #{isKaydi.id.slice(-6)}
              </DialogDescription>
            </div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Aşama Güncelle
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["BEKLIYOR", "DEVAM_EDIYOR", "TAMAMLANDI", "TESLIM_EDILDI"] as AsamaTipi[]).map(
              (a) => (
                <Button
                  key={a}
                  size="sm"
                  variant={isKaydi.asama === a ? "default" : "outline"}
                  disabled={isPending}
                  onClick={() => handleAsama(a)}
                >
                  {a === "BEKLIYOR"
                    ? "Bekliyor"
                    : a === "DEVAM_EDIYOR"
                    ? "İşlemde"
                    : a === "TAMAMLANDI"
                    ? "Hazır"
                    : "Teslim Et"}
                </Button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-500 block mb-1">Müşteri Bilgisi</span>
            <p className="font-semibold text-zinc-900 dark:text-white">{musteriAd}</p>
            {isKaydi.telefon && (
              <a
                href={`tel:${isKaydi.telefon}`}
                className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 hover:underline"
              >
                <Phone className="h-3 w-3" />
                {isKaydi.telefon}
              </a>
            )}
          </div>

          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span className="text-xs text-zinc-500 block mb-1">Araç & Tutar</span>
            <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
              <Car className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isKaydi.plaka || "Plaka Belirtilmedi"}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Tahmini:{" "}
              {isKaydi.tahminiTutar
                ? formatPara(isKaydi.tahminiTutar)
                : "Belirtilmedi"}
            </p>
          </div>
        </div>

        {isKaydi.aciklama && (
          <div className="text-sm p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
            <span className="text-xs font-semibold text-zinc-500 block mb-1">Açıklama / Detay</span>
            <p className="text-zinc-700 dark:text-zinc-300">{isKaydi.aciklama}</p>
          </div>
        )}

        {/* Takip Linki */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Müşteri Takip Linki
          </span>
          {takipUrl ? (
            <div className="flex flex-col gap-2">
              <input
                readOnly
                value={takipUrl}
                className="text-xs border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard?.writeText(takipUrl)}
                >
                  Kopyala
                </Button>
                {isKaydi.telefon && (
                  <a
                    href={`https://wa.me/${(() => {
                      const temiz = isKaydi.telefon.replace(/\D/g, "");
                      if (temiz.startsWith("90")) return temiz;
                      if (temiz.startsWith("0")) return `90${temiz.slice(1)}`;
                      return `90${temiz}`;
                    })()}?text=${encodeURIComponent(
                      `Merhaba, ${isKaydi.baslik} işinizin durumunu buradan takip edebilirsiniz: ${takipUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" type="button">
                      WhatsApp&apos;ta Paylaş
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={takipPending}
                  onClick={handleTakipIptal}
                >
                  İptal Et
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={takipPending}
              onClick={handleTakipOlustur}
            >
              Takip Linki Oluştur
            </Button>
          )}
        </div>

        {/* WhatsApp */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            WhatsApp Mesajı
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={whatsappPending}
              onClick={() => {
                startWhatsappTransition(async () => {
                  const sonuc = await whatsappMesajGonder(isKaydi!.id, "DURUM_GUNCELLEME");
                  setWhatsappSonuc(sonuc?.hata || "Mesaj kuyruğa alındı.");
                });
              }}
            >
              Durum Gönder
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={whatsappPending}
              onClick={() => {
                startWhatsappTransition(async () => {
                  const sonuc = await whatsappMesajGonder(isKaydi!.id, "TESLIME_HAZIR");
                  setWhatsappSonuc(sonuc?.hata || "Mesaj kuyruğa alındı.");
                });
              }}
            >
              Teslime Hazır
            </Button>
          </div>
          {whatsappSonuc && (
            <p className="text-xs text-zinc-500">{whatsappSonuc}</p>
          )}
          <p className="text-[10px] text-zinc-400">
            Provider yapılandırılmamışsa mesaj kuyrukta kalır (gönderilmez).
          </p>
        </div>

        {/* Fotoğraflar */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Fotoğraflar ({isKaydi.fotolar?.length || 0})
          </span>

          {isKaydi.fotolar && isKaydi.fotolar.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {isKaydi.fotolar.map((f) => (
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
          )}

          <form onSubmit={handleFotoEkle} className="flex items-center gap-2 mt-2">
            <input
              type="file"
              name="foto"
              accept="image/*"
              className="text-xs"
            />
            <Button size="sm" type="submit" disabled={fotoPending}>
              Fotoğraf Yükle
            </Button>
          </form>
          {fotoHata && (
            <p className="text-xs text-red-600">{fotoHata}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Süreç Notları ({isKaydi.notlar.length})
          </span>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {isKaydi.notlar.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">Henüz not eklenmemiş.</p>
            ) : (
              isKaydi.notlar.map((not) => (
                <div
                  key={not.id}
                  className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs"
                >
                  <p className="text-zinc-800 dark:text-zinc-200">{not.metin}</p>
                  <span className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                    <Clock className="h-2.5 w-2.5" />
                    {not.tarih}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleNotEkle} className="flex gap-2 mt-2">
            <Input
              placeholder="İşe yeni bir not ekle..."
              value={yeniNot}
              onChange={(e) => setYeniNot(e.target.value)}
              className="text-xs h-9"
            />
            <Button size="sm" type="submit" disabled={isPending}>
              <Send className="h-3.5 w-3.5" />
              Ekle
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}