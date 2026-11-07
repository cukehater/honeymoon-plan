"use client";

import { useState, useTransition } from "react";
import type { ItemKind } from "@/generated/prisma/enums";
import { useSafeAction } from "@/lib/use-safe-action";
import { createItineraryItem, setItineraryItemHidden, updateItineraryItem } from "./actions";

const input = "min-h-11 rounded-lg border border-line bg-surface px-3 text-base text-fg";
const submit = "min-h-11 rounded-lg bg-fg px-4 text-sm font-bold text-bg disabled:opacity-60";

function Message({ error }: { error?: string }) {
  return error ? (
    <p role="alert" className="text-sm text-warn">
      {error}
    </p>
  ) : null;
}

// 숨기기·다시 보이기 버튼
export function HideButton({ id, hidden, label }: { id: number; hidden: boolean; label: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            try {
              const r = await setItineraryItemHidden(id, hidden);
              if (r?.error) setError(r.error);
            } catch {
              setError("서버에 연결하지 못했습니다. 다시 시도해 주세요.");
            }
          })
        }
        className="min-h-11 rounded-lg border border-line px-4 text-sm disabled:opacity-60"
      >
        {pending ? "저장 중…" : label}
      </button>
      <Message error={error} />
    </>
  );
}

export function ItemEditor({ item }: { item: { id: number; startTime: string; description: string | null } }) {
  const [startTime, setStartTime] = useState(item.startTime);
  const [description, setDescription] = useState(item.description ?? "");
  const [state, action, pending] = useSafeAction(updateItineraryItem);
  return (
    <details className="text-sm open:basis-full">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-azul">편집</summary>
      <form action={action} className="flex flex-col gap-3 pb-2">
        <input type="hidden" name="id" value={item.id} />
        <label className="flex flex-col gap-1 text-muted">
          시각 (현지)
          <input type="time" name="startTime" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`mono ${input}`} />
        </label>
        <label className="flex flex-col gap-1 text-muted">
          메모
          <textarea name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${input} py-2`} />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={pending} className={submit}>
            {pending ? "저장 중…" : "저장"}
          </button>
          <HideButton id={item.id} hidden label="이 항목 숨기기" />
          {state && !state.error && <span role="status" className="text-ok">저장했습니다.</span>}
        </div>
        <Message error={state?.error} />
      </form>
    </details>
  );
}

const KINDS: { value: ItemKind; label: string }[] = [
  { value: "activity", label: "관광" },
  { value: "meal", label: "식사" },
  { value: "transfer", label: "이동" },
  { value: "flight", label: "항공" },
  { value: "rest", label: "휴식" },
];

export function AddItemForm({ date }: { date: string }) {
  const empty = { startTime: "", title: "", kind: "activity" as ItemKind, description: "" };
  const [v, setV] = useState(empty);
  const set = <K extends keyof typeof empty>(k: K, value: (typeof empty)[K]) => setV((s) => ({ ...s, [k]: value }));
  // 성공했을 때만 비운다. 실패하면 입력이 남는다.
  const [state, action, pending] = useSafeAction(async (prev, formData) => {
    const r = await createItineraryItem(prev, formData);
    if (!r?.error) setV(empty);
    return r;
  });
  return (
    <details className="rounded-[10px] border border-dashed border-line px-4">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">+ 일정 항목 추가</summary>
      <form action={action} className="flex flex-col gap-3 pb-4 text-sm">
        <input type="hidden" name="date" value={date} />
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-muted">
            시각 (현지)
            <input type="time" name="startTime" required value={v.startTime} onChange={(e) => set("startTime", e.target.value)} className={`mono ${input}`} />
          </label>
          <label className="flex flex-col gap-1 text-muted">
            종류
            <select name="kind" value={v.kind} onChange={(e) => set("kind", e.target.value as ItemKind)} className={input}>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-muted">
          제목
          <input name="title" required maxLength={200} value={v.title} onChange={(e) => set("title", e.target.value)} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-muted">
          메모
          <textarea name="description" rows={2} value={v.description} onChange={(e) => set("description", e.target.value)} className={`${input} py-2`} />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className={submit}>
            {pending ? "저장 중…" : "추가"}
          </button>
          {state && !state.error && <span role="status" className="text-ok">추가했습니다.</span>}
        </div>
        <Message error={state?.error} />
      </form>
    </details>
  );
}
