import { db } from "./db";

// Setting.value는 JSON 문자열. fx_eur_krw: €1당 원, reserve_pct: 예비비 비율(%)
export async function getSettings() {
  const rows = await db.setting.findMany();
  const get = (key: string, fallback: number) => {
    const v = rows.find((r) => r.key === key)?.value;
    return v == null ? fallback : Number(JSON.parse(v));
  };
  return { fxRate: get("fx_eur_krw", 1544), reservePct: get("reserve_pct", 10) };
}
