export type SektorKodu = "oto-servis" | "teknik-servis" | "mobilya";

export type SektorSablonu = {
  kod: SektorKodu;
  ad: string;
  aciklama: string;
  varlikEtiketi: string; // "Araç" / "Cihaz" / "Ürün"
  moduller: string[];
};

export const SEKTORLER: SektorSablonu[] = [
  {
    kod: "oto-servis",
    ad: "Otomotiv Servisi",
    aciklama: "Oto servis, sanayi ve bakım-onarım işletmeleri",
    varlikEtiketi: "Araç",
    moduller: ["Müşteri", "Araç", "İş", "Randevu", "Fotoğraf", "OCR Ruhsat"],
  },
  {
    kod: "teknik-servis",
    ad: "Teknik Servis",
    aciklama: "Elektronik, beyaz eşya ve cihaz servisleri",
    varlikEtiketi: "Cihaz",
    moduller: ["Müşteri", "Cihaz", "İş", "Randevu", "Fotoğraf"],
  },
  {
    kod: "mobilya",
    ad: "Mobilya Atölyesi",
    aciklama: "Mobilya ve özel üretim atölyeleri",
    varlikEtiketi: "Ürün/Sipariş",
    moduller: ["Müşteri", "Ürün", "Sipariş", "Randevu"],
  },
];

export function sektorBul(kod: string) {
  return SEKTORLER.find((s) => s.kod === kod) || SEKTORLER[0];
}