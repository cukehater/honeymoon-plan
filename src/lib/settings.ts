import { db } from "./db";

// Setting.value는 JSON 문자열. fx_eur_krw: €1당 원
export async function getSettings() {
  const row = await db.setting.findUnique({ where: { key: "fx_eur_krw" } });
  return { fxRate: row ? Number(JSON.parse(row.value)) : 1544 };
}
