"use client";

import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
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
        theme="light"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
