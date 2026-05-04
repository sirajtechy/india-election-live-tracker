'use client';

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { partyColor } from '@/lib/party-colors';
import { allianceFullName } from '@/lib/alliance-names';
import { partyFullName } from '@/lib/party-names';
import type { StateResult } from '@/lib/types';

export function ResultsCharts({ result }: { result: StateResult }) {
  const pieData = result.alliances
    .filter((a) => a.seats > 0)
    .map((a) => ({
      shortId: a.id,
      name: allianceFullName(result.code, a.id),
      value: a.seats,
      color: partyColor(a.id === 'OTHERS' ? 'OTH' : a.id),
    }));

  const barData = result.parties.slice(0, 10).map((p) => ({
    code: p.id,
    fullName: partyFullName(p.id),
    seats: p.total,
    color: partyColor(p.id),
  }));

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Alliance seat share</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={82}
              dataKey="value"
              nameKey="name"
              label={({ value }) => `${value}`}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value, 'Seats']}
              labelFormatter={(_, payload) => (payload?.[0]?.payload as { name?: string })?.name ?? ''}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#aaa' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card">
        <h3>Party-wise seats (won + leading)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
            <XAxis
              dataKey="code"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={72}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as (typeof barData)[0];
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">{row.fullName}</div>
                    <div className="chart-tooltip-code">({row.code})</div>
                    <div className="chart-tooltip-seats">Seats: {row.seats}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="seats" name="Seats">
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="chart-footnote">Bars show party code; hover for full name.</p>
      </div>
    </div>
  );
}
