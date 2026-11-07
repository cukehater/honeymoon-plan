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

// 사진 출처는 public/images/CREDITS.md
export const CITY_PHOTO: Record<City, string> = {
  paris: "/images/porto-dusk.webp",
  porto: "/images/porto.webp",
  barcelona: "/images/barcelona.webp",
};

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
