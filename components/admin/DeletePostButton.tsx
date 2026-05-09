"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/admin/actions";

interface Props {
  postId: string;
  filePath: string;
  slug: string;
}

export default function DeletePostButton({ postId, filePath, slug }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(postId, filePath, slug);
      if ("error" in result) {
        alert("삭제 실패: " + result.error!);
      } else {
        setShowConfirm(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              포스트 삭제
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              아래 포스트를 삭제하시겠습니까?
            </p>
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mb-5 break-all">
              {slug}
            </p>
            <p className="text-xs text-red-500 mb-5">되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
