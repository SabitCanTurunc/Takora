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
import { isEkle } from "@/app/(app)/isler/actions";
import { Plus } from "lucide-react";

interface Props {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function YeniIsDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const [baslik, setBaslik] = useState("");
  const [musteri, setMusteri] = useState("");
  const [telefon, setTelefon] = useState("");
  const [plaka, setPlaka] = useState("");
  const [markaModel, setMarkaModel] = useState("");
  const [tahminiTutar, setTahminiTutar] = useState("");
  const [asama, setAsama] = useState("BEKLIYOR");
  const [aciklama, setAciklama] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !musteri.trim()) return;

    const fd = new FormData();
    fd.set("baslik", baslik.trim());
    fd.set("musteri", musteri.trim());
    fd.set("telefon", telefon.trim());
    fd.set("plaka", plaka.trim());
    fd.set("markaModel", markaModel.trim());
    fd.set("tahminiTutar", tahminiTutar.trim());
    fd.set("asama", asama);
    fd.set("aciklama", aciklama.trim());

    startTransition(async () => {
      const sonuc = await isEkle(fd);
      if (sonuc?.hata) {
        setHata(sonuc.hata);
        return;
      }
      setBaslik("");
      setMusteri("");
      setTelefon("");
      setPlaka("");
      setMarkaModel("");
      setTahminiTutar("");
      setAciklama("");
      setAsama("BEKLIYOR");
      setHata(null);
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
          <DialogDescription>Servise gelen araç için yeni iş emri ve müşteri detaylarını kaydedin.</DialogDescription>
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
              label="Müşteri Adı Soyadı *"
              placeholder="Ahmet Yılmaz"
              value={musteri}
              onChange={(e) => setMusteri(e.target.value)}
              required
            />
            <Input
              label="Müşteri Telefonu"
              placeholder="0532 123 45 67"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Araç Plakası"
              placeholder="34 ABC 123"
              value={plaka}
              onChange={(e) => setPlaka(e.target.value)}
            />
            <Input
              label="Marka & Model"
              placeholder="Renault Megane"
              value={markaModel}
              onChange={(e) => setMarkaModel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tahmini Tutar (₺)"
              type="number"
              placeholder="Örn: 2500"
              value={tahminiTutar}
              onChange={(e) => setTahminiTutar(e.target.value)}
            />
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
          </div>

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