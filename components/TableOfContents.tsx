"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 포스트 내의 모든 제목 요소 추출
    const article = document.querySelector("article");
    if (!article) return;

    const headingElements = article.querySelectorAll("h2, h3, h4");
    const items: TocItem[] = Array.from(headingElements).map((heading) => {
      // ID가 없으면 생성
      if (!heading.id) {
        heading.id =
          heading.textContent?.replace(/\s+/g, "-").toLowerCase() || "";
      }
      return {
        id: heading.id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName[1]),
      };
    });

    // requestAnimationFrame으로 setState를 비동기로 실행
    requestAnimationFrame(() => {
      setHeadings(items);
    });

    // Intersection Observer로 현재 보이는 섹션 추적
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%", threshold: 1.0 },
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden 2xl:block fixed top-24 left-[calc(50%+34rem)] w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <List className="w-4 h-4" />
          <span>Contents</span>
        </div>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block py-1 border-l-2 pl-3 transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  activeId === heading.id
                    ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium"
                    : "border-transparent text-gray-600 dark:text-gray-400"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
