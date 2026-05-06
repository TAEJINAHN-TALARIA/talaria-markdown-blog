import { createAdminClient } from "@/utils/supabase/admin";
import CategoryManager, {
  type CategoryInfo,
} from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("meta_info")
    .select("category_no, category_name")
    .not("category_no", "is", null);

  const categoryMap = new Map<number, CategoryInfo>();
  for (const post of posts ?? []) {
    if (post.category_no == null) continue;
    if (!categoryMap.has(post.category_no)) {
      categoryMap.set(post.category_no, {
        category_no: post.category_no,
        category_name: post.category_name ?? String(post.category_no),
        post_count: 0,
      });
    }
    categoryMap.get(post.category_no)!.post_count += 1;
  }

  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => a.category_no - b.category_no,
  );

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
