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

export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${montserrat.variable} ${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
