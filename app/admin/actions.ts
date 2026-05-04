"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface PostData {
  title: string;
  slug: string;
  description: string;
  category_name: string;
  category_no: number | null;
  series_name: string;
  series_no: number | null;
  series_seq_no: number | null;
  thumbnail_url: string;
  open: boolean;
  content: string;
}

export async function createPost(data: PostData) {
  const supabase = createAdminClient();
  const filePath = `${data.slug}/${data.slug}.md`;

  const { error: uploadError } = await supabase.storage
    .from("posts")
    .upload(filePath, data.content, {
      contentType: "text/markdown; charset=utf-8",
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabase.from("meta_info").insert({
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    file_path: filePath,
    category_name: data.category_name || null,
    category_no: data.category_no,
    series_name: data.series_name || null,
    series_no: data.series_no,
    series_seq_no: data.series_seq_no,
    thumbnail_url: data.thumbnail_url || null,
    open: data.open,
  });

  if (dbError) {
    await supabase.storage.from("posts").remove([filePath]);
    return { error: dbError.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function updatePost(
  postId: string,
  data: PostData,
  oldFilePath: string,
) {
  const supabase = createAdminClient();
  const newFilePath = `${data.slug}/${data.slug}.md`;

  if (oldFilePath !== newFilePath) {
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(newFilePath, data.content, {
        contentType: "text/markdown; charset=utf-8",
        upsert: true,
      });
    if (uploadError) return { error: uploadError.message };
    await supabase.storage.from("posts").remove([oldFilePath]);
  } else {
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .update(oldFilePath, data.content, {
        contentType: "text/markdown; charset=utf-8",
      });
    if (uploadError) return { error: uploadError.message };
  }

  const { error: dbError } = await supabase
    .from("meta_info")
    .update({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      file_path: newFilePath,
      category_name: data.category_name || null,
      category_no: data.category_no,
      series_name: data.series_name || null,
      series_no: data.series_no,
      series_seq_no: data.series_seq_no,
      thumbnail_url: data.thumbnail_url || null,
      open: data.open,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (dbError) return { error: dbError.message };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/posts/${data.slug}`);
  return { success: true };
}

export async function deletePost(
  postId: string,
  filePath: string,
  slug: string,
) {
  const supabase = createAdminClient();

  const { error: dbError } = await supabase
    .from("meta_info")
    .delete()
    .eq("id", postId);

  if (dbError) return { error: dbError.message };

  await supabase.storage.from("posts").remove([filePath]);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/posts/${slug}`);
  return { success: true };
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop();
  const fileName = `images/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("posts")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from("posts")
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl };
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/admin/login");
}
