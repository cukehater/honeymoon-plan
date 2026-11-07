"use client";

import { useOptimistic, useState, useTransition } from "react";
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
      <div className="flex items-center gap-3 text-sm text-muted">
        <div
          role="progressbar"
          aria-label="체크리스트 진행"
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-valuenow={done}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
        >
          <i className="block h-full bg-ok transition-[width] motion-reduce:transition-none" style={{ width: `${(done / all.length) * 100}%` }} />
        </div>
        <span className="mono">
          {done}/{all.length}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-warn">
          {error}
        </p>
      )}
      {optimistic.map((g) => (
        <section
          key={g.id}
          className={`flex flex-col rounded-[10px] border bg-surface px-4 py-4 ${g.urgent ? "border-warn/50" : "border-line"}`}
        >
          <h2 className="mb-1.5 flex items-center gap-2 text-[17px]">
            {g.title}
            {g.urgent && <small className="text-xs font-semibold text-warn">먼저 할 것</small>}
          </h2>
          {g.items.map((i, idx) => (
            <label
              key={i.id}
              className={`grid min-h-11 cursor-pointer grid-cols-[22px_1fr] items-start gap-2.5 py-2 ${idx > 0 ? "border-t border-line" : ""}`}
            >
              <input
                type="checkbox"
                checked={!!i.checkedBy}
                onChange={(e) => toggle(i.id, e.target.checked)}
                className="mt-[3px] size-[18px] accent-ok"
              />
              <span className="min-w-0">
                <b className={`font-semibold ${i.checkedBy ? "text-muted line-through" : ""}`}>{i.title}</b>
                {i.dueAt && <span className="mono ml-1.5 text-[11px] text-warn">{formatDue(i.dueAt)} 마감</span>}
                {i.checkedBy && <span className="ml-1.5 text-xs text-ok">✓ {i.checkedBy.name}</span>}
                {i.detail && <em className="block text-[13px] text-muted not-italic">{i.detail}</em>}
              </span>
            </label>
          ))}
        </section>
      ))}
    </>
  );
}
