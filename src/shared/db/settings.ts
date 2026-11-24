import { eq } from 'drizzle-orm'

import { db } from './client'
import { setting } from './schema'

// Setting.value는 JSON 문자열. fx_eur_krw: €1당 원
export const getSettings = async () => {
  const row = await db.query.setting.findFirst({ where: eq(setting.key, 'fx_eur_krw') })
  return { fxRate: row ? Number(JSON.parse(row.value)) : 1544 }
}
