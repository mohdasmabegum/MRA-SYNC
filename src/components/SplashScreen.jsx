import React, { useEffect, useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const SplashScreen = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalMs = 3000;
    const intervalMs = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
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
          <img src={logoImg} alt="MRA SYND Logo" className="splash-logo-img" />
        </div>

        {/* Title and Tagline */}
        <div className="splash-header-text">
          <h1 className="splash-title">
            <span className="text-gradient-gold">MRA</span>{' '}
            <span className="text-gradient-silver">SYND</span>
          </h1>
          <p className="splash-tagline">CONNECT • COORDINATE • COMPLETE</p>
          <div className="splash-badge">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Enterprise Workflow System</span>
          </div>
        </div>

        {/* Countdown & Progress bar */}
        <div className="splash-footer">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="splash-status-row">
            <span className="splash-redirect-text">
              <Sparkles className="w-4 h-4 text-amber-400 inline mr-1 animate-spin" />
              Initializing secure session... Redirecting in <strong>{timeLeft}s</strong>
            </span>

            <button onClick={onFinish} className="splash-skip-btn">
              <span>Skip Intro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
