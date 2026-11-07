import type { NextRequest } from "next/server";
import { CATEGORY_LABEL } from "@/lib/budget";
import { toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { centsToInput } from "@/lib/format";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const CITY = { porto: "포르투", barcelona: "바르셀로나", paris: "파리" } as const;
const TAX_FREE_STATUS = { form: "서류 받음", validated: "공항 확인", refunded: "환급 완료" } as const;

export async function GET(request: NextRequest) {
  if (!(await verifySession(request.cookies.get(SESSION_COOKIE)?.value))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const expenses = await db.expense.findMany({
    orderBy: [{ spentOn: "asc" }, { createdAt: "asc" }],
    include: { paidBy: { select: { name: true } } },
  });
  const csv = toCsv([
    ["날짜", "도시", "항목", "내용", "통화", "금액", "환율", "원화", "결제수단", "결제한 사람", "메모", "환급 예상(€)", "환급 상태"],
    ...expenses.map((e) => [
      e.spentOn,
      CITY[e.city],
      CATEGORY_LABEL[e.category],
      e.title,
      e.currency,
      e.currency === "EUR" ? centsToInput(e.amountMinor) : e.amountMinor,
      e.fxRate,
      e.amountKrw,
      e.method === "card" ? "카드" : "현금",
      e.paidBy.name,
      e.memo,
      e.taxFreeMinor == null ? null : centsToInput(e.taxFreeMinor),
      e.taxFreeStatus && TAX_FREE_STATUS[e.taxFreeStatus],
    ]),
  ]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="honeymoon-expenses.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
