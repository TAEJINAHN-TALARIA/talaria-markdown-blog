"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/admin/actions";

interface Props {
  postId: string;
  filePath: string;
  slug: string;
}

export default function DeletePostButton({ postId, filePath, slug }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`"${slug}" 포스트를 삭제하시겠습니까? 되돌릴 수 없습니다.`))
      return;

    startTransition(async () => {
      const result = await deletePost(postId, filePath, slug);
      if (result.error) {
        alert("삭제 실패: " + result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
    >
      {isPending ? "..." : "Delete"}
    </button>
  );
}
