import { auth } from "@/lib/auth";
import { db } from "@/prisma/db";
import { rolSeviyesi } from "./roller";

export async function aktifIsletmeId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Oturum bulunamadı.");
  }

  if (session.user.isletmeId) {
    return session.user.isletmeId;
  }

  const uyelik = await db.orm.public.IsletmeUye.where({
    userId: session.user.id,
  }).first();

  if (!uyelik) {
    throw new Error("Aktif işletme bulunamadı.");
  }

  return uyelik.isletmeId;
}

export async function aktifUyelik() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Oturum bulunamadı.");
  }

  const isletmeId = await aktifIsletmeId();
  const uyelik = await db.orm.public.IsletmeUye.where({
    isletmeId,
    userId: session.user.id,
  }).first();

  if (!uyelik) {
    throw new Error("Üyelik bulunamadı.");
  }

  return { session, isletmeId, uyelik };
}

export { rolSeviyesi };

export async function yetkiKontrol(minRol: "CALISAN" | "YONETICI" | "SAHIP") {
  const { uyelik } = await aktifUyelik();
  if (rolSeviyesi(uyelik.rol) < rolSeviyesi(minRol)) {
    throw new Error("Bu işlem için yetkiniz yok.");
  }
  return uyelik;
}