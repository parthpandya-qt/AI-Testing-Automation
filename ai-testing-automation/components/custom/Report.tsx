"use client";

import { useEffect, useState, useContext } from "react";
import { 
  FolderGit2, 
  FileText, 
  Coins, 
  Crown, 
  PieChart as PieIcon, 
  Activity 
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

  // --- DYNAMIC DATA GENERATION BASED ON LIVE STATE ---
  
  // 1. Asset Distribution Data (Pie Chart)
  const distributionData = [
    { name: "Repositories", value: report.totalRepositories || 0, color: "#3b82f6" },
    { name: "Test Cases", value: report.totalTestCases || 0, color: "#10b981" },
  ];

  // 2. Credit Capacity Progress Ring Data (Fixed Radial logic using Nested Pie)
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
      <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-10 w-52 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl border border-slate-100" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-slate-200 rounded-2xl border border-slate-100" />
          <div className="h-80 bg-slate-200 rounded-2xl border border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 sm:p-8 text-slate-900 antialiased selection:bg-blue-500/10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Analytics Report
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
            Real-time operational framework calculated from your active workspace metrics.
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Repositories */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Connected Repos</span>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-100">
                <FolderGit2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-slate-800">{report.totalRepositories}</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Active
              </span>
            </div>
          </div>

          {/* Test Cases */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Test Cases</span>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-slate-800">{report.totalTestCases}</span>
            </div>
          </div>

          {/* Credits */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Available Credits</span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 transition-colors group-hover:bg-amber-100">
                <Coins className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-800">{report.credits}</span>
                <span className="text-xs font-medium text-slate-400">/ {maxCredits}</span>
              </div>
              {/* Mini visual status bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${100 - usePercentage}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Current Tier</span>
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 transition-colors group-hover:bg-purple-100">
                <Crown className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 capitalize">
                {report.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Live Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Chart 1: Proportional Asset Balance Donut/Pie */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-800">Asset Distribution Balance</h2>
              </div>
              <p className="text-xs text-slate-400">Ratio tracking total test layers built vs connected code repositories.</p>
            </div>
            
            <div className="h-56 w-full relative flex items-center justify-center my-2 ">
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
                      <Cell key={`cell-${index}`} fill={entry.color} className="stroke-white outline-none" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none", fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Absolute Central Readout Label */}
              <div className="absolute text-center">
                <span className="block text-2xl font-bold text-slate-700">
                  {report.totalRepositories + report.totalTestCases}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Assets</span>
              </div>
            </div>

            {/* Clean Legend System */}
            <div className="flex justify-center gap-6 text-xs font-semibold border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">Repos ({report.totalRepositories})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Test Cases ({report.totalTestCases})</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Clean Concentric Credit Ring Gauge */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-800">Credit Allocations</h2>
              </div>
              <p className="text-xs text-slate-400">A proportional look at consumed limits vs outstanding balance allocations.</p>
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
                      <Cell key={`cell-${index}`} fill={entry.color} className="stroke-white outline-none" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none", fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Circle Label representing dynamic state */}
              <div className="absolute text-center">
                <span className="block text-2xl font-bold text-slate-700">{100 - usePercentage}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Remaining</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-xs font-semibold border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Available ({report.credits})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-slate-600">Burned ({creditsUsed})</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Summary Info Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">Account Summary Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="pt-4 sm:pt-0 sm:pl-4 first:pl-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Repositories Connected</p>
              <p className="mt-1 text-lg font-bold text-slate-700">{report.totalRepositories}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Generated Tests</p>
              <p className="mt-1 text-lg font-bold text-slate-700">{report.totalTestCases}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining Credits</p>
              <p className="mt-1 text-lg font-bold text-slate-700">{report.credits}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subscription Structure</p>
              <p className="mt-1 text-lg font-bold text-purple-600 capitalize">{report.plan} Membership</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}