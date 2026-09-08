"use client";

import { useEffect, useState, useContext } from "react";
import { 
  FolderGit2, 
  FileText, 
  Coins, 
  Crown, 
  PieChart as PieIcon, 
  Activity,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { UserDetailContext } from "@/context/userDetailContext";

type ReportData = {
  totalRepositories: number;
  totalTestCases: number;
  credits: number;
  plan: string;
};

export default function Report() {
  const { userDetails } = useContext(UserDetailContext);
  const userId = userDetails?.id;
  
  const [report, setReport] = useState<ReportData>({
    totalRepositories: 0,
    totalTestCases: 0,
    credits: 0,
    plan: "Free",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const getReport = async () => {
      try {
        const res = await fetch(`/api/users/report?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    getReport();
  }, [userId]);

  // --- DYNAMIC DATA GENERATION ---
  const distributionData = [
    { name: "Repositories", value: report.totalRepositories || 0, color: "#3b82f6" },
    { name: "Test Cases", value: report.totalTestCases || 0, color: "#10b981" },
  ];

  const maxCredits = report.plan.toLowerCase() === "free" ? 1000 : 10000;
  const creditsUsed = Math.max(0, maxCredits - report.credits);
  const usePercentage = Math.min(100, Math.round((creditsUsed / maxCredits) * 100));

  const creditRingData = [
    { name: "Credits Used", value: creditsUsed, color: "#ef4444" },
    { name: "Remaining Credits", value: report.credits, color: "#f59e0b" },
  ];

  // Loading Skeleton Layout
  if (loading) {
    return (
      <div className="min-h-screen p-6 sm:p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="h-8 w-60 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase self-start">
            <BarChart3 className="w-3.5 h-3.5" />
            Live Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Analytics & Reports
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Real-time performance indicators and operational metrics calculated from your workspace activities.
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Repositories */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Connected Repos</span>
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-2.5 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60">
                <FolderGit2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {report.totalRepositories}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>
          </div>

          {/* Test Cases */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Generated Tests</span>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {report.totalTestCases}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Live
              </span>
            </div>
          </div>

          {/* Credits */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Remaining Credits</span>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 p-2.5 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60">
                <Coins className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {report.credits}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ {maxCredits}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${100 - usePercentage}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Subscription Tier</span>
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 transition-colors group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60">
                <Crown className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300 capitalize">
                {report.plan}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Plan</span>
            </div>
          </div>
        </div>

        {/* Live Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Chart 1: Proportional Asset Balance */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Asset Distribution Balance</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ratio tracking total test layers built vs connected repositories.</p>
            </div>
            
            <div className="h-56 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="stroke-white dark:stroke-slate-900 outline-none" 
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0f172a", 
                      borderRadius: "12px", 
                      color: "#fff", 
                      border: "none", 
                      fontSize: "12px" 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Central Label */}
              <div className="absolute text-center">
                <span className="block text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {report.totalRepositories + report.totalTestCases}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Total Assets</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-300">Repos ({report.totalRepositories})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Test Cases ({report.totalTestCases})</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Credit Ring Gauge */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Credit Allocations</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Proportional breakdown of consumed usage vs remaining balance.</p>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditRingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {creditRingData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="stroke-white dark:stroke-slate-900 outline-none" 
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0f172a", 
                      borderRadius: "12px", 
                      color: "#fff", 
                      border: "none", 
                      fontSize: "12px" 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Circle Label */}
              <div className="absolute text-center">
                <span className="block text-2xl font-extrabold text-slate-900 dark:text-slate-100">{100 - usePercentage}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Remaining</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-xs font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">Available ({report.credits})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-slate-600 dark:text-slate-300">Used ({creditsUsed})</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Summary Info Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
            Account Summary Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="pt-4 sm:pt-0 sm:pl-4 first:pl-0">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Repositories Connected</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{report.totalRepositories}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Generated Tests</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{report.totalTestCases}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Credits</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{report.credits}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subscription Structure</p>
              <p className="mt-1 text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">{report.plan} Membership</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}