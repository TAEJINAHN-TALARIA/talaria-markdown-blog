"use client";

import Giscus from "@giscus/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function Comments() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 h-32" />;
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <Giscus
        repo="TAEJINAHN-TALARIA/talaria-markdown-blog"
        repoId="R_kgDORF6oTg"
        category="General"
        categoryId="DIC_kwDORF6oTs4C3dJ5"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={theme === "dark" ? "dark" : "light"}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
