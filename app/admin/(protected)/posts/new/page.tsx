import { createAdminClient } from "@/utils/supabase/admin";
import PostForm, {
  type CategoryOption,
  type SeriesOption,
} from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("meta_info")
    .select("category_no, category_name, series_no, series_name, series_seq_no")
    .or("category_no.not.is.null,series_no.not.is.null");

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
      const seq = row.series_seq_no ?? 0;
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
