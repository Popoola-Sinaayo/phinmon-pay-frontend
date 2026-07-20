"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = ["#107a4c", "#0e6340", "#34a873", "#6bc493", "#a8e4bf", "#d4a017", "#c45c26"];

type DayPoint = { date: string; count: number; amount?: number };
type Breakdown = { label: string; count: number };

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-subtle">
      <h3 className="font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      <div className="mt-4 h-64 w-full">{children}</div>
    </div>
  );
}

function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function AdminInsightsCharts({
  signupsByDay,
  transactionsByDay,
  usersByStatus,
  usersByRole,
  surveysByStatus,
  verification,
}: {
  signupsByDay: DayPoint[];
  transactionsByDay: DayPoint[];
  usersByStatus: Breakdown[];
  usersByRole: Breakdown[];
  surveysByStatus: Breakdown[];
  verification?: {
    ninVerified: number;
    ninUnverified: number;
    livenessVerified: number;
    pendingVerification: number;
  };
}) {
  const verificationSafe = verification ?? {
    ninVerified: 0,
    ninUnverified: 0,
    livenessVerified: 0,
    pendingVerification: 0,
  };
  const verificationPie = [
    { label: "NIN verified", count: verificationSafe.ninVerified },
    { label: "Unverified", count: verificationSafe.ninUnverified },
  ].filter((d) => d.count > 0);

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      <ChartCard title="New signups" subtitle="Last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={signupsByDay ?? []}>
            <defs>
              <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#107a4c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#107a4c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 11, fill: "#5c6370" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5c6370" }} width={32} />
            <Tooltip
              labelFormatter={(v) => shortDate(String(v))}
              contentStyle={{ borderRadius: 12, borderColor: "#e8ebe6" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Signups"
              stroke="#107a4c"
              fill="url(#signupFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Completed transaction volume" subtitle="Last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={transactionsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 11, fill: "#5c6370" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#5c6370" }}
              width={56}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip
              labelFormatter={(v) => shortDate(String(v))}
              formatter={(value: number) => [formatCurrency(value), "Volume"]}
              contentStyle={{ borderRadius: 12, borderColor: "#e8ebe6" }}
            />
            <Bar dataKey="amount" name="Volume" fill="#107a4c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Users by status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={usersByStatus}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {usersByStatus.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e8ebe6" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Identity verification">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={verificationPie}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {verificationPie.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e8ebe6" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Users by role">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={usersByRole} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#5c6370" }} />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fontSize: 11, fill: "#5c6370" }}
            />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e8ebe6" }} />
            <Bar dataKey="count" name="Users" fill="#34a873" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Projects by status">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={surveysByStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#5c6370" }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5c6370" }} width={32} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e8ebe6" }} />
            <Bar dataKey="count" name="Projects" fill="#0e6340" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
