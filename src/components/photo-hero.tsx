import Image from "next/image";
import type { ReactNode } from "react";

// 화면 위쪽 전체 폭 도시 사진. 아래쪽 그늘 위에 흰 글자를 올린다.
export function PhotoHero({ src, alt, children, height = 300, top }: { src: string; alt: string; children: ReactNode; height?: number; top?: ReactNode }) {
  return (
    <div
      className="relative -mx-4 -mt-[max(12px,env(safe-area-inset-top))] overflow-hidden sm:mt-0 sm:rounded-b-[28px]"
      style={{ height: `calc(${height}px + env(safe-area-inset-top))` }}
    >
      <Image src={src} alt={alt} fill priority sizes="(max-width: 576px) 100vw, 576px" className="object-cover" />
      <div className="photo-scrim absolute inset-0" />
      {top && <div className="absolute inset-x-0 top-[max(8px,env(safe-area-inset-top))] px-4">{top}</div>}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 px-5 pb-12 text-white">{children}</div>
    </div>
  );
}
