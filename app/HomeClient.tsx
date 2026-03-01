"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  LucideHome,
  Search,
  ArrowUpDown,
  FilterX,
} from "lucide-react";
import SidebarSection from "@/components/SidebarSection";
import { BlogPost } from "@/types";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 사이드바 섹션 컴포넌트

export default function HomeClient({
  initialPosts,
}: {
  initialPosts: BlogPost[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const currentCategory = searchParams.get("category");
  const currentSeries = searchParams.get("series");
  const currentSearchTerm = searchParams.get("q") || "";
  const currentSortOrder =
    (searchParams.get("sort") as "asc" | "desc") || "desc";

  const [searchInput, setSearchInput] = useState(currentSearchTerm);
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // 데이터 가공 로직 (기존 유지 + Set 최적화)
  const categories = useMemo(() => {
    const allCategories = initialPosts
      .map((p) => p.category_name)
      .filter((category): category is string => Boolean(category));
    return Array.from(new Set(allCategories));
  }, [initialPosts]);

  const seriesList = useMemo(() => {
    const allSeries = initialPosts
      .map((p) => p.series_name)
      .filter((series): series is string => Boolean(series));
    return Array.from(new Set(allSeries));
  }, [initialPosts]);

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...initialPosts];

    if (currentSearchTerm) {
      result = result.filter(
        (p) =>
          (p.title ?? "")
            .toLowerCase()
            .includes(currentSearchTerm.toLowerCase()) ||
          (p.description &&
            p.description
              .toLowerCase()
              .includes(currentSearchTerm.toLowerCase())),
      );
    }
    if (currentCategory)
      result = result.filter((p) => p.category_name === currentCategory);
    if (currentSeries)
      result = result.filter((p) => p.series_name === currentSeries);

    result.sort((a, b) => {
      if (currentSeries) return (a.series_seq_no ?? 0) - (b.series_seq_no ?? 0);
      if (currentSortOrder === "desc")
        return b.created_at.localeCompare(a.created_at);
      else return a.created_at.localeCompare(b.created_at);
    });

    return result;
  }, [
    initialPosts,
    currentSearchTerm,
    currentCategory,
    currentSeries,
    currentSortOrder,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q: searchInput });
    setIsOpenMenu(false); // 모바일에서만 메뉴 닫기 동작
  };

  const toggleSort = () => {
    const newOrder = currentSortOrder === "desc" ? "asc" : "desc";
    updateQueryParams({ sort: newOrder });
  };

  const handleCategoryClick = (category: string) => {
    updateQueryParams(
      currentCategory === category
        ? { category: null }
        : { category: category, series: null },
    );
    setIsOpenMenu(false);
  };

  const handleSeriesClick = (series: string) => {
    updateQueryParams(
      currentSeries === series
        ? { series: null }
        : { series: series, category: null },
    );
    setIsOpenMenu(false);
  };

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const toggleMenu = () => setIsOpenMenu((prev) => !prev);
  const isFiltering = currentSearchTerm || currentCategory || currentSeries;

  return (
    // [구조 변경] flex-col(모바일) -> md:flex-row(데스크탑)
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* 1. 사이드바 (Nav + Filters) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-gray-100 border-r border-gray-200 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out
          ${isOpenMenu ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:block md:h-screen md:sticky md:top-0
          scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LucideHome className="w-5 h-5" /> Talaria
          </h2>
          {/* 모바일 닫기 버튼 (데스크탑에선 숨김) */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 검색창 */}
        <form onSubmit={handleSearchSubmit} className="mb-6 relative">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none text-sm"
            type="text"
            placeholder="Search..."
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Search className="text-gray-400 w-5 h-5 hover:text-blue-500" />
          </button>
        </form>

        {/* 카테고리 & 시리즈 리스트 */}
        <div className="space-y-2">
          <SidebarSection title="Categories">
            <ul className="space-y-2 text-sm">
              {categories.map((cat, i) => (
                <li
                  key={i}
                  onClick={() => handleCategoryClick(cat)}
                  className={`cursor-pointer px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors flex justify-between items-center
                    ${currentCategory === cat ? "text-blue-600 font-bold bg-blue-50" : "text-gray-600"}`}
                >
                  <span>{cat}</span>
                  {currentCategory === cat && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </li>
              ))}
            </ul>
          </SidebarSection>

          <SidebarSection title="Series">
            <ul className="space-y-2 text-sm">
              {seriesList.map((series, i) => (
                <li
                  key={i}
                  onClick={() => handleSeriesClick(series)}
                  className={`cursor-pointer px-2 py-1 rounded hover:bg-purple-50 hover:text-purple-600 transition-colors flex justify-between items-center
                    ${currentSeries === series ? "text-purple-600 font-bold bg-purple-50" : "text-gray-600"}`}
                >
                  <span>{series}</span>
                  {currentSeries === series && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  )}
                </li>
              ))}
            </ul>
          </SidebarSection>
        </div>
      </aside>

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
        {/* 모바일 헤더 (햄버거 메뉴) - 데스크탑에선 숨김 */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <button
            onClick={toggleMenu}
            className="p-2 -ml-2 hover:bg-gray-200 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="font-bold text-gray-700"></span>
          <button onClick={clearFilters}>
            <LucideHome className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* 상단 툴바 (정렬, 필터 태그) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            {isFiltering && (
              <>
                {currentCategory && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    Category: {currentCategory}
                  </span>
                )}
                {currentSeries && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    Series: {currentSeries}
                  </span>
                )}
                {currentSearchTerm && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-semibold">
                    Search: {currentSearchTerm}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 ml-2"
                >
                  <FilterX className="w-3 h-3" /> Reset
                </button>
              </>
            )}
            {!isFiltering && (
              <h1 className="text-2xl font-bold text-gray-800">Recent Posts</h1>
            )}
          </div>

          {!currentSeries && (
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {currentSortOrder === "desc" ? "Latest First" : "Oldest First"}
            </button>
          )}
        </div>

        {/* [그리드 레이아웃] 모바일 1열 -> 태블릿 2열 -> 데스크탑 3열 */}
        <div
          className={`
            grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
            transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}
        `}
        >
          {filteredAndSortedPosts.length > 0 ? (
            filteredAndSortedPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                      {formatDate(post.created_at)}
                    </span>
                    {post.series_name && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                        {post.series_name} #{post.series_seq_no}
                      </span>
                    )}
                  </div>

                  <Link href={`/posts/${post.slug}`} className="block group">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                    {post.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {post.category_name}
                    </span>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                검색 결과가 없습니다.
              </h3>
              <p className="text-gray-500 mt-1">
                다른 검색어나 카테고리를 선택해보세요.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 모바일에서 메뉴 열렸을 때 배경 어둡게 처리 (Overlay) */}
      {isOpenMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpenMenu(false)}
        />
      )}
    </div>
  );
}
