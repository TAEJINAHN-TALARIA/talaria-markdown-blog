import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://talaria-markdown-blog.vercel.app/"), // [필수] 도메인 설정
  title: {
    template: "%s | Talaria",
    default: "Talaria",
  },
  description: "개발, 일상, 인사이트를 기록하는 블로그입니다.",
  // [추가] 구글 서치 콘솔 소유권 확인용 태그 (나중에 코드를 발급받아 넣으세요)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    title: "Talaria",
    description: "개발 관련 인사이트 저장소",
    url: "https://talaria-markdown-blog.vercel.app/",
    siteName: "Talaria",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
