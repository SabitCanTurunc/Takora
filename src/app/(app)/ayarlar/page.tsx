import { db } from "@/prisma/db";
import { aktifUyelik } from "@/lib/tenant";
import { isletmeGuncelle, uyeEkle, uyeRolGuncelle, uyeCikar } from "./actions";
import { Settings, Users, Building2 } from "lucide-react";
import { SEKTORLER, sektorBul } from "@/lib/sektorler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default async function AyarlarPage() {
  let isletmeId: string | null = null;
  let rol = "CALISAN";
  try {
    const ctx = await aktifUyelik();
    isletmeId = ctx.isletmeId;
    rol = ctx.uyelik.rol;
  } catch {
    isletmeId = null;
  }

  if (!isletmeId) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold mb-4">Ayarlar</h1>
        <p className="text-sm text-zinc-500">Aktif işletme bulunamadı.</p>
      </div>
    );
  }

  const isletme = await db.orm.public.Isletme.where({ id: isletmeId }).first();
  const uyeler = await db.orm.public.IsletmeUye.where({ isletmeId }).all();
  const users = await db.orm.public.User.all();
  const userMap = new Map(users.map((u) => [u.id, u]));

  const yonetici = rol === "SAHIP" || rol === "YONETICI";

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Ayarlar</h1>
        <p className="text-sm text-zinc-500 mt-0.5">İşletme ve üye yönetimi</p>
      </div>

      {/* İşletme Profili */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-zinc-500" />
          <h2 className="font-semibold text-zinc-900 dark:text-white">İşletme Profili</h2>
        </div>

        {yonetici ? (
          <form action={isletmeGuncelle as unknown as (formData: FormData) => void} className="flex flex-col gap-3">
            <Input
              label="İşletme Adı"
              name="ad"
              defaultValue={isletme?.ad || ""}
              required
            />
            <Input
              label="Telefon"
              name="telefon"
              defaultValue={isletme?.telefon || ""}
            />
            <Input
              label="Adres"
              name="adres"
              defaultValue={isletme?.adres || ""}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Sektör
              </label>
              <select
                name="sektor"
                defaultValue={isletme?.sektor || "oto-servis"}
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                {SEKTORLER.map((s) => (
                  <option key={s.kod} value={s.kod}>
                    {s.ad}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Kaydet
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
            <p>
              <strong>Ad:</strong> {isletme?.ad}
            </p>
            <p>
              <strong>Telefon:</strong> {isletme?.telefon || "-"}
            </p>
            <p>
              <strong>Adres:</strong> {isletme?.adres || "-"}
            </p>
            <p>
              <strong>Sektör:</strong> {isletme?.sektor}
            </p>
          </div>
        )}
      </Card>

      {/* Plan ve Modüller */}
      <Card className="p-5">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-2">Plan ve Modüller</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Plan: <strong>{isletme?.plan || "FREE"}</strong>
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Sektör: <strong>{sektorBul(isletme?.sektor || "oto-servis").ad}</strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sektorBul(isletme?.sektor || "oto-servis").moduller.map((m) => (
            <span
              key={m}
              className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {m}
            </span>
          ))}
        </div>
        {isletme?.plan !== "PREMIUM" && (
          <p className="text-xs text-zinc-400 mt-3">
            Premium ile OCR sınırsız, otomatik WhatsApp ve gelişmiş modüller açılır.
          </p>
        )}
      </Card>

      {/* Üyeler */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-zinc-500" />
          <h2 className="font-semibold text-zinc-900 dark:text-white">Üyeler</h2>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {uyeler.map((u) => {
            const user = userMap.get(u.userId);
            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {user?.name || user?.email || u.userId}
                  </span>
                  <span className="text-xs text-zinc-500">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  {rol === "SAHIP" ? (
                    <form action={uyeRolGuncelle as unknown as (formData: FormData) => void} className="flex items-center gap-2">
                      <input type="hidden" name="uyeId" value={u.id} />
                      <select
                        name="rol"
                        defaultValue={u.rol}
                        className="text-xs border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900"
                      >
                        <option value="SAHIP">Sahip</option>
                        <option value="YONETICI">Yönetici</option>
                        <option value="CALISAN">Çalışan</option>
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Güncelle
                      </Button>
                    </form>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                      {u.rol}
                    </span>
                  )}
                  {rol === "SAHIP" && (
                    <form action={uyeCikar as unknown as (formData: FormData) => void}>
                      <input type="hidden" name="uyeId" value={u.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Çıkar
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {yonetici && (
          <form action={uyeEkle as unknown as (formData: FormData) => void} className="flex flex-col gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Yeni Üye Ekle
            </h3>
            <Input
              label="Kullanıcı E-postası"
              name="email"
              type="email"
              placeholder="ornek@isletme.com"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Rol
              </label>
              <select
                name="rol"
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                defaultValue="CALISAN"
              >
                <option value="CALISAN">Çalışan</option>
                <option value="YONETICI">Yönetici</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Üye Ekle
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-2">WhatsApp</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Provider:{" "}
          <strong>
            {process.env.WHATSAPP_PROVIDER || "yapılandırılmamış"}
          </strong>
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Env: WHATSAPP_PROVIDER=webhook, WHATSAPP_WEBHOOK_URL=...
        </p>
      </Card>

      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Settings className="h-3.5 w-3.5" />
        Rolünüz: {rol}
      </div>
    </div>
  );
}