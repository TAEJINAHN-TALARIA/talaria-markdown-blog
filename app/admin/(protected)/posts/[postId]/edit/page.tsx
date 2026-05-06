import { notFound } from "next/navigation";
import matter from "gray-matter";
import { createAdminClient } from "@/utils/supabase/admin";
import PostForm, {
  type CategoryOption,
  type SeriesOption,
} from "@/components/admin/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = createAdminClient();

  const [{ data: post, error }, { data: rows }] = await Promise.all([
    supabase.from("meta_info").select("*").eq("slug", postId).single(),
    supabase
      .from("meta_info")
      .select(
        "category_no, category_name, series_no, series_name, series_seq_no",
      )
      .or("category_no.not.is.null,series_no.not.is.null"),
  ]);

  if (error || !post) notFound();

  const { data: fileData } = await supabase.storage
    .from("posts")
    .download(post.file_path);

  let content = "";
  if (fileData) {
    const raw = await fileData.text();
    const parsed = matter(raw);
    content = parsed.content;
  }

  const categoryMap = new Map<number, CategoryOption>();
  const seriesMap = new Map<number, SeriesOption>();

  for (const row of rows ?? []) {
    if (row.category_no != null && !categoryMap.has(row.category_no)) {
      categoryMap.set(row.category_no, {
        category_no: row.category_no,
        category_name: row.category_name ?? String(row.category_no),
      });
    }
    if (row.series_no != null) {
      const existing = seriesMap.get(row.series_no);
      // Exclude this post's own seq_no from max calculation to avoid off-by-one
      const isCurrentPost = row.series_no === post.series_no;
      const seq = isCurrentPost ? 0 : (row.series_seq_no ?? 0);
      if (!existing) {
        seriesMap.set(row.series_no, {
          series_no: row.series_no,
          series_name: row.series_name ?? String(row.series_no),
          max_seq_no: seq,
        });
      } else if (seq > existing.max_seq_no) {
        existing.max_seq_no = seq;
      }
    }
  }

  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => a.category_no - b.category_no,
  );
  const seriesOptions = Array.from(seriesMap.values()).sort(
    (a, b) => a.series_no - b.series_no,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Edit Post
      </h1>
      <PostForm
        post={{ ...post, content }}
        mode="edit"
        categories={categories}
        seriesOptions={seriesOptions}
      />
    </div>
  );
}
