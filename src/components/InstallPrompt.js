import React, { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [installed, setInstalled]           = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      console.log('CleanCity installed!');
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) {
      const hoursSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60);
      if (hoursSince < 24) setShowBanner(false);
    }
  }, []);

  if (!showBanner || installed) return null;

  return (
    <div style={{
      position:     'fixed',
      bottom:       20,
      left:         '50%',
      transform:    'translateX(-50%)',
      width:        'calc(100% - 32px)',
      maxWidth:     480,
      background:   '#fff',
      borderRadius: 16,
      padding:      '16px 20px',
      boxShadow:    '0 8px 32px rgba(0,0,0,0.18)',
      border:       '1px solid #eee',
      zIndex:       9998,
      animation:    'slideUp 0.4s ease',
      display:      'flex',
      alignItems:   'center',
      gap:          14
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width:          48,
        height:         48,
        borderRadius:   12,
        background:     'linear-gradient(135deg, #0a5c3f, #1D9E75)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       24,
        flexShrink:     0
      }}>🌱</div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 2 }}>
          Install CleanCity
        </p>
        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>
          Add to home screen for quick access and offline use
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={dismiss}
          style={{
            background:   'none',
            border:       '1px solid #ddd',
            borderRadius: 8,
            padding:      '6px 10px',
            fontSize:     12,
            cursor:       'pointer',
            color:        '#888'
          }}>
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{
            background:   'linear-gradient(135deg, #1D9E75, #0a5c3f)',
            border:       'none',
            borderRadius: 8,
            padding:      '6px 14px',
            fontSize:     12,
            fontWeight:   600,
            cursor:       'pointer',
            color:        '#fff'
          }}>
          Install
        </button>
      </div>
    </div>
  );
}