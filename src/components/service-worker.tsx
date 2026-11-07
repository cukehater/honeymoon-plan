"use client";

import { useEffect } from "react";

// 개발 서버에서는 정적 파일이 자주 바뀌므로 운영 빌드에서만 등록한다
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
