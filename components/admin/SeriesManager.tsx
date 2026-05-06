"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { renameSeries, deleteSeries, updateSeriesOrder } from "@/app/admin/actions";
import { BlogPost } from "@/types";

export interface SeriesInfo {
  series_no: number;
  series_name: string;
  posts: BlogPost[];
}

export default function SeriesManager({
  initialSeries,
}: {
  initialSeries: SeriesInfo[];
}) {
  const [seriesList, setSeriesList] = useState(initialSeries);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingNo, setDeletingNo] = useState<number | null>(null);
  const [expandedNo, setExpandedNo] = useState<number | null>(
    initialSeries.length === 1 ? initialSeries[0]?.series_no ?? null : null,
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(s: SeriesInfo) {
    setEditingNo(s.series_no);
    setEditValue(s.series_name);
    setError("");
  }

  function cancelEdit() {
    setEditingNo(null);
    setEditValue("");
  }

  function handleRename(seriesNo: number) {
    if (!editValue.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await renameSeries(seriesNo, editValue.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setSeriesList((prev) =>
        prev.map((s) =>
          s.series_no === seriesNo
            ? { ...s, series_name: editValue.trim() }
            : s,
        ),
      );
      setEditingNo(null);
    });
  }

  function handleDelete(seriesNo: number) {
    setError("");
    startTransition(async () => {
      const result = await deleteSeries(seriesNo);
      if (result.error) {
        setError(result.error);
        setDeletingNo(null);
        return;
      }
      setSeriesList((prev) => prev.filter((s) => s.series_no !== seriesNo));
      setDeletingNo(null);
      if (expandedNo === seriesNo) setExpandedNo(null);
    });
  }

  function movePost(seriesNo: number, postIndex: number, direction: -1 | 1) {
    const targetIndex = postIndex + direction;
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.series_no !== seriesNo) return s;
        const posts = [...s.posts];
        [posts[postIndex], posts[targetIndex]] = [
          posts[targetIndex],
          posts[postIndex],
        ];
        return { ...s, posts };
      }),
    );
  }

  function saveOrder(seriesNo: number) {
    const series = seriesList.find((s) => s.series_no === seriesNo);
    if (!series) return;
    const updates = series.posts.map((post, i) => ({
      id: post.id,
      series_seq_no: i + 1,
    }));
    setError("");
    startTransition(async () => {
      const result = await updateSeriesOrder(updates);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSeriesList((prev) =>
        prev.map((s) => {
          if (s.series_no !== seriesNo) return s;
          return {
            ...s,
            posts: s.posts.map((post, i) => ({
              ...post,
              series_seq_no: i + 1,
            })),
          };
        }),
      );
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {deletingNo !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              시리즈 삭제
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              이 시리즈에 속한 모든 포스트에서 시리즈 정보가 제거됩니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingNo(null)}
                disabled={isPending}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deletingNo)}
                disabled={isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {seriesList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          시리즈가 없습니다. 포스트에 시리즈를 지정하면 여기에 표시됩니다.
        </div>
      ) : (
        seriesList.map((series) => {
          const isExpanded = expandedNo === series.series_no;
          const isEditing = editingNo === series.series_no;

          return (
            <div
              key={series.series_no}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() =>
                      setExpandedNo(isExpanded ? null : series.series_no)
                    }
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                    aria-label={isExpanded ? "접기" : "펼치기"}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {isEditing ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(series.series_no);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                    />
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                      {series.series_name}
                    </span>
                  )}

                  <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 font-mono">
                    #{series.series_no}
                  </span>

                  <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {series.posts.length}편
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRename(series.series_no)}
                        disabled={isPending}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isPending}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(series)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        이름 변경
                      </button>
                      <button
                        onClick={() => setDeletingNo(series.series_no)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div>
                  <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {series.posts.map((post, idx) => (
                      <li
                        key={post.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-500 dark:text-gray-400">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
                          {post.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              movePost(series.series_no, idx, -1)
                            }
                            disabled={idx === 0 || isPending}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-25 transition-colors"
                            aria-label="위로"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              movePost(series.series_no, idx, 1)
                            }
                            disabled={idx === series.posts.length - 1 || isPending}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-25 transition-colors"
                            aria-label="아래로"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          <Link
                            href={`/admin/posts/${post.slug}/edit`}
                            className="ml-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 transition-colors"
                          >
                            편집
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => saveOrder(series.series_no)}
                      disabled={isPending}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      {isPending ? "저장 중..." : "순서 저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
