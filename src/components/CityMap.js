import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '500px', borderRadius: '16px' };

// Default center — Hyderabad India
const defaultCenter = { lat: 17.3850, lng: 78.4867 };

const statusColors = {
  pending:   '🔴',
  assigned:  '🔵',
  collected: '🟢',
  resolved:  '⚫'
};

const wasteIcons = {
  general:    '🗑️',
  recyclable: '♻️',
  hazardous:  '⚠️',
  organic:    '🌿'
};

export default function CityMap({ reports }) {
  const [selected, setSelected] = useState(null);
  const [map, setMap]           = useState(null);

  const { isLoaded } = useJsApiLoader({
    id:              'google-map-script',
    googleMapsApiId: process.env.REACT_APP_GOOGLE_MAPS_KEY
  });

  const onLoad = useCallback((map) => {
    // Fit map to show all markers
    if (reports && reports.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      reports.forEach(r => {
        if (r.location?.coordinates?.lat) {
          bounds.extend({
            lat: r.location.coordinates.lat,
            lng: r.location.coordinates.lng
          });
        }
      });
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [reports]);

  const onUnmount = useCallback(() => setMap(null), []);

  const getMarkerIcon = (status) => {
    const colors = {
      pending:   'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      assigned:  'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      collected: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      resolved:  'http://maps.google.com/mapfiles/ms/icons/grey-dot.png'
    };
    return colors[status] || colors.pending;
  };

  if (!isLoaded) return (
    <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: 16 }}>
      <div className="spinner"></div>
    </div>
  );

  const validReports = reports.filter(r => r.location?.coordinates?.lat);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { color: '#ef4444', label: 'Pending' },
          { color: '#378ADD', label: 'Assigned' },
          { color: '#1D9E75', label: 'Collected' },
          { color: '#888',    label: 'Resolved' }
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {validReports.length} locations on map
        </span>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
          ],
          mapTypeControl:    false,
          streetViewControl: false,
          fullscreenControl: true
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
            animation={window.google.maps.Animation.DROP}
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
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: selected.status === 'pending'   ? '#fef3c7' :
                              selected.status === 'assigned'  ? '#dbeafe' :
                              selected.status === 'collected' ? '#d1fae5' : '#f1f5f9',
                  color:      selected.status === 'pending'   ? '#92400e' :
                              selected.status === 'assigned'  ? '#1e40af' :
                              selected.status === 'collected' ? '#065f46' : '#64748b'
                }}>
                  {statusColors[selected.status]} {selected.status}
                </span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: '#f1f5f9', color: '#64748b'
                }}>
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
        <div style={{ textAlign: 'center', marginTop: 12, color: '#888', fontSize: 14 }}>
          No reports with location data yet. Submit reports with addresses to see them on the map.
        </div>
      )}
    </div>
  );
}