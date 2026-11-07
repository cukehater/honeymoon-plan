import {
  BedDouble,
  Car,
  Ellipsis,
  Landmark,
  Moon,
  Plane,
  ShoppingBag,
  TrainFront,
  Utensils,
} from "lucide-react";
import type { Category, City, ItemKind } from "@/generated/prisma/enums";
import type { Icon, Tone } from "./ui";

export const CITY_NAME: Record<City, string> = { paris: "파리", porto: "포르투", barcelona: "바르셀로나" };

// 사진 출처는 public/images/CREDITS.md. 첫 장이 도시 대표 사진이다.
const CITY_PHOTOS: Record<City, string[]> = {
  paris: ["/images/porto-dusk.webp"],
  porto: ["/images/porto.webp", "/images/porto-azulejo.webp", "/images/porto-dusk.webp"],
  barcelona: ["/images/barcelona.webp", "/images/barcelona-guell.webp", "/images/barcelona-view.webp"],
};
export const CITY_PHOTO: Record<City, string> = {
  paris: CITY_PHOTOS.paris[0],
  porto: CITY_PHOTOS.porto[0],
  barcelona: CITY_PHOTOS.barcelona[0],
};

// 같은 도시에서 n번째 날이면 n번째 사진(돌려 쓴다). 날짜마다 사진이 반복되지 않게 한다.
export function dayPhoto(days: { date: string; city: City }[], date: string) {
  const day = days.find((d) => d.date === date)!;
  const nth = days.filter((d) => d.city === day.city && d.date < date).length;
  const list = CITY_PHOTOS[day.city];
  return list[nth % list.length];
}

export const KIND_ICON: Record<ItemKind, Icon> = {
  activity: Landmark,
  meal: Utensils,
  flight: Plane,
  transfer: Car,
  rest: Moon,
};
export const KIND_LABEL: Record<ItemKind, string> = { activity: "관광", meal: "식사", flight: "항공", transfer: "이동", rest: "휴식" };

export const CATEGORY_ICON: Record<Category, Icon> = {
  air: Plane,
  stay: BedDouble,
  food: Utensils,
  tour: Landmark,
  transport: TrainFront,
  shopping: ShoppingBag,
  etc: Ellipsis,
};
export const CATEGORY_TONE: Record<Category, Tone> = {
  air: "accent",
  stay: "accent",
  food: "caution",
  tour: "ok",
  transport: "neutral",
  shopping: "warn",
  etc: "neutral",
};

export function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
