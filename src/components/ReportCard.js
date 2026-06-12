import React, { useState } from 'react';

export default function ReportCard({ report }) {
  const [imgOpen, setImgOpen] = useState(false);

  const statusClass = {
    pending: 'badge-pending', assigned: 'badge-assigned',
    collected: 'badge-collected', resolved: 'badge-resolved'
  };
  const wasteClass = {
    general: 'badge-general', recyclable: 'badge-recyclable',
    hazardous: 'badge-hazardous', organic: 'badge-organic'
  };

  return (
    <>
      <div className="report-card">
        {/* Photo thumbnail */}
        {report.photo?.url && (
          <img
            src={report.photo.url}
            alt="waste"
            onClick={() => setImgOpen(true)}
            style={{
              width: 72, height: 72, objectFit: 'cover',
              borderRadius: 10, flexShrink: 0, cursor: 'pointer',
              border: '1px solid var(--border)'
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <p className="report-title">{report.title}</p>
          <p className="report-location">📍 {report.location?.address}</p>
          {report.description && <p className="report-desc">"{report.description}"</p>}
          <p className="report-date">
            {new Date(report.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <div className="report-badges">
          <span className={`badge ${statusClass[report.status]}`}>{report.status}</span>
          <span className={`badge ${wasteClass[report.wasteType]}`}>{report.wasteType}</span>
          {report.photo?.url && (
            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>📷 photo</span>
          )}
        </div>
      </div>

      {/* Full screen image modal */}
      {imgOpen && (
        <div
          onClick={() => setImgOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, cursor: 'zoom-out'
          }}>
          <img src={report.photo.url} alt="waste full"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
          <button onClick={() => setImgOpen(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', width: 40, height: 40, borderRadius: '50%',
              fontSize: 18, cursor: 'pointer'
            }}>✕</button>
        </div>
      )}
    </>
  );
}