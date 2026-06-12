import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminCharts from '../components/AdminCharts';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// ── Map Component ─────────────────────────────────────────────
const containerStyle = { width: '100%', height: '480px', borderRadius: '14px' };
const defaultCenter  = { lat: 17.3850, lng: 78.4867 };

const wasteIcons = {
  general:    '🗑️',
  recyclable: '♻️',
  hazardous:  '⚠️',
  organic:    '🌿'
};

function CityMap({ reports }) {
  const [selected, setSelected] = useState(null);
const [showCharts, setShowCharts] = useState(false);
  const { isLoaded } = useJsApiLoader({
    id:              'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
  });

  const onLoad = useCallback((map) => {
    const valid = reports.filter(r => r.location?.coordinates?.lat);
    if (valid.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      valid.forEach(r => bounds.extend({
        lat: r.location.coordinates.lat,
        lng: r.location.coordinates.lng
      }));
      map.fitBounds(bounds);
    }
  }, [reports]);

  const getMarkerIcon = (status) => {
    const icons = {
      pending:   'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      assigned:  'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      collected: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      resolved:  'http://maps.google.com/mapfiles/ms/icons/grey-dot.png'
    };
    return icons[status] || icons.pending;
  };

  if (!isLoaded) return (
    <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: 14 }}>
      <div className="spinner"></div>
    </div>
  );

  const validReports = reports.filter(r => r.location?.coordinates?.lat);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { color: '#ef4444', label: 'Pending'   },
          { color: '#378ADD', label: 'Assigned'  },
          { color: '#1D9E75', label: 'Collected' },
          { color: '#888',    label: 'Resolved'  }
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 13, color: '#555' }}>{item.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 13, color: '#aaa', marginLeft: 'auto' }}>
          {validReports.length} locations on map
        </span>
      </div>
      {/* Charts Section */}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
  <div className="section-title" style={{ margin: 0 }}>
    📊 Analytics Charts
    <span className="section-badge">Live data</span>
  </div>
  <button
    onClick={() => setShowCharts(!showCharts)}
    className="btn btn-outline"
    style={{ fontSize: 13 }}>
    {showCharts ? 'Hide Charts ▲' : 'Show Charts ▼'}
  </button>
</div>

{showCharts && (
  <div style={{ marginBottom: 32 }}>
    <AdminCharts reports={reports} />
  </div>
)}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        options={{
          mapTypeControl:    false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        }}>

        {validReports.map(report => (
          <Marker
            key={report._id}
            position={{
              lat: report.location.coordinates.lat,
              lng: report.location.coordinates.lng
            }}
            icon={getMarkerIcon(report.status)}
            onClick={() => setSelected(report)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{
              lat: selected.location.coordinates.lat,
              lng: selected.location.coordinates.lng
            }}
            onCloseClick={() => setSelected(null)}>
            <div style={{ padding: 8, maxWidth: 220 }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#111' }}>
                {wasteIcons[selected.wasteType]} {selected.title}
              </p>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                📍 {selected.location.address}
              </p>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                👤 {selected.citizen?.name || 'Unknown'}
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: selected.status === 'pending'   ? '#fef3c7' :
                              selected.status === 'assigned'  ? '#dbeafe' :
                              selected.status === 'collected' ? '#d1fae5' : '#f1f5f9',
                  color:      selected.status === 'pending'   ? '#92400e' :
                              selected.status === 'assigned'  ? '#1e40af' :
                              selected.status === 'collected' ? '#065f46' : '#64748b'
                }}>
                  {selected.status}
                </span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f1f5f9', color: '#64748b' }}>
                  {selected.wasteType}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                {new Date(selected.createdAt).toLocaleDateString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {validReports.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14, marginTop: 12 }}>
          No reports with location data yet. Submit reports with real addresses to see pins on map.
        </p>
      )}
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats,   setStats]   = useState({ total: 0, pending: 0, assigned: 0, collected: 0, resolved: 0 });
  const [msg,     setMsg]     = useState('');
  const [imgModal,setImgModal]= useState(null);
  const [showMap, setShowMap] = useState(false);
  const [filter,  setFilter]  = useState('all');

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    fetchReports();
    fetchDrivers();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get('/api/reports', { headers });
      setReports(data);
      setStats({
        total:     data.length,
        pending:   data.filter(r => r.status === 'pending').length,
        assigned:  data.filter(r => r.status === 'assigned').length,
        collected: data.filter(r => r.status === 'collected').length,
        resolved:  data.filter(r => r.status === 'resolved').length,
      });
    } catch (err) { console.error(err); }
  };

  const fetchDrivers = async () => {
    try {
      const { data } = await axios.get('/api/users/drivers', { headers });
      setDrivers(data);
    } catch { setDrivers([]); }
  };

  const assignDriver = async (reportId, driverId) => {
    try {
      await axios.patch(`/api/reports/${reportId}/status`, {
        status: 'assigned', assignedDriver: driverId
      }, { headers });
      setMsg('✅ Driver assigned successfully!');
      fetchReports();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed to assign driver.'); }
  };

  const updateStatus = async (reportId, status) => {
    try {
      await axios.patch(`/api/reports/${reportId}/status`, { status }, { headers });
      setMsg(`✅ Status updated to "${status}"`);
      fetchReports();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed to update status.'); }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`/api/reports/${reportId}`, { headers });
      setMsg('✅ Report deleted.');
      fetchReports();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed to delete.'); }
  };

  const statusColors = {
    pending:   '#EF9F27',
    assigned:  '#378ADD',
    collected: '#1D9E75',
    resolved:  '#888'
  };

  const wasteColors = {
    general:    '#888',
    recyclable: '#1D9E75',
    hazardous:  '#E24B4A',
    organic:    '#639922'
  };

  // Filter reports
  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.status === filter);

  if (user.role !== 'admin') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#E24B4A' }}>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>

      {/* Header */}
      <h1 style={{ fontFamily: 'Poppins', fontSize: 26, marginBottom: 4 }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Manage all city waste reports and drivers</p>

      {/* Alert */}
      {msg && (
        <div className={`alert ${msg.includes('❌') ? 'alert-error' : 'alert-success'}`}
          style={{ marginBottom: 20 }}>
          {msg}
          <button className="alert-close" onClick={() => setMsg('')}>✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Reports', value: stats.total,     color: '#534AB7', icon: '📋' },
          { label: 'Pending',       value: stats.pending,   color: '#EF9F27', icon: '⏳' },
          { label: 'Assigned',      value: stats.assigned,  color: '#378ADD', icon: '🚛' },
          { label: 'Collected',     value: stats.collected, color: '#1D9E75', icon: '✅' },
          { label: 'Resolved',      value: stats.resolved,  color: '#888',    icon: '🎉' },
        ].map(s => (
          <div key={s.label} className="stat-card"
            style={{ borderTopColor: s.color, cursor: 'pointer' }}
            onClick={() => setFilter(s.label === 'Total Reports' ? 'all' : s.label.toLowerCase())}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div className="stat-card-val" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
              {filter === (s.label === 'Total Reports' ? 'all' : s.label.toLowerCase()) ? '● Active filter' : 'Click to filter'}
            </div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-title" style={{ margin: 0 }}>
          🗺️ City Map View
          <span className="section-badge">
            {reports.filter(r => r.location?.coordinates?.lat).length} on map
          </span>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="btn btn-outline"
          style={{ fontSize: 13 }}>
          {showMap ? 'Hide Map ▲' : 'Show Map ▼'}
        </button>
      </div>

      {showMap && (
        <div style={{ marginBottom: 32 }}>
          <CityMap reports={reports} />
        </div>
      )}

      {/* Reports Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>
          All Reports
          <span className="section-badge">{filteredReports.length} showing</span>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'pending', 'assigned', 'collected', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:      '5px 14px',
                borderRadius: 20,
                border:       '1px solid #ddd',
                fontSize:     12,
                cursor:       'pointer',
                fontWeight:   filter === f ? 600 : 400,
                background:   filter === f ? '#1D9E75' : '#fff',
                color:        filter === f ? '#fff' : '#555',
                transition:   'all 0.2s'
              }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p className="empty-title">No {filter === 'all' ? '' : filter} reports</p>
          <p className="empty-desc">
            {filter === 'all' ? 'No reports submitted yet.' : `No reports with status "${filter}" found.`}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {['Photo', 'Title', 'Citizen', 'Location', 'Type', 'Status', 'Assign Driver', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r._id}>

                  {/* Photo */}
                  <td>
                    {r.photo?.url ? (
                      <img
                        src={r.photo.url}
                        alt="waste"
                        onClick={() => setImgModal(r.photo.url)}
                        style={{
                          width: 56, height: 56, objectFit: 'cover',
                          borderRadius: 8, cursor: 'pointer',
                          border: '1px solid #eee', transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
                        onMouseOut={e  => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: 56, height: 56, borderRadius: 8,
                        background: '#f5f5f5', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 20
                      }}>📷</div>
                    )}
                  </td>

                  {/* Title */}
                  <td>
                    <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{r.title}</p>
                    {r.location?.coordinates?.lat && (
                      <span style={{ fontSize: 11, color: '#1D9E75' }}>📍 On map</span>
                    )}
                  </td>

                  {/* Citizen */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#1D9E75', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, flexShrink: 0
                      }}>
                        {r.citizen?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span style={{ fontSize: 13 }}>{r.citizen?.name || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ fontSize: 13, color: '#555', maxWidth: 130 }}>
                    📍 {r.location?.address}
                  </td>

                  {/* Waste Type */}
                  <td>
                    <span style={{
                      background: wasteColors[r.wasteType] + '22',
                      color: wasteColors[r.wasteType],
                      fontSize: 12, padding: '3px 10px', borderRadius: 20
                    }}>
                      {wasteIcons[r.wasteType]} {r.wasteType}
                    </span>
                  </td>

                  {/* Status dropdown */}
                  <td>
                    <select
                      value={r.status}
                      onChange={e => updateStatus(r._id, e.target.value)}
                      className="table-select"
                      style={{ color: statusColors[r.status], borderColor: statusColors[r.status] }}>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="collected">Collected</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Assign Driver */}
                  <td>
                    {drivers.length > 0 ? (
                      <select
                        className="table-select"
                        value={r.assignedDriver?._id || ''}
                        onChange={e => e.target.value && assignDriver(r._id, e.target.value)}>
                        <option value="">Select driver</option>
                        {drivers.map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: 12, color: '#aaa' }}>No drivers yet</span>
                    )}
                  </td>

                  {/* Delete */}
                  <td>
                    <button
                      onClick={() => deleteReport(r._id)}
                      className="btn btn-danger"
                      style={{ padding: '5px 12px', fontSize: 13 }}>
                      🗑️ Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full screen image modal */}
      {imgModal && (
        <div
          onClick={() => setImgModal(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out'
          }}>
          <img src={imgModal} alt="full"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 14 }} />
          <button onClick={() => setImgModal(null)}
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', width: 42, height: 42,
              borderRadius: '50%', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          <p style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Click anywhere to close
          </p>
        </div>
      )}

    </div>
  );
}