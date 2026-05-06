"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "./MarkdownEditor";
import { createPost, updatePost, type PostData } from "@/app/admin/actions";
import { BlogPost } from "@/types";

export interface CategoryOption {
  category_no: number;
  category_name: string;
}

export interface SeriesOption {
  series_no: number;
  series_name: string;
  max_seq_no: number;
}

interface Props {
  post?: BlogPost & { content: string };
  mode: "create" | "edit";
  categories?: CategoryOption[];
  seriesOptions?: SeriesOption[];
}


const inputClass =
  "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const selectClass =
  "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

function getInitialCategoryChoice(
  post: (BlogPost & { content: string }) | undefined,
  categories: CategoryOption[],
): string {
  if (!post?.category_no) return "";
  if (categories.some((c) => c.category_no === post.category_no))
    return String(post.category_no);
  return "new";
}

function getInitialSeriesChoice(
  post: (BlogPost & { content: string }) | undefined,
  seriesOptions: SeriesOption[],
): string {
  if (!post?.series_no) return "";
  if (seriesOptions.some((s) => s.series_no === post.series_no))
    return String(post.series_no);
  return "new";
}

export default function PostForm({
  post,
  mode,
  categories = [],
  seriesOptions = [],
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(
    () => post?.slug ?? crypto.randomUUID(),
  );
  const [description, setDescription] = useState(post?.description ?? "");

  // Category state
  const [categoryChoice, setCategoryChoice] = useState(() =>
    getInitialCategoryChoice(post, categories),
  );
  const [newCategoryName, setNewCategoryName] = useState(
    categoryChoice === "new" ? (post?.category_name ?? "") : "",
  );

  // Series state
  const [seriesChoice, setSeriesChoice] = useState(() =>
    getInitialSeriesChoice(post, seriesOptions),
  );
  const [newSeriesName, setNewSeriesName] = useState(
    getInitialSeriesChoice(post, seriesOptions) === "new"
      ? (post?.series_name ?? "")
      : "",
  );

  const [thumbnailUrl, setThumbnailUrl] = useState(
    post?.thumbnail_url ?? "",
  );
  const [isOpen, setIsOpen] = useState(post?.open ?? false);
  const [content, setContent] = useState(post?.content ?? "");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleCategoryChange(value: string) {
    setCategoryChoice(value);
    if (value !== "new") {
      setNewCategoryName("");
    }
  }

  function handleSeriesChange(value: string) {
    setSeriesChoice(value);
    if (value !== "new") {
      setNewSeriesName("");
    }
  }

  function buildPostData(): PostData {
    // Resolve category
    let resolvedCategoryName = "";
    let resolvedCategoryNo: number | null = null;
    if (categoryChoice === "new") {
      resolvedCategoryName = newCategoryName;
      resolvedCategoryNo =
        post?.category_no ??
        Math.max(0, ...categories.map((c) => c.category_no)) + 1;
    } else if (categoryChoice !== "") {
      const found = categories.find(
        (c) => c.category_no === parseInt(categoryChoice),
      );
      if (found) {
        resolvedCategoryName = found.category_name;
        resolvedCategoryNo = found.category_no;
      }
    }

    // Resolve series
    let resolvedSeriesName = "";
    let resolvedSeriesNo: number | null = null;
    let resolvedSeriesSeqNo: number | null = null;
    if (seriesChoice === "new") {
      resolvedSeriesName = newSeriesName;
      resolvedSeriesNo =
        post?.series_no ??
        Math.max(0, ...seriesOptions.map((s) => s.series_no)) + 1;
      resolvedSeriesSeqNo = 1;
    } else if (seriesChoice !== "") {
      const found = seriesOptions.find(
        (s) => s.series_no === parseInt(seriesChoice),
      );
      if (found) {
        resolvedSeriesName = found.series_name;
        resolvedSeriesNo = found.series_no;
        if (mode === "edit" && post?.series_no === found.series_no) {
          resolvedSeriesSeqNo = post?.series_seq_no ?? found.max_seq_no + 1;
        } else {
          resolvedSeriesSeqNo = found.max_seq_no + 1;
        }
      }
    }

    return {
      title,
      slug,
      description,
      category_name: resolvedCategoryName,
      category_no: resolvedCategoryNo,
      series_name: resolvedSeriesName,
      series_no: resolvedSeriesNo,
      series_seq_no: resolvedSeriesSeqNo,
      thumbnail_url: thumbnailUrl,
      open: isOpen,
      content,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("본문 내용을 입력해주세요.");
      return;
    }
    setError("");

    startTransition(async () => {
      const data = buildPostData();
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
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className={`${inputClass} font-mono`}
              placeholder="post-url-slug"
            />
            {mode === "create" && (
              <button
                type="button"
                onClick={() => setSlug(crypto.randomUUID())}
                className="flex-shrink-0 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                재생성
              </button>
            )}
          </div>
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

        {/* Category */}
        <div className="md:col-span-2">
          <label className={labelClass}>카테고리</label>
          <select
            value={categoryChoice}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={selectClass}
          >
            <option value="">-- 카테고리 없음 --</option>
            {categories.map((c) => (
              <option key={c.category_no} value={String(c.category_no)}>
                {c.category_name}
              </option>
            ))}
            <option value="new">+ 새 카테고리 추가</option>
          </select>

          {categoryChoice === "new" && (
            <div className="mt-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={inputClass}
                placeholder="카테고리 이름"
              />
            </div>
          )}
        </div>

        {/* Series */}
        <div className="md:col-span-2">
          <label className={labelClass}>시리즈</label>
          <select
            value={seriesChoice}
            onChange={(e) => handleSeriesChange(e.target.value)}
            className={selectClass}
          >
            <option value="">-- 시리즈 없음 --</option>
            {seriesOptions.map((s) => (
              <option key={s.series_no} value={String(s.series_no)}>
                {s.series_name} ({s.max_seq_no}편)
              </option>
            ))}
            <option value="new">+ 새 시리즈 추가</option>
          </select>

          {seriesChoice === "new" && (
            <div className="mt-2">
              <input
                type="text"
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
                className={inputClass}
                placeholder="시리즈 이름"
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
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
