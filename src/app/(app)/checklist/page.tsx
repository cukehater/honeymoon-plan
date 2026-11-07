import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ChecklistView } from "./checklist-view";

export const metadata = { title: "체크리스트" };

export default async function ChecklistPage() {
  const { userId } = await getSession();
  const [groups, me] = await Promise.all([
    db.checklistGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" }, include: { checkedBy: { select: { name: true } } } } },
    }),
    db.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  return (
    <>
      <PageHeader title="체크리스트" />
      <ChecklistView groups={groups} myName={me.name} />
    </>
  );
}
