import React from "react";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: SidebarSectionProps) {
  return (
    <details
      className="group mt-5 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-700"
      open={defaultOpen || undefined}
    >
      <summary className="flex justify-between items-center p-4 font-medium cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-100">
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </details>
  );
}
