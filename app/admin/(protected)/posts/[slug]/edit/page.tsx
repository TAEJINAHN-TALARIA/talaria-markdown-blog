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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const [
    { data: post, error },
    { data: categoryRows },
    { data: seriesRows },
    { data: postRows },
  ] = await Promise.all([
    supabase.from("meta_info").select("*").eq("slug", slug).single(),
    supabase
      .from("categories")
      .select("category_no, category_name")
      .order("category_no"),
    supabase.from("series").select("series_no, series_name").order("series_no"),
    supabase
      .from("posts")
      .select("id, series_no, series_seq_no")
      .not("series_no", "is", null),
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

  const categories: CategoryOption[] = (categoryRows ?? []).map((c) => ({
    category_no: c.category_no,
    category_name: c.category_name,
  }));

  const seriesMap = new Map<number, SeriesOption>();
  for (const s of seriesRows ?? []) {
    seriesMap.set(s.series_no, {
      series_no: s.series_no,
      series_name: s.series_name,
      max_seq_no: 0,
    });
  }
  for (const row of postRows ?? []) {
    if (row.series_no == null) continue;
    if (row.id === post.id) continue;
    const entry = seriesMap.get(row.series_no);
    if (entry && (row.series_seq_no ?? 0) > entry.max_seq_no) {
      entry.max_seq_no = row.series_seq_no ?? 0;
    }
  }
  const seriesOptions = Array.from(seriesMap.values());

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
