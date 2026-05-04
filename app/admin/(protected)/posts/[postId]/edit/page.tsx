import { notFound } from "next/navigation";
import matter from "gray-matter";
import { createAdminClient } from "@/utils/supabase/admin";
import PostForm from "@/components/admin/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = createAdminClient();

  const { data: post, error } = await supabase
    .from("meta_info")
    .select("*")
    .eq("slug", postId)
    .single();

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Edit Post
      </h1>
      <PostForm post={{ ...post, content }} mode="edit" />
    </div>
  );
}
