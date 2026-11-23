"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { kayitOl } from "../actions";

const schema = z
  .object({
    adSoyad: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
    isletmeAdi: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

type FormData = z.infer<typeof schema>;

export default function KayitForm() {
  const [sunucuHata, setSunucuHata] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSunucuHata(null);
    const fd = new FormData();
    fd.set("adSoyad", data.adSoyad);
    fd.set("isletmeAdi", data.isletmeAdi);
    fd.set("email", data.email);
    fd.set("password", data.password);

    startTransition(async () => {
      const sonuc = await kayitOl(fd);
      if (sonuc?.hata) {
        setSunucuHata(sonuc.hata);
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>İşletmenizi Kaydedin</CardTitle>
        <CardDescription>Takora ile işlerinizi takip etmeye başlayın</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input
            label="Adınız Soyadınız"
            placeholder="Ahmet Yılmaz"
            autoComplete="name"
            error={errors.adSoyad?.message}
            {...register("adSoyad")}
          />
          <Input
            label="İşletme / Servis Adı"
            placeholder="Yılmaz Oto Servis"
            error={errors.isletmeAdi?.message}
            {...register("isletmeAdi")}
          />
          <Input
            label="E-posta"
            type="email"
            placeholder="ornek@isletme.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Şifre"
            type="password"
            placeholder="En az 6 karakter"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Şifre Tekrar"
            type="password"
            placeholder="Şifrenizi tekrar girin"
            autoComplete="new-password"
            error={errors.passwordConfirm?.message}
            {...register("passwordConfirm")}
          />

          {sunucuHata && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {sunucuHata}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full mt-2">
            Hesap Oluştur
          </Button>

          <p className="text-center text-sm text-zinc-500 pt-1">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/giris"
              className="font-medium text-zinc-900 hover:underline dark:text-white"
            >
              Giriş yap
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
