import { Suspense } from "react";
import GetPostInfo from "@/app/getPostInfo";
import HomeClient from "@/app/HomeClient";

export default async function Page() {
  const posts = (await GetPostInfo()) || [];
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient initialPosts={posts} />
    </Suspense>
  );
}
