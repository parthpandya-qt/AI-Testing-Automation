'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const features = [
  {
    icon: '⚡',
    title: 'AI-Powered Tests',
    desc: 'Generate comprehensive test suites instantly with advanced AI models trained on thousands of codebases.',
  },
  {
    icon: '🔗',
    title: 'GitHub Integration',
    desc: 'Connect your repositories in one click. Auto-detect code changes and trigger smart test generation.',
  },
  {
    icon: '📊',
    title: 'Live Analytics',
    desc: 'Real-time dashboards showing coverage, pass rates, and regressions — all in one beautiful interface.',
  },
  {
    icon: '🛡️',
    title: 'Zero False Positives',
    desc: 'Our AI understands context, eliminating flaky tests and ensuring reliable CI/CD pipelines.',
  },
  {
    icon: '🚀',
    title: 'Instant Execution',
    desc: 'Run thousands of tests in parallel on our cloud infrastructure with sub-second feedback loops.',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    desc: 'SOC 2 compliant with end-to-end encryption. Your code never leaves your secure environment.',
  },
];

const stats = [
  { value: '10x', label: 'Faster Test Generation' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '500+', label: 'Teams Onboarded' },
  { value: '2M+', label: 'Tests Generated' },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #020617;
          color: #f1f5f9;
          overflow-x: hidden;
        }

        /* ── Navbar ── */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s;
        }
        .nav.scrolled {
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.15);
        }
        .nav-logo {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #818cf8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .btn-ghost {
          padding: 0.55rem 1.25rem;
          border-radius: 8px;
          background: transparent;
          color: #cbd5e1;
          font-weight: 500;
          font-size: 0.9rem;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.06);
          color: #f1f5f9;
          border-color: rgba(129,140,248,0.4);
        }
        .btn-primary {
          padding: 0.55rem 1.25rem;
          border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #38bdf8);
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 0 20px rgba(99,102,241,0.35);
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 7rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .hero-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 500px;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, rgba(56,189,248,0.08) 50%, transparent 70%);
          pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute;
          bottom: 0;
          left: 20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(ellipse at center, rgba(192,132,252,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.3);
          font-size: 0.8rem;
          font-weight: 500;
          color: #a5b4fc;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s ease both;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .hero-title {
          font-size: clamp(2.5rem, 7vw, 5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: #94a3b8;
          max-width: 580px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .btn-hero-primary {
          padding: 0.85rem 2rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #38bdf8);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 30px rgba(99,102,241,0.4);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(99,102,241,0.55);
        }
        .btn-hero-secondary {
          padding: 0.85rem 2rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          color: #e2e8f0;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-hero-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(129,140,248,0.4);
          transform: translateY(-2px);
        }

        /* ── Stats ── */
        .stats-section {
          padding: 3rem 2rem;
          display: flex;
          justify-content: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1px;
          max-width: 900px;
          width: 100%;
          background: rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stat-item {
          background: rgba(2,6,23,0.9);
          padding: 2rem 1.5rem;
          text-align: center;
          transition: background 0.2s;
        }
        .stat-item:hover { background: rgba(99,102,241,0.07); }
        .stat-value {
          font-size: 2.2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #818cf8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        /* ── Features ── */
        .features-section {
          padding: 5rem 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-tag {
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 0.75rem;
        }
        .section-title {
          text-align: center;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.75rem;
        }
        .section-sub {
          text-align: center;
          color: #64748b;
          font-size: 1rem;
          max-width: 500px;
          margin: 0 auto 3.5rem;
          line-height: 1.7;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover {
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(99,102,241,0.12);
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          display: block;
        }
        .feature-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #f1f5f9;
        }
        .feature-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* ── CTA Section ── */
        .cta-section {
          padding: 5rem 2rem;
          text-align: center;
        }
        .cta-card {
          max-width: 700px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(56,189,248,0.08));
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 24px;
          padding: 4rem 3rem;
          position: relative;
          overflow: hidden;
        }
        .cta-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .cta-title {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 1rem;
        }
        .cta-sub {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── Footer ── */
        .footer {
          padding: 2rem;
          text-align: center;
          color: #334155;
          font-size: 0.85rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .nav { padding: 1rem; }
          .cta-card { padding: 2.5rem 1.5rem; }
          .btn-hero-primary, .btn-hero-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="nav-logo">⚗️ TestAI</Link>
        <div className="nav-links">
          <Link href="/sign-in" className="btn-ghost">Log In</Link>
          <Link href="/sign-up" className="btn-primary">Sign Up Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-glow-2" />
        <div className="badge">
          <span className="badge-dot" />
          AI-Powered Testing Platform
        </div>
        <h1 className="hero-title">
          Ship Code with<br />
          <span className="gradient-text">Absolute Confidence</span>
        </h1>
        <p className="hero-sub">
          Generate, run, and manage intelligent test suites in seconds. Let AI handle
          the testing so your team can focus on building what matters.
        </p>
        <div className="hero-cta">
          <Link href="/sign-up" className="btn-hero-primary">
            Get Started Free →
          </Link>
          <Link href="/sign-in" className="btn-hero-secondary">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <p className="section-tag">Features</p>
        <h2 className="section-title">Everything you need to test smarter</h2>
        <p className="section-sub">
          From repo connection to full test coverage — automated, intelligent, and blazing fast.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Ready to automate your<br />
            <span className="gradient-text">entire test suite?</span>
          </h2>
          <p className="cta-sub">
            Join hundreds of teams already shipping faster with TestAI.
            No credit card required — start free today.
          </p>
          <div className="hero-cta">
            <Link href="/sign-up" className="btn-hero-primary">
              Create Free Account →
            </Link>
            <Link href="/sign-in" className="btn-hero-secondary">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} TestAI — AI Testing Automation. All rights reserved.
      </footer>
    </>
  );
}
