import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { BlogPost } from "@/types";
import DeletePostButton from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("meta_info")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {posts && posts.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  제목
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  카테고리
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  날짜
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(posts as BlogPost[]).map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                      {post.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {post.category_name || (
                      <span className="text-gray-300 dark:text-gray-600">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.open
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {post.open ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/posts/${post.slug}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeletePostButton
                        postId={post.id}
                        filePath={post.file_path}
                        slug={post.slug}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="mb-3">아직 포스트가 없습니다.</p>
            <Link
              href="/admin/posts/new"
              className="text-blue-600 hover:underline text-sm"
            >
              첫 포스트를 작성해보세요
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
