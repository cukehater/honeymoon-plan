import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 영문·숫자는 Montserrat, 한글은 Pretendard(KS X 1001 상용 한글 2,350자 서브셋)
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const pretendard = localFont({
  variable: "--font-pretendard",
  src: [
    { path: "./fonts/Pretendard-Regular.subset.woff2", weight: "400" },
    { path: "./fonts/Pretendard-SemiBold.subset.woff2", weight: "600" },
    { path: "./fonts/Pretendard-Bold.subset.woff2", weight: "700" },
  ],
});

export const metadata: Metadata = {
  title: "허니문 플래너",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#101317" },
  ],
};

// 디자인 계약. 빌드 결과에 HTML 주석으로 남아 이후 리뷰가 이 기준으로 화면을 점검한다.
const DESIGN_CONTRACT = `<!--
THESIS: 신혼여행 두 사람의 앱을 트리플·에어비앤비 여행 탭·토스·애플 지갑 수준의 표준 여행 앱으로 만든다. 기존 종이 일정표 구성은 버린다.
OWN-WORLD: 회색 바탕 위 20px 흰 카드, 강조 파랑 하나, 도시 실사진 헤더, 아이콘 타일, Pretendard·Montserrat의 큰 숫자.
STORY: 열면 오늘 도시 사진과 지금·다음 일정이 보이고, 엄지로 바로 지출을 기록한다.
FIRST VIEWPORT: 홈 위쪽 전체 폭 도시 사진 위에 'Day 7 · 바르셀로나'와 날짜, 사진에 겹쳐 올라온 '지금' 카드, 그 아래 '다음' 일정, 탭 바 위 오른쪽에 지출 추가 버튼.
FORM: 업계 표준(canon), 기준 앱 Triple·Airbnb Trips·Toss·Apple Wallet/TripIt. seed 51110465.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${montserrat.variable} ${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <div hidden dangerouslySetInnerHTML={{ __html: DESIGN_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
