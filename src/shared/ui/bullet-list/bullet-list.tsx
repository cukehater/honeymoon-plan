import { toBullets } from './to-bullets'

// 설명을 줄 단위 점 목록으로 보여준다. 한 줄짜리 문단은 항목 하나가 된다.
export const BulletList = ({ text, className = '' }: { text: string; className?: string }) => (
  <ul className={`list-disc space-y-0.5 pl-4 ${className}`}>
    {toBullets(text).map((line) => (
      <li key={line}>{line}</li>
    ))}
  </ul>
)
