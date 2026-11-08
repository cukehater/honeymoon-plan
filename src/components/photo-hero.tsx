import Image from "next/image";
import type { ReactNode } from "react";

type Props = { src: string; alt: string; children: ReactNode; height?: number; top?: ReactNode; inset?: boolean };

// 도시 사진 위에 흰 글자를 올린다. 기본은 화면 위쪽 전체 폭, inset이면 본문 안의 둥근 사진 카드.
export function PhotoHero({ src, alt, children, height = 300, top, inset = false }: Props) {
  return (
    <div
      className={
        inset
          ? "relative overflow-hidden rounded-[var(--radius-card)]"
          : "relative -mx-4 -mt-[max(12px,env(safe-area-inset-top))] overflow-hidden sm:mt-0 sm:rounded-b-[28px]"
      }
      style={{ height: inset ? `${height}px` : `calc(${height}px + env(safe-area-inset-top))` }}
    >
      <Image src={src} alt={alt} fill priority sizes="(max-width: 576px) 100vw, 576px" className="object-cover" />
      <div className="photo-scrim absolute inset-0" />
      {top && <div className="absolute inset-x-0 top-[max(8px,env(safe-area-inset-top))] px-4">{top}</div>}
      <div className={`absolute inset-x-0 bottom-0 flex flex-col gap-1 px-5 text-white ${inset ? "pb-10" : "pb-12"}`}>{children}</div>
    </div>
  );
}
