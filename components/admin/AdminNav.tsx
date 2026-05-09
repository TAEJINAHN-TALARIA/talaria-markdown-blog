"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  function linkClass(href: string) {
    const isActive =
      href === "/admin"
        ? pathname === href
        : pathname === href || pathname.startsWith(href + "/");
    return `text-sm transition-colors ${
      isActive
        ? "text-blue-600 dark:text-blue-400 font-semibold"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }`;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Admin
          </Link>
          <Link href="/admin/posts/new" className={linkClass("/admin/posts/new")}>
            + New Post
          </Link>
          <Link href="/admin/categories" className={linkClass("/admin/categories")}>
            Categories
          </Link>
          <Link href="/admin/series" className={linkClass("/admin/series")}>
            Series
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            View Blog
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            {email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
