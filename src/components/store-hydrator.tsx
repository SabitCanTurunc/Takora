"use client";

import { useEffect } from "react";
import { useTakoraStore } from "@/lib/store";

export function StoreHydrator() {
  useEffect(() => {
    // Sadece tarayıcıda bileşen mount edildikten sonra çalışır
    useTakoraStore.persist.rehydrate();
  }, []);

  return null;
}
