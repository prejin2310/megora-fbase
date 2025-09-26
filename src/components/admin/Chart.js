"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Chart({ data = [] }) {
  // ensure numbers
  const d = data.map((row) => ({ ...row, total: Number(row.total || 0) }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={d} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#111827" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#111827" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
        <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
        <Tooltip formatter={(v) => v?.toLocaleString?.() ?? v} />
        <Area type="monotone" dataKey="total" stroke="#111827" fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
