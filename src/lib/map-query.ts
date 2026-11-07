import type { City, ItemKind } from "../generated/prisma/enums";

const CITY_NAME: Record<City, string> = { paris: "Paris", porto: "Porto", barcelona: "Barcelona" };

// "점심: 카자 게데스 (Casa Guedes)" → "카자 게데스 Porto"
export function toMapQuery(title: string, kind: ItemKind, city: City): string | null {
  if (kind === "flight" || kind === "rest") return null;
  const place = title
    .replace(/^(점심|저녁|허니문 디너|마지막 밤 저녁):\s*/, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${place} ${CITY_NAME[city]}`;
}
