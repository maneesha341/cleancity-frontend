import React, { useEffect, useRef } from 'react';

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
);

export default function AdminCharts({ reports }) {

  // ── Helper — get last 7 days labels ──────────────────────────
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    }
    return days;
  };

  // ── Chart 1: Reports per day (last 7 days) ───────────────────
  const reportsPerDay = () => {
    const days = getLast7Days();
    const counts = days.map(day => {
      return reports.filter(r => {
        const d = new Date(r.createdAt);
        const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return label === day;
      }).length;
    });
    return {
      labels: days,
      datasets: [{
        label: 'Reports Submitted',
        data: counts,
        backgroundColor: 'rgba(29,158,117,0.2)',
        borderColor: '#1D9E75',
        borderWidth: 2,
        borderRadius: 8,
        fill: true,
        tension: 0.4
      }]
    };
  };

  // ── Chart 2: Waste type breakdown (Pie) ──────────────────────
  const wasteTypeData = () => {
    const types = ['general', 'recyclable', 'hazardous', 'organic'];
    const counts = types.map(t => reports.filter(r => r.wasteType === t).length);
    return {
      labels: ['General 🗑️', 'Recyclable ♻️', 'Hazardous ⚠️', 'Organic 🌿'],
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(136,136,136,0.8)',
          'rgba(29,158,117,0.8)',
          'rgba(226,75,74,0.8)',
          'rgba(99,153,34,0.8)'
        ],
        borderColor: ['#888', '#1D9E75', '#E24B4A', '#639922'],
        borderWidth: 2
      }]
    };
  };

  // ── Chart 3: Status breakdown (Doughnut) ─────────────────────
  const statusData = () => {
    const statuses = ['pending', 'assigned', 'collected', 'resolved'];
    const counts = statuses.map(s => reports.filter(r => r.status === s).length);
    return {
      labels: ['Pending ⏳', 'Assigned 🚛', 'Collected ✅', 'Resolved 🎉'],
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(239,159,39,0.8)',
          'rgba(55,138,221,0.8)',
          'rgba(29,158,117,0.8)',
          'rgba(136,136,136,0.8)'
        ],
        borderColor: ['#EF9F27', '#378ADD', '#1D9E75', '#888'],
        borderWidth: 2
      }]
    };
  };

  // ── Chart 4: Collection rate over last 7 days (Line) ─────────
  const collectionRateData = () => {
    const days = getLast7Days();
    const submitted = days.map(day =>
      reports.filter(r => {
        const d = new Date(r.createdAt);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) === day;
      }).length
    );
    const collected = days.map(day =>
      reports.filter(r => {
        const d = new Date(r.createdAt);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) === day
          && (r.status === 'collected' || r.status === 'resolved');
      }).length
    );
    return {
      labels: days,
      datasets: [
        {
          label: 'Submitted',
          data: submitted,
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55,138,221,0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#378ADD',
          pointRadius: 5
        },
        {
          label: 'Collected',
          data: collected,
          borderColor: '#1D9E75',
          backgroundColor: 'rgba(29,158,117,0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1D9E75',
          pointRadius: 5
        }
      ]
    };
  };

  // ── Chart 5: Reports by citizen (Bar) ────────────────────────
  const reportsByCitizen = () => {
    const citizenMap = {};
    reports.forEach(r => {
      const name = r.citizen?.name || 'Unknown';
      citizenMap[name] = (citizenMap[name] || 0) + 1;
    });
    const sorted = Object.entries(citizenMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    return {
      labels: sorted.map(([name]) => name),
      datasets: [{
        label: 'Reports Submitted',
        data: sorted.map(([, count]) => count),
        backgroundColor: [
          'rgba(29,158,117,0.8)',
          'rgba(55,138,221,0.8)',
          'rgba(239,159,39,0.8)',
          'rgba(124,58,237,0.8)',
          'rgba(226,75,74,0.8)',
          'rgba(99,153,34,0.8)',
          'rgba(136,136,136,0.8)',
          'rgba(8,145,178,0.8)',
        ],
        borderRadius: 8,
        borderWidth: 0
      }]
    };
  };

  // ── Common chart options ──────────────────────────────────────
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.raw} reports` } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.raw} reports (${((ctx.raw / reports.length) * 100).toFixed(1)}%)` } }
    }
  };

  // ── Summary stats ─────────────────────────────────────────────
  const todayReports = reports.filter(r => {
    const d = new Date(r.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const collectionRate = reports.length > 0
    ? Math.round((reports.filter(r => r.status === 'collected' || r.status === 'resolved').length / reports.length) * 100)
    : 0;

  const mostActiveCity = () => {
    const cityMap = {};
    reports.forEach(r => {
      const addr = r.location?.address || 'Unknown';
      const city = addr.split(',')[0].trim();
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const sorted = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
  };

  const topCitizen = () => {
    const map = {};
    reports.forEach(r => {
      const name = r.citizen?.name || 'Unknown';
      map[name] = (map[name] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
  };

  if (reports.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: 16 }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>📊</p>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No data to display yet</p>
        <p style={{ color: '#888', fontSize: 14 }}>Charts will appear once citizens submit reports.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: "Today's Reports", value: todayReports, icon: '📅', color: '#378ADD' },
          { label: 'Collection Rate', value: collectionRate + '%', icon: '📈', color: '#1D9E75' },
          { label: 'Most Active Area', value: mostActiveCity(), icon: '📍', color: '#EF9F27' },
          { label: 'Top Citizen', value: topCitizen(), icon: '🏆', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff',
            border: `2px solid ${s.color}22`,
            borderTop: `4px solid ${s.color}`,
            borderRadius: 12,
            padding: '14px 16px'
          }}>
            <p style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 4, fontFamily: 'Poppins' }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: '#888' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

        {/* Chart 1 — Reports per day */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#111' }}>
            📅 Reports Per Day (Last 7 Days)
          </p>
          <Line data={reportsPerDay()} options={barOptions} />
        </div>

        {/* Chart 2 — Waste type */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#111' }}>
            🗑️ Waste Type Breakdown
          </p>
          <Pie data={wasteTypeData()} options={pieOptions} />
        </div>

        {/* Chart 3 — Status doughnut */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#111' }}>
            🔄 Report Status Overview
          </p>
          <Doughnut data={statusData()} options={pieOptions} />
        </div>

        {/* Chart 4 — Collection rate line */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#111' }}>
            📈 Submitted vs Collected (Last 7 Days)
          </p>
          <Line data={collectionRateData()} options={lineOptions} />
        </div>

        {/* Chart 5 — Top citizens bar */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', gridColumn: 'span 2' }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#111' }}>
            👥 Top Citizens by Reports Submitted
          </p>
          <Bar data={reportsByCitizen()} options={barOptions} />
        </div>

      </div>
    </div>
  );
}