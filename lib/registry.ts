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
  {
    slug: "asin-copywriter",
    title: "ASIN体检&改稿包",
    category: "亚马逊工具",
    description: "US站ASIN一键生成Listing优化改稿包：标题、五点、描述、A+、图片脚本、FAQ等",
  },
  {
    slug: "brand-models",
    title: "品牌主机型号查询",
    category: "产品分析工具",
    description: "根据空气净化器品牌查询滤芯及主机型号适配关系",
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
