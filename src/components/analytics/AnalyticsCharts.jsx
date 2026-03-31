import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function chartTooltipStyle(isDark) {
  return {
    borderRadius: 12,
    border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb',
    backgroundColor: isDark ? '#18181b' : '#ffffff',
    color: isDark ? '#fafafa' : '#111827',
    fontSize: 12,
  };
}

/** DAU (line) + new signups (bars) — last N days. */
export function EngagementMixChart({ data, isDark }) {
  const tick = isDark ? '#a1a1aa' : '#64748b';
  const grid = isDark ? '#3f3f46' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: tick, fontSize: 10 }} tickLine={false} axisLine={{ stroke: grid }} interval="preserveStartEnd" />
        <YAxis
          yAxisId="dau"
          tick={{ fill: tick, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
        />
        <YAxis
          yAxisId="signups"
          orientation="right"
          tick={{ fill: tick, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip contentStyle={chartTooltipStyle(isDark)} labelStyle={{ fontWeight: 600 }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar yAxisId="signups" dataKey="signups" name="New signups" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Line
          yAxisId="dau"
          type="monotone"
          dataKey="dau"
          name="DAU"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Cohort-style retention curve (% still active). */
export function RetentionAreaChart({ data, isDark }) {
  const tick = isDark ? '#a1a1aa' : '#64748b';
  const grid = isDark ? '#3f3f46' : '#e2e8f0';
  const gradId = `ret-${useId().replace(/:/g, '')}`;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 4 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: tick, fontSize: 10 }} tickLine={false} axisLine={{ stroke: grid }} />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: tick, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={chartTooltipStyle(isDark)}
          formatter={(value) => [`${value}%`, 'Retention']}
        />
        <Area
          type="monotone"
          dataKey="pct"
          name="Retention"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
