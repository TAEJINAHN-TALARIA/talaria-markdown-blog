// components/ZoomableImage.tsx
"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Image from "next/image";
import { useState } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export default function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // 외부 URL인지 확인
  const isExternal = src.startsWith("http");

  return (
    <Zoom>
      <div className="relative my-4">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className={`rounded-lg shadow-md cursor-zoom-in transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={{ width: "100%", height: "auto" }}
          onLoad={() => setIsLoading(false)}
          unoptimized={isExternal} // 외부 이미지는 최적화 비활성화
          priority={false}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
        )}
      </div>
    </Zoom>
  );
}
