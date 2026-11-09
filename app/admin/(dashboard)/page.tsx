import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/DashboardStats";

async function getDashboardData() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const [
    allTimeArticles,
    allTimeFeatured,
    allTimeAgg,
    weeklyArticles,
    weeklyAgg,
    monthlyArticles,
    monthlyAgg,
    recentArticles,
  ] = await prisma.$transaction([
    prisma.article.count({ where: { isDraft: false } }),
    prisma.article.count({ where: { isFeatured: true, isDraft: false } }),
    prisma.article.aggregate({ _sum: { views: true, clicks: true } }),

    prisma.article.count({ where: { isDraft: false, publishedAt: { gte: sevenDaysAgo } } }),
    prisma.article.aggregate({
      where: { isDraft: false, publishedAt: { gte: sevenDaysAgo } },
      _sum: { views: true, clicks: true },
    }),

    prisma.article.count({ where: { isDraft: false, publishedAt: { gte: thirtyDaysAgo } } }),
    prisma.article.aggregate({
      where: { isDraft: false, publishedAt: { gte: thirtyDaysAgo } },
      _sum: { views: true, clicks: true },
    }),

    prisma.article.findMany({
      where: { isDraft: false },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
  ]);

  const [weeklyFeatured, monthlyFeatured, allArticlesRaw] = await Promise.all([
    prisma.article.count({
      where: { isDraft: false, isFeatured: true, publishedAt: { gte: sevenDaysAgo } },
    }),
    prisma.article.count({
      where: { isDraft: false, isFeatured: true, publishedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.article.findMany({
      where: { isDraft: false },
      select: { publishedAt: true, clicks: true, views: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  // --- Build chart data ---

  // 30-day x-axis (daily buckets, fixed)
  function make30dBuckets() {
    const map = new Map<string, { articles: number; clicks: number; views: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      map.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), { articles: 0, clicks: 0, views: 0 });
    }
    return map;
  }

  // 1-year x-axis (monthly buckets, fixed)
  function make1yBuckets() {
    const map = new Map<string, { articles: number; clicks: number; views: number }>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      map.set(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), { articles: 0, clicks: 0, views: 0 });
    }
    return map;
  }

  const map30 = make30dBuckets();
  const map1y = make1yBuckets();

  for (const { publishedAt, clicks, views } of allArticlesRaw) {
    const date = new Date(publishedAt);

    // 30d bucket key
    const key30 = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const e30 = map30.get(key30);
    if (e30) { e30.articles += 1; e30.clicks += clicks; e30.views += views; }

    // 1y bucket key (only include if within last 365 days)
    if (date >= oneYearAgo) {
      const key1y = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const e1y = map1y.get(key1y);
      if (e1y) { e1y.articles += 1; e1y.clicks += clicks; e1y.views += views; }
    }
  }

  const chartData30 = Array.from(map30.entries()).map(([date, v]) => ({ date, ...v }));
  const chartData1y = Array.from(map1y.entries()).map(([date, v]) => ({ date, ...v }));

  return {
    alltime: {
      articles: allTimeArticles,
      featured: allTimeFeatured,
      clicks: allTimeAgg._sum?.clicks ?? 0,
      views: allTimeAgg._sum?.views ?? 0,
    },
    weekly: {
      articles: weeklyArticles,
      featured: weeklyFeatured,
      clicks: weeklyAgg._sum?.clicks ?? 0,
      views: weeklyAgg._sum?.views ?? 0,
    },
    monthly: {
      articles: monthlyArticles,
      featured: monthlyFeatured,
      clicks: monthlyAgg._sum?.clicks ?? 0,
      views: monthlyAgg._sum?.views ?? 0,
    },
    chartData30,
    chartData1y,
    recentArticles,
  };
}

export default async function AdminDashboard() {
  const { alltime, weekly, monthly, chartData30, chartData1y, recentArticles } = await getDashboardData();

  return (
    <div>
      <div className="mb-8 border-b-[3px] border-line-strong pb-5">
        <h1 className="display text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Dashboard</h1>
        <p className="mt-3 text-sm text-ink-muted">Welcome back, Admin</p>
      </div>

      <DashboardStats
        alltime={alltime}
        weekly={weekly}
        monthly={monthly}
        chartData30={chartData30}
        chartData1y={chartData1y}
        recentArticles={recentArticles}
      />
    </div>
  );
}
