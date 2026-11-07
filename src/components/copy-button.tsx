"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCode({ code, label = "예약번호" }: { code: string; label?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [msg, setMsg] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setMsg("복사됨");
    } catch {
      // 클립보드 권한이 없으면 텍스트를 선택해 두어 직접 복사하게 한다
      if (ref.current) window.getSelection()?.selectAllChildren(ref.current);
      setMsg("길게 눌러 복사하세요");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-[12px] font-semibold text-muted">{label}</span>
        <code ref={ref} className="mono text-[17px] font-bold tracking-wide break-all select-all">
          {code}
        </code>
        <span role="status" className="text-[12px] font-semibold text-ok">
          {msg}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        className="press inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-4 text-[13px] font-semibold text-fg"
        aria-label={`${label} ${code} 복사`}
      >
        {msg === "복사됨" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        복사
      </button>
    </div>
  );
}
