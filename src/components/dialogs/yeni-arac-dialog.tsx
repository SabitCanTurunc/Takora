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
import { aracEkle, ruhsatOcr } from "@/app/(app)/araclar/actions";
import { Plus } from "lucide-react";

interface Props {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function YeniAracDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const [ocrPending, startOcrTransition] = useTransition();
  const [ocrHata, setOcrHata] = useState<string | null>(null);

  const [plaka, setPlaka] = useState("");
  const [markaModel, setMarkaModel] = useState("");
  const [yil, setYil] = useState("");
  const [km, setKm] = useState("");
  const [musteri, setMusteri] = useState("");
  const [telefon, setTelefon] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plaka.trim() || !musteri.trim()) return;

    const fd = new FormData();
    fd.set("plaka", plaka.trim());
    fd.set("markaModel", markaModel.trim());
    fd.set("yil", yil.trim());
    fd.set("km", km.trim());
    fd.set("musteri", musteri.trim());
    fd.set("telefon", telefon.trim());

    startTransition(async () => {
      const sonuc = await aracEkle(fd);
      if (sonuc?.hata) {
        setHata(sonuc.hata);
        return;
      }
      setPlaka("");
      setMarkaModel("");
      setYil("");
      setKm("");
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
            <Plus className="h-4 w-4" />
            Araç Ekle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Araç Kaydı</DialogTitle>
          <DialogDescription>Müşteri aracını plaka ve temel bilgilerle kaydedin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-2">
          <Input
            label="Araç Plakası *"
            placeholder="34 ABC 123"
            value={plaka}
            onChange={(e) => setPlaka(e.target.value)}
            required
          />

          <Input
            label="Marka & Model"
            placeholder="Renault Megane"
            value={markaModel}
            onChange={(e) => setMarkaModel(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Model Yılı"
              type="number"
              placeholder="2020"
              value={yil}
              onChange={(e) => setYil(e.target.value)}
            />
            <Input
              label="Güncel Km"
              type="number"
              placeholder="78500"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </div>

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

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Ruhsat Fotoğrafından Doldur (Premium)
            </p>
            <input
              type="file"
              accept="image/*"
              id="ruhsat-foto"
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={ocrPending}
              onClick={() => {
                const input = document.getElementById("ruhsat-foto") as HTMLInputElement | null;
                const file = input?.files?.[0];
                if (!file) {
                  setOcrHata("Dosya seçilmedi.");
                  return;
                }
                const fd = new FormData();
                fd.set("foto", file);
                startOcrTransition(async () => {
                  setOcrHata(null);
                  const sonuc = await ruhsatOcr(fd);
                  if (sonuc?.hata) {
                    setOcrHata(sonuc.hata);
                    return;
                  }
                  const v = sonuc?.veri || {};
                  if (v.plaka) setPlaka(v.plaka);
                  if (v.marka || v.model) {
                    setMarkaModel([v.marka, v.model].filter(Boolean).join(" "));
                  }
                  if (v.yil) setYil(String(v.yil));
                });
              }}
            >
              {ocrPending ? "Okunuyor..." : "Ruhsatı Oku"}
            </Button>
            {ocrHata && (
              <p className="text-xs text-red-600 mt-1">{ocrHata}</p>
            )}
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
              Aracı Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}