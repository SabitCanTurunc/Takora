"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isEkle, musteriAra, aracAra, plakaOcr } from "@/app/(app)/isler/actions";
import { Plus } from "lucide-react";

interface Props {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type AracSecenek = { id: string; plaka: string | null; marka: string | null };

export function YeniIsDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearch] = useTransition();
  const [ocrPending, startOcrTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const [baslik, setBaslik] = useState("");
  const [musteri, setMusteri] = useState("");
  const [telefon, setTelefon] = useState("");
  const [plaka, setPlaka] = useState("");
  const [markaModel, setMarkaModel] = useState("");
  const [km, setKm] = useState("");
  const [asama, setAsama] = useState("BEKLIYOR");
  const [aciklama, setAciklama] = useState("");

  const [araclar, setAraclar] = useState<AracSecenek[]>([]);
  const [seciliAracId, setSeciliAracId] = useState<string>("");

  function temizle() {
    setBaslik("");
    setMusteri("");
    setTelefon("");
    setPlaka("");
    setMarkaModel("");
    setKm("");
    setAciklama("");
    setAsama("BEKLIYOR");
    setAraclar([]);
    setSeciliAracId("");
    setHata(null);
  }

  function handleTelefonBlur() {
    if (!telefon.trim()) return;
    startSearch(async () => {
      const sonuc = await musteriAra(telefon.trim());
      if (sonuc.musteri) {
        setMusteri(sonuc.musteri.ad);
        setAraclar(sonuc.araclar);
        if (sonuc.araclar.length === 1) {
          setSeciliAracId(sonuc.araclar[0].id);
          setPlaka(sonuc.araclar[0].plaka || "");
          setMarkaModel(sonuc.araclar[0].marka || "");
        } else {
          setSeciliAracId("");
        }
      } else {
        setAraclar([]);
        setSeciliAracId("");
      }
    });
  }

  function handlePlakaBlur() {
    if (!plaka.trim()) return;
    startSearch(async () => {
      const sonuc = await aracAra(plaka.trim());
      if (sonuc.arac) {
        setPlaka(sonuc.arac.plaka || "");
        setMarkaModel(sonuc.arac.marka || "");
        if (sonuc.musteri) {
          setMusteri(sonuc.musteri.ad);
          if (sonuc.musteri.telefon) setTelefon(sonuc.musteri.telefon || "");
        }
      }
    });
  }

  function handleAracSecimi(id: string) {
    setSeciliAracId(id);
    const arac = araclar.find((a) => a.id === id);
    if (arac) {
      setPlaka(arac.plaka || "");
      setMarkaModel(arac.marka || "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !musteri.trim() || !plaka.trim()) return;

    const fd = new FormData();
    fd.set("baslik", baslik.trim());
    fd.set("musteri", musteri.trim());
    fd.set("telefon", telefon.trim());
    // Seçili araç varsa onun plakası/markası kullanılır
    const seciliArac = araclar.find((a) => a.id === seciliAracId);
    fd.set("plaka", (seciliArac?.plaka || plaka).trim());
    fd.set("markaModel", (seciliArac?.marka || markaModel).trim());
    fd.set("km", km.trim());
    fd.set("asama", asama);
    fd.set("aciklama", aciklama.trim());

    startTransition(async () => {
      const sonuc = await isEkle(fd);
      if (sonuc?.hata) {
        setHata(sonuc.hata);
        return;
      }
      temizle();
      setOpen(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Yeni İş
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni İş Kaydı Oluştur</DialogTitle>
          <DialogDescription>
            Servise gelen araç için yeni iş emri. Telefon veya plaka girerek mevcut müşteri/araç otomatik doldurulur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-2">
          <Input
            label="Yapılacak İş / Şikayet *"
            placeholder="Örn: 10.000 Bakımı, Yağ & Filtre Değişimi"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Müşteri Telefonu"
              placeholder="0532 123 45 67"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              onBlur={handleTelefonBlur}
            />
            <Input
              label="Müşteri Adı Soyadı *"
              placeholder="Ahmet Yılmaz"
              value={musteri}
              onChange={(e) => setMusteri(e.target.value)}
              required
            />
          </div>

          {isSearching && (
            <p className="text-xs text-zinc-400">Müşteri/araç bilgileri aranıyor...</p>
          )}

          {araclar.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mevcut Araçlardan Seç
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                value={seciliAracId}
                onChange={(e) => handleAracSecimi(e.target.value)}
              >
                <option value="">Yeni araç gir</option>
                {araclar.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.plaka || "Plaka yok"} {a.marka ? `— ${a.marka}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(araclar.length === 0 || seciliAracId === "") && (
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Araç Plakası *"
                    placeholder="34 ABC 123"
                    value={plaka}
                    onChange={(e) => setPlaka(e.target.value)}
                    onBlur={handlePlakaBlur}
                    required
                  />
                </div>
                <label className="flex items-center justify-center h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.set("foto", file);
                      startOcrTransition(async () => {
                        const sonuc = await plakaOcr(fd);
                        if (sonuc?.hata) {
                          setHata(sonuc.hata);
                          return;
                        }
                        if (sonuc?.plaka) setPlaka(sonuc.plaka);
                      });
                    }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </label>
              </div>
              {ocrPending && (
                <p className="text-xs text-zinc-400">Plaka okunuyor...</p>
              )}
              <Input
                label="Marka & Model"
                placeholder="Renault Megane"
                value={markaModel}
                onChange={(e) => setMarkaModel(e.target.value)}
              />
            </div>
          )}

          {araclar.length === 1 && seciliAracId && (
            <p className="text-xs text-zinc-400">
              Mevcut araç otomatik seçildi: {plaka} {markaModel ? `(${markaModel})` : ""}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Başlangıç Aşaması
            </label>
            <select
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              value={asama}
              onChange={(e) => setAsama(e.target.value)}
            >
              <option value="BEKLIYOR">Sırada / Bekliyor</option>
              <option value="DEVAM_EDIYOR">İşlem Başladı (Devam Ediyor)</option>
              <option value="TAMAMLANDI">İşlem Bitti (Hazır)</option>
            </select>
          </div>

          <Input
            label="Araç Kilometresi"
            type="number"
            placeholder="Örn: 78500"
            value={km}
            onChange={(e) => setKm(e.target.value)}
          />

          <Textarea
            label="Usta Notları / Detaylar"
            placeholder="Kullanılacak parçalar, özel istekler..."
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
          />

          {hata && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {hata}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button type="submit" loading={isPending}>
              İş Kaydını Aç
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}