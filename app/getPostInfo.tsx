import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function GetPostInfo() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: postInfo, error } = await supabase
      .from("meta_info")
      .select("*") // 명시적으로 선택
      .order("created_at", { ascending: false }); // DB 레벨에서 기본 정렬 추천

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return postInfo;
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}
