import { auth, signOut } from "@/auth";
import { getAppsByCategory } from "@/lib/registry";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const appsByCategory = getAppsByCategory();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Ecom AI App Hub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session?.user?.name || session?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                退出
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            欢迎使用跨境电商AI工具集合
          </h2>
          <p className="text-gray-600">选择下方的应用开始使用</p>
        </div>

        {Object.entries(appsByCategory).map(([category, apps]) => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <Link
                  key={app.slug}
                  href={`/apps/${app.slug}`}
                  className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {app.title}
                  </h4>
                  <p className="text-sm text-gray-600">{app.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(appsByCategory).length === 0 && (
          <div className="text-center text-gray-500 py-12">
            暂无可用应用
          </div>
        )}
      </main>
    </div>
  );
}
