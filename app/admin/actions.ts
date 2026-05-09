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
  open: boolean;
  content: string;
}

async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
}

async function resolveCategory(
  supabase: ReturnType<typeof createAdminClient>,
  categoryNo: number | null,
  categoryName: string,
): Promise<{ no: number | null; error?: string }> {
  if (categoryNo !== null) return { no: categoryNo };
  if (!categoryName) return { no: null };

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: maxRow } = await supabase
      .from("categories")
      .select("category_no")
      .order("category_no", { ascending: false })
      .limit(1)
      .maybeSingle();
    const newNo = (maxRow?.category_no ?? 0) + 1;

    const { error } = await supabase
      .from("categories")
      .insert({ category_no: newNo, category_name: categoryName });
    if (!error) return { no: newNo };
    if (error.code !== "23505") return { no: null, error: error.message };
  }
  return { no: null, error: "Failed to create category" };
}

async function resolveSeries(
  supabase: ReturnType<typeof createAdminClient>,
  seriesNo: number | null,
  seriesName: string,
): Promise<{ no: number | null; error?: string }> {
  if (seriesNo !== null) return { no: seriesNo };
  if (!seriesName) return { no: null };

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: maxRow } = await supabase
      .from("series")
      .select("series_no")
      .order("series_no", { ascending: false })
      .limit(1)
      .maybeSingle();
    const newNo = (maxRow?.series_no ?? 0) + 1;

    const { error } = await supabase
      .from("series")
      .insert({ series_no: newNo, series_name: seriesName });
    if (!error) return { no: newNo };
    if (error.code !== "23505") return { no: null, error: error.message };
  }
  return { no: null, error: "Failed to create series" };
}

export async function createPost(data: PostData) {
  await requireAuth();

  const supabase = createAdminClient();
  const filePath = `${data.slug}/${data.slug}.md`;

  const { error: uploadError } = await supabase.storage
    .from("posts")
    .upload(filePath, data.content, {
      contentType: "text/markdown; charset=utf-8",
      upsert: false,
    });
  if (uploadError) return { error: uploadError.message };

  const category = await resolveCategory(
    supabase,
    data.category_no,
    data.category_name,
  );
  if (category.error) {
    await supabase.storage.from("posts").remove([filePath]);
    return { error: category.error };
  }

  const series = await resolveSeries(
    supabase,
    data.series_no,
    data.series_name,
  );
  if (series.error) {
    await supabase.storage.from("posts").remove([filePath]);
    return { error: series.error };
  }

  const { error: dbError } = await supabase.from("posts").insert({
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    file_path: filePath,
    category_no: category.no,
    series_no: series.no,
    series_seq_no: data.series_seq_no,
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
  await requireAuth();

  const supabase = createAdminClient();
  const newFilePath = `${data.slug}/${data.slug}.md`;
  const slugChanged = oldFilePath !== newFilePath;

  if (slugChanged) {
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(newFilePath, data.content, {
        contentType: "text/markdown; charset=utf-8",
        upsert: true,
      });
    if (uploadError) return { error: uploadError.message };
  } else {
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .update(oldFilePath, data.content, {
        contentType: "text/markdown; charset=utf-8",
      });
    if (uploadError) return { error: uploadError.message };
  }

  const category = await resolveCategory(
    supabase,
    data.category_no,
    data.category_name,
  );
  if (category.error) {
    if (slugChanged) await supabase.storage.from("posts").remove([newFilePath]);
    return { error: category.error };
  }

  const series = await resolveSeries(
    supabase,
    data.series_no,
    data.series_name,
  );
  if (series.error) {
    if (slugChanged) await supabase.storage.from("posts").remove([newFilePath]);
    return { error: series.error };
  }

  const { error: dbError } = await supabase
    .from("posts")
    .update({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      file_path: newFilePath,
      category_no: category.no,
      series_no: series.no,
      series_seq_no: data.series_seq_no,
      open: data.open,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (dbError) {
    if (slugChanged) await supabase.storage.from("posts").remove([newFilePath]);
    return { error: dbError.message };
  }

  if (slugChanged) {
    await supabase.storage.from("posts").remove([oldFilePath]);
  }

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
  await requireAuth();

  const supabase = createAdminClient();

  const { error: dbError } = await supabase
    .from("posts")
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
  await requireAuth();

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: "이미지 파일만 업로드 가능합니다. (jpg, png, webp, gif)" };
  if (file.size > 5 * 1024 * 1024)
    return { error: "파일 크기는 5MB 이하여야 합니다." };

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() ?? "bin";
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

export async function renameCategory(categoryNo: number, newName: string) {
  await requireAuth();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categories")
    .update({ category_name: newName })
    .eq("category_no", categoryNo);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(categoryNo: number) {
  await requireAuth();

  const supabase = createAdminClient();

  await supabase
    .from("posts")
    .update({ category_no: null })
    .eq("category_no", categoryNo);

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("category_no", categoryNo);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function renameSeries(seriesNo: number, newName: string) {
  await requireAuth();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("series")
    .update({ series_name: newName })
    .eq("series_no", seriesNo);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/series");
  return { success: true };
}

export async function deleteSeries(seriesNo: number) {
  await requireAuth();

  const supabase = createAdminClient();

  await supabase
    .from("posts")
    .update({ series_no: null, series_seq_no: null })
    .eq("series_no", seriesNo);

  const { error } = await supabase
    .from("series")
    .delete()
    .eq("series_no", seriesNo);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/series");
  return { success: true };
}

export async function updateSeriesOrder(
  updates: { id: string; series_seq_no: number }[],
) {
  await requireAuth();

  const supabase = createAdminClient();

  const results = await Promise.all(
    updates.map(({ id, series_seq_no }) =>
      supabase.from("posts").update({ series_seq_no }).eq("id", id),
    ),
  );

  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { error: firstError.error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/series");
  return { success: true };
}
