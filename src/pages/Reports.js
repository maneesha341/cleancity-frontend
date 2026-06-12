import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReportCard from '../components/ReportCard';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports]     = useState([]);
  const [form, setForm]           = useState({ title: '', description: '', address: '', wasteType: 'general' });
  const [photo, setPhoto]         = useState(null);
  const [preview, setPreview]     = useState(null);
  const [msg, setMsg]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [lat, setLat]             = useState(null);
  const [lng, setLng]             = useState(null);
  const fileRef                   = useRef();

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get('/api/reports', { headers }).then(r => setReports(r.data));
  }, []);

  // ── Photo handlers ──────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg('❌ Photo must be under 5MB');
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── GPS Location ────────────────────────────────────────────
  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setMsg('❌ Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          // Free reverse geocoding using OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setForm(prev => ({ ...prev, address }));
          setMsg('✅ Location detected automatically!');
          setTimeout(() => setMsg(''), 3000);
        } catch {
          setForm(prev => ({ ...prev, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          setMsg('✅ GPS coordinates captured!');
          setTimeout(() => setMsg(''), 3000);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setMsg('❌ Location permission denied. Please allow location access.');
        else if (err.code === 2) setMsg('❌ Location unavailable. Please type address manually.');
        else setMsg('❌ Could not get location. Please type address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.address) {
      setMsg('❌ Title and address are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title',       form.title);
      formData.append('description', form.description);
      formData.append('address',     form.address);
      formData.append('wasteType',   form.wasteType);
      if (lat) formData.append('lat', lat);
      if (lng) formData.append('lng', lng);
      if (photo) formData.append('photo', photo);

      const { data } = await axios.post('/api/reports', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setReports([data, ...reports]);
      setMsg('✅ Report submitted! +10 green points earned.');
      setForm({ title: '', description: '', address: '', wasteType: 'general' });
      setLat(null);
      setLng(null);
      removePhoto();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg('❌ Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'Poppins', fontSize: 24, marginBottom: 6 }}>
        Submit a Waste Report
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        Report a waste issue and earn +10 green points
      </p>

      <div className="card-solid" style={{ marginBottom: 32 }}>

        {/* Alert */}
        {msg && (
          <div className={`alert ${msg.includes('❌') ? 'alert-error' : 'alert-success'}`}>
            {msg}
            <button className="alert-close" onClick={() => setMsg('')}>✕</button>
          </div>
        )}

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Report title *</label>
          <input
            className="form-input"
            placeholder="e.g. Overflowing bin near main market"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        {/* Location with GPS button */}
        <div className="form-group">
          <label className="form-label">Location / Address *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="e.g. Madhurawada, Visakhapatnam, Andhra Pradesh"
              value={form.address}
              onChange={e => {
                setForm({ ...form, address: e.target.value });
                setLat(null);
                setLng(null);
              }}
              style={{ flex: 1 }} />
            <button
              type="button"
              onClick={getMyLocation}
              disabled={gpsLoading}
              title="Auto-detect my location"
              style={{
                padding:      '0 14px',
                borderRadius: 'var(--radius-sm)',
                border:       '1.5px solid var(--border-strong)',
                background:   gpsLoading ? '#f0faf5' : '#fff',
                cursor:       gpsLoading ? 'wait' : 'pointer',
                fontSize:     gpsLoading ? 13 : 20,
                flexShrink:   0,
                color:        'var(--green-main)',
                transition:   'all 0.2s',
                minWidth:     48
              }}>
              {gpsLoading ? '...' : '📍'}
            </button>
          </div>

          {/* GPS status indicator */}
          {lat && lng && (
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              marginTop:    6,
              padding:      '6px 10px',
              background:   '#edfaf4',
              borderRadius: 6,
              fontSize:     12,
              color:        '#0f6e56'
            }}>
              <span>✅</span>
              <span>GPS coordinates captured — your report will appear on the city map!</span>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            💡 Click 📍 to auto-detect location OR type full address like
            "Kommadi, Visakhapatnam, Andhra Pradesh"
          </p>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Describe the waste issue in detail..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        {/* Waste Type */}
        <div className="form-group">
          <label className="form-label">Waste type</label>
          <select
            className="form-select"
            value={form.wasteType}
            onChange={e => setForm({ ...form, wasteType: e.target.value })}>
            <option value="general">🗑️ General</option>
            <option value="recyclable">♻️ Recyclable</option>
            <option value="hazardous">⚠️ Hazardous</option>
            <option value="organic">🌿 Organic</option>
          </select>
        </div>

        {/* Photo Upload */}
        <div className="form-group">
          <label className="form-label">Photo (optional — max 5MB)</label>
          {!preview ? (
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border:       '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding:      '28px',
                textAlign:    'center',
                cursor:       'pointer',
                background:   'var(--green-pale)',
                transition:   'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-main)'}
              onMouseOut={e  => e.currentTarget.style.borderColor = 'var(--border-strong)'}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📷</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                Click to upload a photo
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                JPG, PNG or WebP — max 5MB
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <img
                src={preview}
                alt="preview"
                style={{
                  width:        '100%',
                  maxHeight:    240,
                  objectFit:    'cover',
                  borderRadius: 'var(--radius-md)',
                  display:      'block'
                }} />
              <button
                onClick={removePhoto}
                style={{
                  position:     'absolute',
                  top:          8,
                  right:        8,
                  background:   'rgba(0,0,0,0.6)',
                  color:        '#fff',
                  border:       'none',
                  borderRadius: '50%',
                  width:        30,
                  height:       30,
                  cursor:       'pointer',
                  fontSize:     14,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center'
                }}>✕</button>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                ✅ {photo?.name} ({(photo?.size / 1024).toFixed(0)} KB)
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ display: 'none' }} />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={loading}
          style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
          {loading ? '⏳ Submitting...' : '📤 Submit Report'}
        </button>

      </div>

      {/* Reports List */}
      <div className="section-title">
        My Reports
        <span className="section-badge">{reports.length} total</span>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p className="empty-title">No reports yet</p>
          <p className="empty-desc">Submit your first waste report above!</p>
        </div>
      ) : (
        reports.map(r => <ReportCard key={r._id} report={r} />)
      )}
    </div>
  );
}