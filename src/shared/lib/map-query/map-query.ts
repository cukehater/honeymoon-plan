import type { CityType, ItemKindType } from '@/shared/db'

const CITY_NAME: Record<CityType, string> = {
  paris: 'Paris',
  porto: 'Porto',
  barcelona: 'Barcelona',
}

// "점심: 카자 게데스 (Casa Guedes)" → "카자 게데스 Porto"
export const toMapQuery = (title: string, kind: ItemKindType, city: CityType): string | null => {
  if (kind === 'flight' || kind === 'rest') return null
  const place = title
    .replace(/^(점심|저녁|허니문 디너|마지막 밤 저녁):\s*/, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return `${place} ${CITY_NAME[city]}`
}
