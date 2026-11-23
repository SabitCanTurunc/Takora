# Takora — Uygulama Planı

Bu doküman Takora'nın geliştirme fazlarını ve teknik kararlarını özetler.
Ana ürün promptu: `Takora_AI_Gelistirme_Ana_Promptu.pdf`

## Mevcut Durum

- Faz 0: Tamamlandı (keşif raporu)
- Faz 1: Büyük ölçüde tamamlandı (layout, navigasyon, tasarım, oturum, DB bağlantısı)
- Faz 2: Temel sürüm tamamlandı (ayarlar, üye/rol yönetimi, tenant context)
- Faz 3: Tamamlandı (müşteri ve araç CRUD, DB bağlantılı)
- Faz 4: Temel sürüm tamamlandı (iş oluşturma, detay, aşama/not güncelleme, DB bağlantılı)
- Faz 5: Tamamlandı (dashboard gerçek verilerle)

## Teknoloji Kararları

- Frontend: Next.js 16 App Router, React 19, TypeScript strict
- DB: Supabase PostgreSQL + Prisma ORM 8
- Auth: NextAuth v5 (JWT, Credentials + DB)
- Storage: Fotoğraflar için Cloudflare R2 (S3 uyumlu) tercih edilir
- OCR free tier: Gemini (mevcut kullanılabilir model, örn. gemini-3.5-flash)
- OCR premium: OpenAI GPT-4o mini
  - Pilot aşamada Supabase Storage da kullanılabilir
  - R2 için gerekli env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Faz Planı

1. Faz 0 — Keşif ✅
2. Faz 1 — Temel iskelet ✅
3. Faz 2 — Çok kiracılı temel (ayarlar, roller, izinler) ✅ temel
4. Faz 3 — Müşteri ve araç ✅
5. Faz 4 — İş yönetimi ✅ temel (foto ekleme eklenecek)
6. Faz 5 — Ana ekran ✅
7. Faz 6 — Müşteri takip deneyimi
8. Faz 7 — WhatsApp altyapısı
9. Faz 8 — Premium AI/OCR (ruhsat fotoğrafından veri çıkarma)
10. Faz 9 — Sektör şablonları ve paketler
11. Faz 10 — Sağlamlaştırma (testler, güvenlik, PWA)

## Fotoğraf Yükleme Planı (Faz 4 eklentisi)

- `IsFoto` modeli contract'a eklenecek
- Yükleme R2 (veya pilot için Supabase Storage) üzerinden yapılacak
- Server action ile güvenli yükleme
- İş detay ekranında fotoğraf galerisi ve silme

## Sonraki Adımlar

- Faz 6: müşteri takip bağlantısı (güvenli token)
- Fotoğraf yükleme (R2 credentials ile)
- Rol/izin kontrollerinin tüm mutasyonlara uygulanması
- Test altyapısı (Vitest/Playwright)