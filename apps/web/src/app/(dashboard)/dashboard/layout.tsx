import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#111111] text-white">
      <DashboardSidebar userEmail={session.user.email} />
      <main className="flex-1 min-w-0 lg:ml-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
