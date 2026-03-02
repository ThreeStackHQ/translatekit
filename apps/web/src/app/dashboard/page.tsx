import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">🌐 TranslateKit</span>
          </div>
          <span className="text-sm text-gray-500">{session.user.email}</span>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">
          Welcome to TranslateKit. Your projects and translation stats will appear here.
        </p>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Projects", value: "0", hint: "Create your first project" },
            { label: "Languages", value: "0", hint: "Add languages to translate" },
            { label: "Keys translated", value: "0", hint: "Upload a locale JSON to start" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-indigo-600">{card.value}</p>
              <p className="mt-1 text-xs text-gray-400">{card.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
