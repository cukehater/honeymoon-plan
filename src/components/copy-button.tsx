"use client";

import { useRef, useState } from "react";

export function CopyCode({ code }: { code: string }) {
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
    <span className="flex flex-wrap items-center gap-x-3">
      <code ref={ref} className="mono text-[15px] break-all select-all">
        {code}
      </code>
      <button
        type="button"
        onClick={copy}
        className="min-h-11 rounded-lg border border-line px-3 text-sm"
        aria-label={`예약번호 ${code} 복사`}
      >
        복사
      </button>
      <span role="status" className="text-xs text-muted">
        {msg}
      </span>
    </span>
  );
}
