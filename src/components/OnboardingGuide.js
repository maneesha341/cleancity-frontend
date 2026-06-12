import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OnboardingGuide() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Check if user has seen guide before
    const seen = localStorage.getItem(`onboarding_${user._id}`);
    if (!seen) setShow(true);
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(`onboarding_${user._id}`, 'true');
    setShow(false);
  };

  if (!show || !user) return null;

  // Different guides for each role
  const guides = {
    citizen: [
      {
        icon: '👋',
        title: 'Welcome to CleanCity!',
        desc: 'CleanCity helps you report waste problems in your city. You just take a photo, tell us the location, and we handle the rest!',
        color: '#1D9E75'
      },
      {
        icon: '🗑️',
        title: 'How to Report Waste',
        desc: 'Click "Reports" in the menu → Fill in the title and location → Upload a photo of the waste → Click Submit. It takes less than 1 minute!',
        color: '#1D9E75'
      },
      {
        icon: '⭐',
        title: 'Earn Green Points',
        desc: 'Every report you submit gives you +10 Green Points! Collect points to climb the leaderboard and unlock reward levels like Eco Warrior and Green Hero.',
        color: '#EF9F27'
      },
      {
        icon: '🔔',
        title: 'Get Notified',
        desc: 'You will receive notifications and emails when your report is assigned to a driver and when the waste is collected. No need to keep checking!',
        color: '#378ADD'
      },
      {
        icon: '🏆',
        title: 'Check the Leaderboard',
        desc: 'See how you rank among other citizens in your city. The more you report, the higher you climb! Top 3 get gold, silver and bronze medals.',
        color: '#EF9F27'
      }
    ],
    driver: [
      {
        icon: '👋',
        title: 'Welcome, Driver!',
        desc: 'CleanCity helps you manage your waste collection tasks efficiently. The admin will assign tasks to you and you can see them all here.',
        color: '#378ADD'
      },
      {
        icon: '📋',
        title: 'Your Tasks',
        desc: 'When admin assigns a report to you, it will appear in your Driver Panel automatically. You will also get an email and notification instantly.',
        color: '#378ADD'
      },
      {
        icon: '✅',
        title: 'Mark as Collected',
        desc: 'Once you collect the waste at the location, click the "Mark Collected" button on that task. The citizen will be notified and the task moves to Completed.',
        color: '#1D9E75'
      },
      {
        icon: '📍',
        title: 'Find the Location',
        desc: 'Each task shows the full address reported by the citizen. You can copy the address and search it on Google Maps to find the exact location.',
        color: '#EF9F27'
      }
    ],
    admin: [
      {
        icon: '👋',
        title: 'Welcome, Admin!',
        desc: 'You have full control over CleanCity. You can see all waste reports from all citizens, assign drivers, and monitor the entire city.',
        color: '#534AB7'
      },
      {
        icon: '📊',
        title: 'Dashboard Stats',
        desc: 'Your dashboard shows Total Reports, Pending, Assigned, Collected and Resolved counts at a glance so you always know the city status.',
        color: '#534AB7'
      },
      {
        icon: '🚛',
        title: 'Assign Drivers',
        desc: 'For each pending report, use the "Select driver" dropdown to assign a driver. They will get an email and notification instantly when assigned.',
        color: '#378ADD'
      },
      {
        icon: '🔄',
        title: 'Update Status',
        desc: 'Use the status dropdown on each report to change it from Pending → Assigned → Collected → Resolved. Citizens get notified on every change.',
        color: '#1D9E75'
      },
      {
        icon: '🗑️',
        title: 'Delete Reports',
        desc: 'You can delete any report using the Delete button. This also removes the photo from Cloudinary storage automatically.',
        color: '#E24B4A'
      }
    ]
  };

  const steps = guides[user.role] || guides.citizen;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{
      position:        'fixed',
      inset:           0,
      background:      'rgba(0,0,0,0.7)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      zIndex:          9999,
      padding:         '20px',
      backdropFilter:  'blur(4px)'
    }}>
      <div style={{
        background:    '#fff',
        borderRadius:  24,
        padding:       '40px 36px',
        maxWidth:      480,
        width:         '100%',
        boxShadow:     '0 24px 64px rgba(0,0,0,0.25)',
        animation:     'fadeUp 0.3s ease'
      }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width:        i === step ? 24 : 8,
              height:       8,
              borderRadius: 4,
              background:   i === step ? current.color : '#e0e0e0',
              transition:   'all 0.3s ease'
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width:          72,
          height:         72,
          borderRadius:   20,
          background:     current.color + '18',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       36,
          margin:         '0 auto 20px'
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily:  'Poppins, sans-serif',
          fontSize:    22,
          fontWeight:  700,
          color:       '#0f2419',
          textAlign:   'center',
          marginBottom: 12
        }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize:    15,
          color:       '#555',
          textAlign:   'center',
          lineHeight:  1.7,
          marginBottom: 32
        }}>
          {current.desc}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex:         1,
                padding:      '12px',
                borderRadius: 10,
                border:       '1.5px solid #e0e0e0',
                background:   '#fff',
                fontSize:     15,
                cursor:       'pointer',
                color:        '#555',
                fontFamily:   'DM Sans, sans-serif'
              }}>
              ← Back
            </button>
          )}

          <button
            onClick={isLast ? dismiss : () => setStep(step + 1)}
            style={{
              flex:         1,
              padding:      '12px',
              borderRadius: 10,
              border:       'none',
              background:   `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
              color:        '#fff',
              fontSize:     15,
              fontWeight:   600,
              cursor:       'pointer',
              fontFamily:   'Poppins, sans-serif',
              boxShadow:    `0 4px 14px ${current.color}44`
            }}>
            {isLast ? "Let's Get Started! 🚀" : "Next →"}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={dismiss}
            style={{
              display:    'block',
              margin:     '16px auto 0',
              background: 'none',
              border:     'none',
              fontSize:   13,
              color:      '#aaa',
              cursor:     'pointer'
            }}>
            Skip guide
          </button>
        )}

        {/* Step counter */}
        <p style={{
          textAlign:  'center',
          fontSize:   12,
          color:      '#ccc',
          marginTop:  12
        }}>
          {step + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}