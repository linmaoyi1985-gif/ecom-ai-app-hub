export interface AppInfo {
  slug: string;
  title: string;
  category: string;
  description: string;
}

export const allApps: AppInfo[] = [
  {
    slug: "asin-keywords",
    title: "ASIN关键词分析",
    category: "亚马逊工具",
    description: "输入ASIN获取关键词分析",
  },
];

export function getAppBySlug(slug: string): AppInfo | undefined {
  return allApps.find((app) => app.slug === slug);
}

export function getAppsByCategory(): Record<string, AppInfo[]> {
  return allApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, AppInfo[]>);
}
