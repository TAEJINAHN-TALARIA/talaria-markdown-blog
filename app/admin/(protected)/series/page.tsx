import { createAdminClient } from "@/utils/supabase/admin";
import SeriesManager, {
  type SeriesInfo,
} from "@/components/admin/SeriesManager";
import { BlogPost } from "@/types";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("meta_info")
    .select("*")
    .not("series_no", "is", null)
    .order("series_seq_no", { ascending: true });

  const seriesMap = new Map<number, SeriesInfo>();
  for (const post of (posts ?? []) as BlogPost[]) {
    if (post.series_no == null) continue;
    if (!seriesMap.has(post.series_no)) {
      seriesMap.set(post.series_no, {
        series_no: post.series_no,
        series_name: post.series_name ?? String(post.series_no),
        posts: [],
      });
    }
    seriesMap.get(post.series_no)!.posts.push(post);
  }

  const seriesList = Array.from(seriesMap.values()).sort(
    (a, b) => a.series_no - b.series_no,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Series
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          포스트에서 시리즈를 지정하면 여기에 나타납니다
        </p>
      </div>
      <SeriesManager initialSeries={seriesList} />
    </div>
  );
}
