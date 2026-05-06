"use client";

import { useState, useTransition } from "react";
import { renameCategory, deleteCategory } from "@/app/admin/actions";

export interface CategoryInfo {
  category_no: number;
  category_name: string;
  post_count: number;
}

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryInfo[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingNo, setDeletingNo] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(cat: CategoryInfo) {
    setEditingNo(cat.category_no);
    setEditValue(cat.category_name);
    setError("");
  }

  function cancelEdit() {
    setEditingNo(null);
    setEditValue("");
  }

  function handleRename(categoryNo: number) {
    if (!editValue.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await renameCategory(categoryNo, editValue.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setCategories((prev) =>
        prev.map((c) =>
          c.category_no === categoryNo
            ? { ...c, category_name: editValue.trim() }
            : c,
        ),
      );
      setEditingNo(null);
    });
  }

  function handleDelete(categoryNo: number) {
    setError("");
    startTransition(async () => {
      const result = await deleteCategory(categoryNo);
      if (result.error) {
        setError(result.error);
        setDeletingNo(null);
        return;
      }
      setCategories((prev) => prev.filter((c) => c.category_no !== categoryNo));
      setDeletingNo(null);
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {deletingNo !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              카테고리 삭제
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              이 카테고리에 속한 모든 포스트에서 카테고리 정보가 제거됩니다.
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
            카테고리가 없습니다. 포스트에 카테고리를 지정하면 여기에 표시됩니다.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  카테고리 이름
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  No
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  포스트 수
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {categories.map((cat) => (
                <tr
                  key={cat.category_no}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    {editingNo === cat.category_no ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.category_no);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {cat.category_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {cat.category_no}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {cat.post_count}개
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {editingNo === cat.category_no ? (
                        <>
                          <button
                            onClick={() => handleRename(cat.category_no)}
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
                            onClick={() => startEdit(cat)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            이름 변경
                          </button>
                          <button
                            onClick={() => setDeletingNo(cat.category_no)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
