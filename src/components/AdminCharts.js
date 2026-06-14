import React from 'react';
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

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    }
    return days;
  };

  const reportsPerDay = () => {
    const days = getLast7Days();
    const counts = days.map(day =>
      reports.filter(r => {
        const d = new Date(r.createdAt);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) === day;
      }).length
    );
    return {
      labels: days,
      datasets: [{
        label: 'Reports',
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
          pointRadius: 4
        },
        {
          label: 'Collected',
          data: collected,
          borderColor: '#1D9E75',
          backgroundColor: 'rgba(29,158,117,0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4
        }
      ]
    };
  };

  const reportsByCitizen = () => {
    const citizenMap = {};
    reports.forEach(r => {
      const name = r.citizen?.name || 'Unknown';
      citizenMap[name] = (citizenMap[name] || 0) + 1;
    });
    const sorted = Object.entries(citizenMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      labels: sorted.map(([name]) => name.length > 10 ? name.substring(0, 10) + '...' : name),
      datasets: [{
        label: 'Reports',
        data: sorted.map(([, count]) => count),
        backgroundColor: [
          'rgba(29,158,117,0.8)', 'rgba(55,138,221,0.8)',
          'rgba(239,159,39,0.8)', 'rgba(124,58,237,0.8)',
          'rgba(226,75,74,0.8)',  'rgba(99,153,34,0.8)',
        ],
        borderRadius: 8,
        borderWidth: 0
      }]
    };
  };

  // ── Responsive chart options ──────────────────────────────────
  const isMobile = window.innerWidth < 768;

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: isMobile ? 10 : 12 },
          padding: isMobile ? 8 : 16,
          boxWidth: isMobile ? 10 : 14
        }
      },
      tooltip: { mode: 'index', intersect: false }
    }
  };

  const barOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: isMobile ? 9 : 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: isMobile ? 9 : 11 } }
      }
    }
  };

  const lineOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: isMobile ? 9 : 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: isMobile ? 9 : 11 } }
      }
    }
  };

  const pieOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.raw} (${reports.length > 0 ? ((ctx.raw / reports.length) * 100).toFixed(1) : 0}%)`
        }
      }
    }
  };

  // ── Summary stats ─────────────────────────────────────────────
  const todayReports = reports.filter(r => {
    const d = new Date(r.createdAt);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const collectionRate = reports.length > 0
    ? Math.round((reports.filter(r =>
        r.status === 'collected' || r.status === 'resolved').length / reports.length) * 100)
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
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9f9f9', borderRadius: 16 }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>📊</p>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No data yet</p>
        <p style={{ color: '#888', fontSize: 14 }}>Charts appear once reports are submitted.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Quick Stats — 2 col on mobile, 4 col on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 10,
        marginBottom: 20
      }}>
        {[
          { label: "Today", value: todayReports, icon: '📅', color: '#378ADD' },
          { label: 'Collection %', value: collectionRate + '%', icon: '📈', color: '#1D9E75' },
          { label: 'Hot Area', value: mostActiveCity().length > 10 ? mostActiveCity().substring(0,10)+'...' : mostActiveCity(), icon: '📍', color: '#EF9F27' },
          { label: 'Top Citizen', value: topCitizen().length > 10 ? topCitizen().substring(0,10)+'...' : topCitizen(), icon: '🏆', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff',
            border: `2px solid ${s.color}22`,
            borderTop: `4px solid ${s.color}`,
            borderRadius: 12,
            padding: '12px 14px'
          }}>
            <p style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</p>
            <p style={{
              fontSize: isMobile ? 16 : 20,
              fontWeight: 700,
              color: s.color,
              marginBottom: 4,
              fontFamily: 'Poppins',
              wordBreak: 'break-word'
            }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: '#888' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts — single column on mobile, 2 col on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 16
      }}>

        {/* Chart 1 — Reports per day */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: isMobile ? 14 : 20,
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: isMobile ? 12 : 14, marginBottom: 12, color: '#111' }}>
            📅 Reports Per Day (Last 7 Days)
          </p>
          <div style={{ height: isMobile ? 180 : 220 }}>
            <Line data={reportsPerDay()} options={{ ...lineOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 2 — Waste type */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: isMobile ? 14 : 20,
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: isMobile ? 12 : 14, marginBottom: 12, color: '#111' }}>
            🗑️ Waste Type Breakdown
          </p>
          <div style={{ height: isMobile ? 200 : 220 }}>
            <Pie data={wasteTypeData()} options={{ ...pieOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 3 — Status doughnut */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: isMobile ? 14 : 20,
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: isMobile ? 12 : 14, marginBottom: 12, color: '#111' }}>
            🔄 Status Overview
          </p>
          <div style={{ height: isMobile ? 200 : 220 }}>
            <Doughnut data={statusData()} options={{ ...pieOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 4 — Collection rate */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: isMobile ? 14 : 20,
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: isMobile ? 12 : 14, marginBottom: 12, color: '#111' }}>
            📈 Submitted vs Collected
          </p>
          <div style={{ height: isMobile ? 180 : 220 }}>
            <Line data={collectionRateData()} options={{ ...lineOptions, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 5 — Top citizens — full width */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: isMobile ? 14 : 20,
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          gridColumn: isMobile ? '1' : '1 / -1'
        }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: isMobile ? 12 : 14, marginBottom: 12, color: '#111' }}>
            👥 Top Citizens by Reports
          </p>
          <div style={{ height: isMobile ? 180 : 220 }}>
            <Bar data={reportsByCitizen()} options={{ ...barOptions, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>
    </div>
  );
}