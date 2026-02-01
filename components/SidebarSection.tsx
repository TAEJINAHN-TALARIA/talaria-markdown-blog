import React, { useState } from "react";

// Props 타입을 별도로 정의하거나 인라인으로 작성할 수 있습니다.
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean; // 기본값이 있으므로 선택적(optional) 속성으로 ?를 붙입니다.
}

export default function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className="group mt-5 border border-gray-200 rounded-lg overflow-hidden bg-white"
      open={isOpen}
      onToggle={(e) =>
        setIsOpen((e.currentTarget as HTMLDetailsElement).open)
      }
    >
      <summary className="flex justify-between items-center p-4 font-medium cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span>{title}</span>
        <span className="transition-transform group-open:rotate-180">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </summary>
      <div className="p-4 border-t border-gray-200 text-gray-600">
        {children}
      </div>
    </details>
  );
}
