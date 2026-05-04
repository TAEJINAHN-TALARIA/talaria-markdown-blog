import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav email={user.email ?? ""} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
