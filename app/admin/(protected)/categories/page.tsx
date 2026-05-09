import { createAdminClient } from "@/utils/supabase/admin";
import CategoryManager, {
  type CategoryInfo,
} from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = createAdminClient();

  const [{ data: categoryRows }, { data: postRows }] = await Promise.all([
    supabase.from("categories").select("category_no, category_name").order("category_no"),
    supabase.from("posts").select("category_no").not("category_no", "is", null),
  ]);

  const countMap = new Map<number, number>();
  for (const row of postRows ?? []) {
    if (row.category_no == null) continue;
    countMap.set(row.category_no, (countMap.get(row.category_no) ?? 0) + 1);
  }

  const categories: CategoryInfo[] = (categoryRows ?? []).map((c) => ({
    category_no: c.category_no,
    category_name: c.category_name,
    post_count: countMap.get(c.category_no) ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Categories
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          포스트에서 카테고리를 지정하면 여기에 나타납니다
        </p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
