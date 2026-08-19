import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#0B132B] flex flex-col md:flex-row">
      {/* Sidebar / Navigation Component */}
      <AdminNav user={session} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
