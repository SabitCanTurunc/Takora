import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/prisma/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
  providers: [
    Credentials({
      name: "E-posta ve Şifre",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const user = await db.orm.public.User.where({
          email: parsed.data.email,
        }).first();

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        const uyelik = await db.orm.public.IsletmeUye.where({
          userId: user.id,
        }).first();

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isletmeId: uyelik?.isletmeId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.isletmeId = user.isletmeId;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.name) {
        session.user.name = token.name as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      if (token.isletmeId) {
        session.user.isletmeId = token.isletmeId as string;
      }
      return session;
    },
  },
});