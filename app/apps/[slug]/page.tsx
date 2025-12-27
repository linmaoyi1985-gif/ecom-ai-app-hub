import { getAppBySlug } from "@/lib/registry";
import { notFound } from "next/navigation";
import Link from "next/link";
import AsinKeywordsApp from "@/apps/asin-keywords/App";

const appComponents: Record<string, React.ComponentType> = {
  "asin-keywords": AsinKeywordsApp,
};

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const AppComponent = appComponents[slug];

  if (!AppComponent) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 返回首页
          </Link>
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-2">{app.title}</h1>
            <p className="text-gray-600">应用尚未实现</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← 返回首页
        </Link>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">{app.title}</h1>
          <p className="text-gray-600 mb-6">{app.description}</p>
          <AppComponent />
        </div>
      </div>
    </div>
  );
}
