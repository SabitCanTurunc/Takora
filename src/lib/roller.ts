export function rolSeviyesi(rol: string) {
  if (rol === "SAHIP") return 3;
  if (rol === "YONETICI") return 2;
  return 1;
}