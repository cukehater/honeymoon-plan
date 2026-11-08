"use client";

import { useState } from "react";
import { field, input, primaryButton } from "@/components/form-styles";
import { useSafeAction } from "@/lib/use-safe-action";
import { type FormState, updateSetting } from "./actions";

const submit = `${primaryButton} min-h-12 text-[15px]`;

function Result({ state }: { state: FormState }) {
  if (!state) return null;
  return state.error ? (
    <p role="alert" className="text-[13px] font-semibold text-warn">
      {state.error}
    </p>
  ) : (
    <p role="status" className="text-[13px] font-semibold text-ok">
      저장했습니다.
    </p>
  );
}

export function SettingForm({ name, label, unit, initial }: { name: "fx_eur_krw"; label: string; unit: string; initial: number }) {
  const [value, setValue] = useState(String(initial));
  const [state, action, pending] = useSafeAction(updateSetting);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="key" value={name} />
      <label className={`${field} min-w-0 flex-1`}>
        {label}
        <span className="relative flex items-center">
          <input name="value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={`mono pr-10 text-right ${input}`} />
          <span className="pointer-events-none absolute right-4 text-[15px] font-semibold text-muted">{unit}</span>
        </span>
      </label>
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "저장 중…" : "저장"}
      </button>
      <div className="basis-full">
        <Result state={state} />
      </div>
    </form>
  );
}
