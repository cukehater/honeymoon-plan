"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Badge, Card, ProgressBar } from "@/components/ui";
import { toggleChecklistItem } from "./actions";

type Item = {
  id: number;
  title: string;
  detail: string | null;
  dueAt: Date | null;
  checkedBy: { name: string } | null;
};
type Group = { id: number; title: string; urgent: boolean; items: Item[] };

// dueAt은 시드에서 적힌 "10/31 16:00"을 UTC로 저장했으므로 UTC 그대로 보여준다
function formatDue(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

export function ChecklistView({ groups, myName }: { groups: Group[]; myName: string }) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useOptimistic(groups, (state, { id, checked }: { id: number; checked: boolean }) =>
    state.map((g) => ({
      ...g,
      items: g.items.map((i) => (i.id === id ? { ...i, checkedBy: checked ? { name: myName } : null } : i)),
    })),
  );

  const all = optimistic.flatMap((g) => g.items);
  const done = all.filter((i) => i.checkedBy).length;

  function toggle(id: number, checked: boolean) {
    setError("");
    startTransition(async () => {
      setOptimistic({ id, checked });
      try {
        await toggleChecklistItem(id, checked);
      } catch {
        setError("저장하지 못했습니다. 다시 눌러 주세요.");
      }
    });
  }

  return (
    <>
      <Card className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[13px] font-semibold text-muted">출발 준비</span>
            <p className="mono text-[30px] leading-tight font-bold">{Math.round((done / all.length) * 100)}%</p>
          </div>
          <span className="mono pb-1 text-[15px] font-semibold text-muted">
            {done} / {all.length}
          </span>
        </div>
        <ProgressBar value={done} max={all.length} tone="ok" label="체크리스트 진행" />
      </Card>
      {error && (
        <p role="alert" className="rounded-[14px] bg-warn-soft px-4 py-3 text-[14px] font-semibold text-warn">
          {error}
        </p>
      )}
      {optimistic.map((g) => {
        const groupDone = g.items.filter((i) => i.checkedBy).length;
        return (
          <Card key={g.id} className={g.urgent ? "ring-2 ring-caution/40" : ""}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[17px]">
                {g.title}
                {g.urgent && <Badge tone="caution">먼저 할 것</Badge>}
              </h2>
              <span className="mono text-[13px] font-semibold text-muted">
                {groupDone}/{g.items.length}
              </span>
            </div>
            <ul>
              {g.items.map((i) => (
                <li key={i.id} className="border-t border-line first:border-t-0">
                  <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={!!i.checkedBy}
                      onChange={(e) => toggle(i.id, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                        i.checkedBy ? "border-ok bg-ok text-surface" : "border-line"
                      }`}
                    >
                      {i.checkedBy && <Check size={15} strokeWidth={3} />}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[15px] font-semibold ${i.checkedBy ? "text-muted line-through" : ""}`}>{i.title}</span>
                        {i.dueAt && <Badge tone="caution">{formatDue(i.dueAt)} 마감</Badge>}
                        {i.checkedBy && <Badge tone="ok">{i.checkedBy.name}</Badge>}
                      </span>
                      {i.detail && <span className="text-[13px] leading-relaxed text-muted">{i.detail}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </>
  );
}
