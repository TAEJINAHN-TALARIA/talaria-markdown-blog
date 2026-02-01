// components/PostNavigation.tsx
"use client"; // 클라이언트 기능을 쓰기 위해 필수

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function PostNavigation() {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-4 mb-8 text-sm font-medium text-gray-500">
      {/* 뒤로 가기 버튼: 브라우저 히스토리 이용 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>뒤로</span>
      </button>

      <span className="text-gray-300">|</span>

      {/* 홈으로 버튼: 메인 페이지로 이동 */}
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>홈으로</span>
      </Link>
    </nav>
  );
}
