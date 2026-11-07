import type { Metadata, Viewport } from "next";
import { Gowun_Batang, IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const gowun = Gowun_Batang({ variable: "--font-gowun", weight: ["400", "700"], subsets: ["latin"] });
const plexKr = IBM_Plex_Sans_KR({ variable: "--font-plex-kr", weight: ["400", "500", "600"], subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", weight: ["500"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "허니문 플래너",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${gowun.variable} ${plexKr.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
