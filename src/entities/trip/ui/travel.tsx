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
} from 'lucide-react'

import type { CategoryType, CityType, ItemKindType } from '@/shared/db'
import type { IconType, ToneType } from '@/shared/ui/primitives'

export const CITY_NAME: Record<CityType, string> = {
  paris: '파리',
  porto: '포르투',
  barcelona: '바르셀로나',
}

// 첫 장이 도시 대표 사진이다.
const CITY_PHOTOS: Record<CityType, string[]> = {
  paris: ['/images/porto-dusk.webp'],
  porto: ['/images/porto.webp', '/images/porto-azulejo.webp', '/images/porto-dusk.webp'],
  barcelona: [
    '/images/barcelona.webp',
    '/images/barcelona-guell.webp',
    '/images/barcelona-view.webp',
  ],
}

// 같은 도시에서 n번째 날이면 n번째 사진(돌려 쓴다). 날짜마다 사진이 반복되지 않게 한다.
export const dayPhoto = (days: { date: string; city: CityType }[], date: string) => {
  const day = days.find((d) => d.date === date)!
  const nth = days.filter((d) => d.city === day.city && d.date < date).length
  const list = CITY_PHOTOS[day.city]
  return list[nth % list.length]
}

export const KIND_ICON: Record<ItemKindType, IconType> = {
  activity: Landmark,
  meal: Utensils,
  flight: Plane,
  transfer: Car,
  rest: Moon,
}
export const KIND_LABEL: Record<ItemKindType, string> = {
  activity: '관광',
  meal: '식사',
  flight: '항공',
  transfer: '이동',
  rest: '휴식',
}

export const CATEGORY_ICON: Record<CategoryType, IconType> = {
  air: Plane,
  stay: BedDouble,
  food: Utensils,
  tour: Landmark,
  transport: TrainFront,
  shopping: ShoppingBag,
  etc: Ellipsis,
}
export const CATEGORY_TONE: Record<CategoryType, ToneType> = {
  air: 'accent',
  stay: 'accent',
  food: 'caution',
  tour: 'ok',
  transport: 'neutral',
  shopping: 'warn',
  etc: 'neutral',
}

export const mapUrl = (query: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
