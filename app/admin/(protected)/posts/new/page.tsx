import { createAdminClient } from "@/utils/supabase/admin";
import PostForm, {
  type CategoryOption,
  type SeriesOption,
} from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const supabase = createAdminClient();

  const [{ data: categoryRows }, { data: seriesRows }, { data: postRows }] =
    await Promise.all([
      supabase.from("categories").select("category_no, category_name").order("category_no"),
      supabase.from("series").select("series_no, series_name").order("series_no"),
      supabase.from("posts").select("series_no, series_seq_no").not("series_no", "is", null),
    ]);

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
    const entry = seriesMap.get(row.series_no);
    if (entry && (row.series_seq_no ?? 0) > entry.max_seq_no) {
      entry.max_seq_no = row.series_seq_no ?? 0;
    }
  }
  const seriesOptions = Array.from(seriesMap.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        New Post
      </h1>
      <PostForm
        mode="create"
        categories={categories}
        seriesOptions={seriesOptions}
      />
    </div>
  );
}
