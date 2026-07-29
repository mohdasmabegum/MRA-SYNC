import React, { useEffect, useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { ArrowRight, CalendarCheck, Boxes, ArrowRightLeft, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export const SplashScreen = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    const totalMs = 3000;
    const intervalMs = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      setTimeLeft(Math.ceil((totalMs - elapsed) / 1000));

      if (elapsed >= totalMs) {
        clearInterval(timer);
        onFinish();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen-container">
      {/* Background ambient lighting effects */}
      <div className="splash-bg-glow glow-gold"></div>
      <div className="splash-bg-glow glow-silver"></div>

      <div className="splash-card">
        {/* Animated Metallic Logo Badge */}
        <div className="splash-logo-wrapper">
          <div className="logo-ring-outer"></div>
          <div className="logo-ring-inner"></div>
          <img src={logoImg} alt="MRA SYNC Logo" className="splash-logo-img" />
        </div>

        {/* Title and Tagline */}
        <div className="splash-header-text">
          <h1 className="splash-title">
            <span className="text-gradient-gold">MRA</span>{' '}
            <span className="text-gradient-silver">SYNC</span>
          </h1>
          <p className="splash-tagline">CONNECT • COORDINATE • COMPLETE</p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="splash-features-grid">
          <div className="splash-feat-pill">
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Leave Applications</span>
          </div>
          <div className="splash-feat-pill">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>Material Requisitions</span>
          </div>
          <div className="splash-feat-pill">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>Work Transfer Logs</span>
          </div>
          <div className="splash-feat-pill">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            <span>Department Analytics</span>
          </div>
        </div>

        {/* Professional Clean Footer */}
        <div className="splash-footer-clean">
          <span className="splash-redirect-info">
            Redirecting in <strong>{timeLeft}s</strong>...
          </span>

          <button onClick={onFinish} className="splash-skip-btn">
            <span>Enter Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
