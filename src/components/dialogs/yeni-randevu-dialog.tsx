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
import { randevuEkle } from "@/app/(app)/randevular/actions";
import { CalendarClock } from "lucide-react";

interface Props {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function YeniRandevuDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const [baslik, setBaslik] = useState("");
  const [musteri, setMusteri] = useState("");
  const [telefon, setTelefon] = useState("");
  const [tarih, setTarih] = useState(new Date().toISOString().split("T")[0]);
  const [saat, setSaat] = useState("10:00");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !musteri.trim() || !telefon.trim()) return;

    const fd = new FormData();
    fd.set("baslik", baslik.trim());
    fd.set("musteri", musteri.trim());
    fd.set("telefon", telefon.trim());
    fd.set("tarih", tarih);
    fd.set("saat", saat);

    startTransition(async () => {
      const sonuc = await randevuEkle(fd);
      if (sonuc?.hata) {
        setHata(sonuc.hata);
        return;
      }
      setBaslik("");
      setMusteri("");
      setTelefon("");
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
            <CalendarClock className="h-4 w-4" />
            Randevu Oluştur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Randevu Planla</DialogTitle>
          <DialogDescription>Müşteri için gün ve saat belirleyerek randevu takvimine ekleyin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-2">
          <Input
            label="Randevu Konusu *"
            placeholder="Örn: Yağ Değişimi, Kış Lastiği Montajı"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Müşteri Adı Soyadı *"
              placeholder="Canan Kaya"
              value={musteri}
              onChange={(e) => setMusteri(e.target.value)}
              required
            />
            <Input
              label="Telefon Numarası *"
              placeholder="0532 999 88 77"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Randevu Tarihi *"
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              required
            />
            <Input
              label="Saat *"
              type="time"
              value={saat}
              onChange={(e) => setSaat(e.target.value)}
              required
            />
          </div>

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
              Randevuyu Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}