"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "./MarkdownEditor";
import { createPost, updatePost, type PostData } from "@/app/admin/actions";
import { BlogPost } from "@/types";

interface Props {
  post?: BlogPost & { content: string };
  mode: "create" | "edit";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputClass =
  "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function PostForm({ post, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [categoryName, setCategoryName] = useState(
    post?.category_name ?? "",
  );
  const [categoryNo, setCategoryNo] = useState(
    post?.category_no?.toString() ?? "",
  );
  const [seriesName, setSeriesName] = useState(post?.series_name ?? "");
  const [seriesNo, setSeriesNo] = useState(
    post?.series_no?.toString() ?? "",
  );
  const [seriesSeqNo, setSeriesSeqNo] = useState(
    post?.series_seq_no?.toString() ?? "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    post?.thumbnail_url ?? "",
  );
  const [isOpen, setIsOpen] = useState(post?.open ?? false);
  const [content, setContent] = useState(post?.content ?? "");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (mode === "create") setSlug(slugify(e.target.value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("본문 내용을 입력해주세요.");
      return;
    }
    setError("");

    const data: PostData = {
      title,
      slug,
      description,
      category_name: categoryName,
      category_no: categoryNo ? parseInt(categoryNo) : null,
      series_name: seriesName,
      series_no: seriesNo ? parseInt(seriesNo) : null,
      series_seq_no: seriesSeqNo ? parseInt(seriesSeqNo) : null,
      thumbnail_url: thumbnailUrl,
      open: isOpen,
      content,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPost(data)
          : await updatePost(post!.id, data, post!.file_path);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelClass}>
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            className={inputClass}
            placeholder="포스트 제목"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className={`${inputClass} font-mono`}
            placeholder="post-url-slug"
          />
          <p className="mt-1 text-xs text-gray-400">
            URL: /posts/{slug || "..."}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="포스트 요약 (SEO, 목록 표시에 사용)"
          />
        </div>

        <div>
          <label className={labelClass}>카테고리 이름</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className={inputClass}
            placeholder="예: Development"
          />
        </div>

        <div>
          <label className={labelClass}>카테고리 번호</label>
          <input
            type="number"
            value={categoryNo}
            onChange={(e) => setCategoryNo(e.target.value)}
            className={inputClass}
            placeholder="1"
          />
        </div>

        <div>
          <label className={labelClass}>시리즈 이름</label>
          <input
            type="text"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
            className={inputClass}
            placeholder="예: React Series"
          />
        </div>

        <div>
          <label className={labelClass}>시리즈 번호</label>
          <input
            type="number"
            value={seriesNo}
            onChange={(e) => setSeriesNo(e.target.value)}
            className={inputClass}
            placeholder="1"
          />
        </div>

        <div>
          <label className={labelClass}>시리즈 순서</label>
          <input
            type="number"
            value={seriesSeqNo}
            onChange={(e) => setSeriesSeqNo(e.target.value)}
            className={inputClass}
            placeholder="1"
          />
        </div>

        <div>
          <label className={labelClass}>썸네일 URL</label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isOpen}
            onClick={() => setIsOpen((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isOpen ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isOpen ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isOpen ? "Published (공개)" : "Draft (비공개)"}
          </span>
        </div>
      </div>

      <div>
        <label className={`${labelClass} mb-2`}>
          본문 <span className="text-red-500">*</span>
        </label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          {isPending
            ? "저장 중..."
            : mode === "create"
              ? "포스트 생성"
              : "포스트 수정"}
        </button>
        <a
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          취소
        </a>
      </div>
    </form>
  );
}
