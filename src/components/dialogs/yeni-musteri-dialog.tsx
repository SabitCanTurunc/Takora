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
import { musteriEkle } from "@/app/(app)/musteriler/actions";
import { UserPlus } from "lucide-react";

interface Props {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function YeniMusteriDialog({ trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [notlar, setNotlar] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adSoyad.trim() || !telefon.trim()) return;

    const fd = new FormData();
    fd.set("adSoyad", adSoyad.trim());
    fd.set("telefon", telefon.trim());
    fd.set("email", email.trim());
    fd.set("notlar", notlar.trim());

    startTransition(async () => {
      const sonuc = await musteriEkle(fd);
      if (sonuc?.hata) {
        setHata(sonuc.hata);
        return;
      }
      setAdSoyad("");
      setTelefon("");
      setEmail("");
      setNotlar("");
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
            <UserPlus className="h-4 w-4" />
            Müşteri Ekle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Müşteri Kaydı</DialogTitle>
          <DialogDescription>İşletmenize yeni müşteri profili ve iletişim bilgilerini ekleyin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-2">
          <Input
            label="Müşteri Adı Soyadı *"
            placeholder="Örn: Hasan Yıldız"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            required
          />
          <Input
            label="Telefon Numarası *"
            placeholder="0532 987 65 43"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            required
          />
          <Input
            label="E-posta"
            type="email"
            placeholder="hasan@ornek.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Textarea
            label="Özel Notlar"
            placeholder="Müşteri tercihleri, özel indirim durumu..."
            value={notlar}
            onChange={(e) => setNotlar(e.target.value)}
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
              Müşteriyi Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}