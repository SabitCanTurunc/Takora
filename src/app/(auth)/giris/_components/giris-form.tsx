"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { girisYap } from "../actions";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

export default function GirisForm() {
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
    fd.set("email", data.email);
    fd.set("password", data.password);

    startTransition(async () => {
      const sonuc = await girisYap(fd);
      if (sonuc?.hata) {
        setSunucuHata(sonuc.hata);
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Giriş yap</CardTitle>
        <CardDescription>Hesabınıza giriş yapın</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {sunucuHata && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {sunucuHata}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full">
            Giriş yap
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Hesabınız yok mu?{" "}
            <Link
              href="/kayit"
              className="font-medium text-zinc-900 hover:underline dark:text-white"
            >
              Kayıt ol
            </Link>
          </p>

          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-500">
            <strong>Demo hesabı:</strong> demo@takora.app / demo123
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
