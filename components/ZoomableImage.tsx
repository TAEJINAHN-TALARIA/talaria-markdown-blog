// components/ZoomableImage.tsx
"use client"; // 👈 중요: 클라이언트 컴포넌트 선언

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css"; // 👈 스타일 필수

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export default function ZoomableImage({ src, alt }: ZoomableImageProps) {
  return (
    // Zoom 컴포넌트로 감싸주면 클릭 시 확대 기능이 작동합니다.
    <Zoom>
      <img
        src={src}
        alt={alt}
        className="rounded-lg shadow-md my-4 cursor-zoom-in" // cursor-zoom-in 추가
        style={{ maxWidth: "100%" }}
      />
    </Zoom>
  );
}
