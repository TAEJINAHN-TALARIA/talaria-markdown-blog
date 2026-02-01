import { createClient as createStaticClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import matter from "gray-matter";
import PostNavigation from "@/components/PostNavigation";
import ZoomableImage from "@/components/ZoomableImage";
import remarkUnwrapImages from "remark-unwrap-images";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const STORAGE_BUCKET_NAME = "posts";

export const revalidate = 60;

// [추가] 빌드 시에 미리 모든 정적 페이지 경로를 생성합니다.
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  // [수정 포인트] 환경 변수가 없는 경우 에러를 던지거나 빈 배열 반환
  // 이렇게 하면 "supabaseKey is required" 같은 라이브러리 내부 오류를 방지하고
  // 명확하게 무엇이 문제인지 알 수 있습니다.
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "환경 변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 ANON_KEY가 없습니다.",
    );
    return [];
  }

  // 안전하게 확인된 문자열 변수를 넣습니다.
  const supabase = createStaticClient(supabaseUrl, supabaseKey);

  // 전체 포스트의 slug만 가져옵니다.
  const { data: posts } = await supabase.from("posts").select("slug");

  return (posts || []).map((post) => ({
    postId: post.slug,
  }));
}

function getPublicSupabase() {
  return createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
}

// [추가] 동적으로 메타데이터(제목, 설명, OG 이미지 등)를 생성합니다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const supabase = getPublicSupabase();

  const { data: post } = await supabase
    .from("posts")
    .select("title, description") // 필요한 필드만 조회
    .eq("slug", postId)
    .single();

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description || `${post.title} - 블로그 글`,
    openGraph: {
      title: post.title,
      description: post.description || "",
      // images: [post.thumbnail_url], // 썸네일이 있다면 추가
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const supabase = getPublicSupabase();

  // 1. DB 조회
  const { data: post, error: dbError } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", postId)
    .single();

  if (dbError || !post) {
    return notFound();
  }

  // 2. 마크다운 파일 다운로드
  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .getPublicUrl(post.file_path);

  const fileUrl = publicUrlData.publicUrl;

  const response = await fetch(fileUrl);
  if (!response.ok) return <div>파일 로딩 실패</div>;

  const rawContent = await response.text();
  const { content } = matter(rawContent);

  const folderPath = post.file_path.split("/").slice(0, -1).join("/");

  const { data: folderPublicData } = supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .getPublicUrl(folderPath);

  const imageBaseUrl = folderPublicData.publicUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://talaria-markdown-blog.vercel.app/posts/${postId}`,
    },
    author: {
      "@type": "Person",
      name: "Talaria", // 본인 이름이나 닉네임으로 변경
    },
  };

  return (
    <main className="max-w-4xl mx-auto p-6 md:py-12 bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostNavigation />

      <header className="mb-10 border-b border-gray-200 pb-6">
        {/* 제목 사이즈: 모바일 4xl -> 데스크탑 5xl */}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        {/* 날짜나 카테고리 정보 등을 여기에 추가하면 더 좋습니다 */}
      </header>

      <article
        className="prose prose-blue max-w-none
        prose-img:rounded-xl prose-headings:scroll-mt-20
        md:prose-lg"
      >
        <ReactMarkdown
          // [추가] remarkPlugins 속성에 플러그인 추가
          remarkPlugins={[remarkGfm, remarkUnwrapImages]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus} // VS Code 스타일 테마
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ ...props }) => (
              <h2
                className="text-3xl font-bold mt-10 mb-4 text-gray-900 border-b pb-2"
                {...props}
              />
            ),

            // 2. 마크다운의 H2(##) -> 실제로는 H3로 렌더링
            h2: ({ ...props }) => (
              <h3
                className="text-2xl font-semibold mt-8 mb-3 text-gray-800"
                {...props}
              />
            ),
            // 3. 마크다운의 H3(###) -> 실제로는 H4로 렌더링
            h3: ({ ...props }) => (
              <h4
                className="text-xl font-medium mt-6 mb-2 text-gray-800"
                {...props}
              />
            ),
            img: (image) => {
              // [수정 1] src가 string인지 명확히 확인합니다.
              // image.src가 없거나 문자열이 아니면 빈 문자열("")로 처리하여 오류 방지
              const originalSrc =
                typeof image.src === "string" ? image.src : "";

              let src = originalSrc;

              // [수정 2] 이제 src는 무조건 string이므로 startsWith를 안전하게 사용 가능
              // 외부 링크(http)가 아니고, 내용이 있는 경우에만 스토리지 URL 연결
              if (src.length > 0 && !src.startsWith("http")) {
                const cleanSrc = src.replace(/^\.\//, "");
                src = `${imageBaseUrl}/${cleanSrc}`;
              }

              // [수정 3] alt 속성도 안전하게 처리 (없을 경우 빈 문자열)
              const altText = typeof image.alt === "string" ? image.alt : "";

              return <ZoomableImage src={src} alt={altText} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
