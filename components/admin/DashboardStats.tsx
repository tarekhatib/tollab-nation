"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const DashboardChart = dynamic(() => import("./DashboardChart"), { ssr: false });

type Period = "weekly" | "monthly" | "alltime";
type Metric = "articles" | "clicks" | "views";
type Timeframe = "30d" | "1y";

interface PeriodStats {
  articles: number;
  featured: number;
  clicks: number;
  views: number;
}

interface ChartPoint {
  date: string;
  articles: number;
  clicks: number;
  views: number;
}

interface Props {
  weekly: PeriodStats;
  monthly: PeriodStats;
  alltime: PeriodStats;
  chartData30: ChartPoint[];
  chartData1y: ChartPoint[];
  recentArticles: {
    id: number;
    title: string;
    publishedAt: Date;
    category: { name: string };
  }[];
}

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "This Week",
  monthly: "This Month",
  alltime: "All Time",
};

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "30d": "30 Days",
  "1y": "1 Year",
};

export default function DashboardStats({
  weekly,
  monthly,
  alltime,
  chartData30,
  chartData1y,
  recentArticles,
}: Props) {
  const [period, setPeriod] = useState<Period>("monthly");
  const [metric, setMetric] = useState<Metric>("articles");
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");

  const stats = { weekly, monthly, alltime }[period];
  const data = (timeframe === "30d" ? chartData30 : chartData1y) ?? [];
  const isEmpty = data.length === 0 || data.every((d) => d[metric] === 0);

  // Shared Y scale for clicks/views so bars are comparable
  const engagementMax = Math.max(
    ...data.map((d) => d.clicks),
    ...data.map((d) => d.views),
    1
  );
  const yDomain: [number, number] | undefined =
    metric === "clicks" || metric === "views" ? [0, engagementMax] : undefined;

  const timeframeLabel = timeframe === "30d" ? "Last 30 Days" : "Last 12 Months";
  const subtitle = `${metric === "articles" ? "Published" : "By Publication Date"} — ${timeframeLabel}`;

  const statCards = [
    { label: "Articles", value: stats.articles, href: "/admin/articles" },
    { label: "Featured", value: stats.featured, href: "/admin/articles" },
    { label: "Clicks", value: stats.clicks.toLocaleString(), href: "/admin/articles" },
    { label: "Views", value: stats.views.toLocaleString(), href: "/admin/articles" },
  ];

  return (
    <>
      {/* Period tabs + stat cards */}
      <div className="mb-10">
        <div className="flex items-center gap-1 mb-4 bg-surface border border-line rounded-full p-1 w-fit max-w-full overflow-x-auto">
          {(["weekly", "monthly", "alltime"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p
                  ? "bg-ink text-page"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="border-t-[3px] border-line-strong bg-canvas p-5">
              <p className="kicker mb-3 text-ink-muted">
                {stat.label}
              </p>
              <p className="display text-5xl leading-none text-ink tabular-nums">{stat.value}</p>
              <Link href={stat.href} className="mt-3 inline-block text-xs font-semibold text-accent-ink hover:underline">
                View all →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-canvas border border-line mb-10">
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-line flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="kicker text-ink">{metric}</h2>
            <span className="text-sm text-ink-soft">{subtitle}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Metric tabs */}
            <div className="flex items-center gap-1 bg-surface border border-line rounded-full p-0.5">
              {(["articles", "clicks", "views"] as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                    metric === m
                      ? "bg-ink text-page"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {/* Timeframe tabs */}
            <div className="flex items-center gap-1 bg-surface border border-line rounded-full p-0.5">
              {(["30d", "1y"] as Timeframe[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    timeframe === t
                      ? "bg-ink text-page"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {TIMEFRAME_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          {isEmpty ? (
            <p className="text-sm text-ink-muted text-center py-8">No data for this period.</p>
          ) : (
            <DashboardChart data={data} metric={metric} yDomain={yDomain} />
          )}
        </div>
      </div>

      {/* Recent articles */}
      <div className="bg-canvas border border-line">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="kicker text-ink">Recent Articles</h2>
          <Link href="/admin/articles/new" className="text-xs font-medium text-accent hover:underline">
            + New article
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recentArticles.map((article) => (
            <li key={article.id} className="flex items-center justify-between px-6 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{article.title}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {article.category.name} ·{" "}
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Link
                href={`/admin/articles/${article.id}/edit`}
                className="ml-4 shrink-0 text-xs text-ink-soft hover:text-accent transition-colors"
              >
                Edit
              </Link>
            </li>
          ))}
          {recentArticles.length === 0 && (
            <li className="px-6 py-8 text-center text-sm text-ink-soft">
              No articles yet.{" "}
              <Link href="/admin/articles/new" className="text-accent hover:underline">
                Create one
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
