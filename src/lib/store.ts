import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AsamaTipi = "BEKLIYOR" | "DEVAM_EDIYOR" | "TAMAMLANDI" | "TESLIM_EDILDI" | "IPTAL";

export interface IsKaydi {
  id: string;
  baslik: string;
  musteri: string;
  telefon?: string;
  plaka?: string;
  markaModel?: string;
  asama: AsamaTipi;
  tahminiTutar?: number;
  gercekTutar?: number;
  saat: string;
  tarih: string;
  aciklama?: string;
  notlar: { id: string; metin: string; tarih: string }[];
}

export interface MusteriKaydi {
  id: string;
  adSoyad: string;
  telefon: string;
  email?: string;
  plaka?: string;
  notlar?: string;
}

export interface AracKaydi {
  id: string;
  plaka: string;
  markaModel: string;
  yil?: number;
  musteri: string;
  telefon?: string;
  km?: number;
}

export interface RandevuKaydi {
  id: string;
  baslik: string;
  musteri: string;
  telefon: string;
  tarih: string;
  saat: string;
  durum: "BEKLIYOR" | "ONAYLANDI" | "TAMAMLANDI" | "IPTAL";
}

interface TakoraState {
  isler: IsKaydi[];
  musteriler: MusteriKaydi[];
  araclar: AracKaydi[];
  randevular: RandevuKaydi[];

  // Eylemler
  addIs: (yeniVeri: {
    baslik: string;
    musteri: string;
    telefon?: string;
    plaka?: string;
    markaModel?: string;
    asama?: AsamaTipi;
    tahminiTutar?: number;
    aciklama?: string;
  }) => IsKaydi;
  updateIsAsama: (id: string, yeniAsama: AsamaTipi) => void;
  addIsNot: (isId: string, metin: string) => void;
  addMusteri: (yeniMusteri: Omit<MusteriKaydi, "id">) => MusteriKaydi;
  addArac: (yeniArac: Omit<AracKaydi, "id">) => AracKaydi;
  addRandevu: (yeniRandevu: Omit<RandevuKaydi, "id">) => RandevuKaydi;
}

const varsayilanIsler: IsKaydi[] = [
  {
    id: "1",
    baslik: "Yağ değişimi + filtre",
    musteri: "Ahmet Yılmaz",
    telefon: "0532 111 22 33",
    plaka: "34 ABC 123",
    markaModel: "Renault Megane",
    asama: "DEVAM_EDIYOR",
    tahminiTutar: 2800,
    saat: "09:30",
    tarih: "2026-11-20",
    aciklama: "5W-30 tam sentetik motor yağı ve orijinal filtre seti.",
    notlar: [
      { id: "n1", metin: "Müşteri öğleden sonra teslim alacak.", tarih: "Bugün 09:40" },
    ],
  },
  {
    id: "2",
    baslik: "Fren balataları değişimi",
    musteri: "Fatma Demir",
    telefon: "0544 222 33 44",
    plaka: "06 XY 456",
    markaModel: "Volkswagen Golf",
    asama: "BEKLIYOR",
    tahminiTutar: 4200,
    saat: "11:00",
    tarih: "2026-11-20",
    aciklama: "Ön ve arka fren balataları kontrolü.",
    notlar: [],
  },
  {
    id: "3",
    baslik: "Ön cam değişimi",
    musteri: "Mehmet Kaya",
    telefon: "0555 333 44 55",
    plaka: "35 DEF 789",
    markaModel: "Ford Focus",
    asama: "TAMAMLANDI",
    tahminiTutar: 6500,
    saat: "08:00",
    tarih: "2026-11-20",
    aciklama: "Kasko kapsamında sensörlü orijinal cam montajı.",
    notlar: [
      { id: "n2", metin: "Sensör kalibrasyonu tamamlandı.", tarih: "Bugün 10:15" },
    ],
  },
  {
    id: "4",
    baslik: "Lastik rotasyonu ve balans",
    musteri: "Ayşe Çelik",
    telefon: "0505 444 55 66",
    plaka: "16 GH 012",
    markaModel: "Toyota Corolla",
    asama: "TESLIM_EDILDI",
    tahminiTutar: 1200,
    gercekTutar: 1200,
    saat: "14:00",
    tarih: "2026-11-20",
    aciklama: "4 lastik balans ayarı ve rotasyon yapıldı.",
    notlar: [],
  },
];

const varsayilanMusteriler: MusteriKaydi[] = [
  { id: "m1", adSoyad: "Ahmet Yılmaz", telefon: "0532 111 22 33", email: "ahmet@ornek.com", plaka: "34 ABC 123", notlar: "Sürekli müşteri, periyodik bakım düzenli yapılıyor." },
  { id: "m2", adSoyad: "Fatma Demir", telefon: "0544 222 33 44", email: "fatma@ornek.com", plaka: "06 XY 456", notlar: "Fren diskleri bir sonraki bakımda kontrol edilecek." },
  { id: "m3", adSoyad: "Mehmet Kaya", telefon: "0555 333 44 55", email: "mehmet@ornek.com", plaka: "35 DEF 789" },
  { id: "m4", adSoyad: "Ayşe Çelik", telefon: "0505 444 55 66", plaka: "16 GH 012" },
];

const varsayilanAraclar: AracKaydi[] = [
  { id: "a1", plaka: "34 ABC 123", markaModel: "Renault Megane 1.5 dCi", yil: 2020, musteri: "Ahmet Yılmaz", telefon: "0532 111 22 33", km: 78500 },
  { id: "a2", plaka: "06 XY 456", markaModel: "Volkswagen Golf 1.4 TSI", yil: 2019, musteri: "Fatma Demir", telefon: "0544 222 33 44", km: 92000 },
  { id: "a3", plaka: "35 DEF 789", markaModel: "Ford Focus 1.0 EcoBoost", yil: 2021, musteri: "Mehmet Kaya", telefon: "0555 333 44 55", km: 45000 },
  { id: "a4", plaka: "16 GH 012", markaModel: "Toyota Corolla 1.6", yil: 2018, musteri: "Ayşe Çelik", telefon: "0505 444 55 66", km: 110000 },
];

const varsayilanRandevular: RandevuKaydi[] = [
  { id: "r1", baslik: "10.000 Km Bakımı", musteri: "Ahmet Yılmaz", telefon: "0532 111 22 33", tarih: "2026-11-20", saat: "10:00", durum: "ONAYLANDI" },
  { id: "r2", baslik: "Klima Gazı Dolumu", musteri: "Murat Şen", telefon: "0530 999 88 77", tarih: "2026-11-20", saat: "14:30", durum: "BEKLIYOR" },
];

export const useTakoraStore = create<TakoraState>()(
  persist(
    (set) => ({
      isler: varsayilanIsler,
      musteriler: varsayilanMusteriler,
      araclar: varsayilanAraclar,
      randevular: varsayilanRandevular,

      addIs: (yeniVeri) => {
        const simdi = new Date();
        const saat = simdi.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const tarih = simdi.toISOString().split("T")[0];
        const olusturulanIs: IsKaydi = {
          id: String(Date.now()),
          baslik: yeniVeri.baslik,
          musteri: yeniVeri.musteri,
          telefon: yeniVeri.telefon,
          plaka: yeniVeri.plaka,
          markaModel: yeniVeri.markaModel,
          asama: yeniVeri.asama || "BEKLIYOR",
          tahminiTutar: yeniVeri.tahminiTutar,
          saat,
          tarih,
          aciklama: yeniVeri.aciklama,
          notlar: [],
        };

        set((state) => {
          // 1. Müşteri kontrolü: Müşteriler listesinde yoksa otomatik ekle
          let guncelMusteriler = [...state.musteriler];
          const musteriVarMi = guncelMusteriler.some(
            (m) =>
              m.adSoyad.toLowerCase() === yeniVeri.musteri.toLowerCase() ||
              (yeniVeri.telefon && m.telefon && m.telefon.replace(/\D/g, "") === yeniVeri.telefon.replace(/\D/g, ""))
          );

          if (!musteriVarMi) {
            guncelMusteriler = [
              {
                id: `m_${Date.now()}`,
                adSoyad: yeniVeri.musteri,
                telefon: yeniVeri.telefon || "Belirtilmedi",
                plaka: yeniVeri.plaka,
                notlar: `İş kaydı üzerinden otomatik oluşturuldu: ${yeniVeri.baslik}`,
              },
              ...guncelMusteriler,
            ];
          }

          // 2. Araç kontrolü: Plaka girilmişse ve araç listesinde yoksa otomatik ekle
          let guncelAraclar = [...state.araclar];
          if (yeniVeri.plaka) {
            const temizPlaka = yeniVeri.plaka.replace(/\s+/g, "").toUpperCase();
            const aracVarMi = guncelAraclar.some(
              (a) => a.plaka.replace(/\s+/g, "").toUpperCase() === temizPlaka
            );

            if (!aracVarMi) {
              guncelAraclar = [
                {
                  id: `a_${Date.now()}`,
                  plaka: yeniVeri.plaka.toUpperCase(),
                  markaModel: yeniVeri.markaModel || "Belirtilmedi",
                  musteri: yeniVeri.musteri,
                  telefon: yeniVeri.telefon,
                },
                ...guncelAraclar,
              ];
            }
          }

          return {
            isler: [olusturulanIs, ...state.isler],
            musteriler: guncelMusteriler,
            araclar: guncelAraclar,
          };
        });

        return olusturulanIs;
      },

      updateIsAsama: (id, yeniAsama) => {
        set((state) => ({
          isler: state.isler.map((item) =>
            item.id === id ? { ...item, asama: yeniAsama } : item
          ),
        }));
      },

      addIsNot: (isId, metin) => {
        const simdi = new Date();
        const zaman = simdi.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        set((state) => ({
          isler: state.isler.map((item) =>
            item.id === isId
              ? {
                  ...item,
                  notlar: [
                    ...item.notlar,
                    { id: String(Date.now()), metin, tarih: `Bugün ${zaman}` },
                  ],
                }
              : item
          ),
        }));
      },

      addMusteri: (yeniVeri) => {
        const olusturulan: MusteriKaydi = {
          ...yeniVeri,
          id: String(Date.now()),
        };

        set((state) => {
          // Eğer müşteriye ait plaka girildiyse ve araçlarda yoksa aracı da ekle
          let guncelAraclar = [...state.araclar];
          if (yeniVeri.plaka) {
            const temizPlaka = yeniVeri.plaka.replace(/\s+/g, "").toUpperCase();
            const aracVar = guncelAraclar.some(
              (a) => a.plaka.replace(/\s+/g, "").toUpperCase() === temizPlaka
            );
            if (!aracVar) {
              guncelAraclar = [
                {
                  id: `a_${Date.now()}`,
                  plaka: yeniVeri.plaka.toUpperCase(),
                  markaModel: "Belirtilmedi",
                  musteri: yeniVeri.adSoyad,
                  telefon: yeniVeri.telefon,
                },
                ...guncelAraclar,
              ];
            }
          }

          return {
            musteriler: [olusturulan, ...state.musteriler],
            araclar: guncelAraclar,
          };
        });

        return olusturulan;
      },

      addArac: (yeniVeri) => {
        const olusturulan: AracKaydi = {
          ...yeniVeri,
          id: String(Date.now()),
        };

        set((state) => {
          // Araç eklenirken sahibi müşterilerde yoksa müşterilere de ekle
          let guncelMusteriler = [...state.musteriler];
          if (yeniVeri.musteri && yeniVeri.musteri !== "Bilinmiyor") {
            const musteriVar = guncelMusteriler.some(
              (m) => m.adSoyad.toLowerCase() === yeniVeri.musteri.toLowerCase()
            );
            if (!musteriVar) {
              guncelMusteriler = [
                {
                  id: `m_${Date.now()}`,
                  adSoyad: yeniVeri.musteri,
                  telefon: yeniVeri.telefon || "Belirtilmedi",
                  plaka: yeniVeri.plaka,
                },
                ...guncelMusteriler,
              ];
            }
          }

          return {
            araclar: [olusturulan, ...state.araclar],
            musteriler: guncelMusteriler,
          };
        });

        return olusturulan;
      },

      addRandevu: (yeniVeri) => {
        const olusturulan: RandevuKaydi = {
          ...yeniVeri,
          id: String(Date.now()),
        };

        set((state) => {
          // Randevu eklenirken müşteri yoksa ekle
          let guncelMusteriler = [...state.musteriler];
          const musteriVar = guncelMusteriler.some(
            (m) => m.adSoyad.toLowerCase() === yeniVeri.musteri.toLowerCase()
          );
          if (!musteriVar) {
            guncelMusteriler = [
              {
                id: `m_${Date.now()}`,
                adSoyad: yeniVeri.musteri,
                telefon: yeniVeri.telefon,
              },
              ...guncelMusteriler,
            ];
          }

          return {
            randevular: [olusturulan, ...state.randevular],
            musteriler: guncelMusteriler,
          };
        });

        return olusturulan;
      },
    }),
    {
      name: "takora-storage",
      skipHydration: true, // SSR ve ilk render sırasında hydration mismatch'i önler
    }
  )
);
