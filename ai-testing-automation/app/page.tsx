'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Sparkles,
  ArrowRight,
  GitBranch,
  Cpu,
  CheckCircle2,
  Zap,
  Shield,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import Image from 'next/image';
import ThreeHeroCanvas from '@/components/custom/ThreeHeroCanvas';
import ThreeInteractiveOrb from '@/components/custom/ThreeInteractiveOrb';

const features = [
  {
    icon: Sparkles,
    color: 'text-cyan-400',
    borderGlow: 'hover:border-cyan-500/40',
    title: 'Autonomous AI Synthesis',
    desc: 'Deep code analysis that creates exhaustive unit, integration, and E2E test suites with zero manual test authoring.',
  },
  {
    icon: GitBranch,
    color: 'text-indigo-400',
    borderGlow: 'hover:border-indigo-500/40',
    title: 'One-Click GitHub Sync',
    desc: 'Instant webhooks watch commits and PRs. Auto-detect routing changes and generate targeted regression checks.',
  },
  {
    icon: Activity,
    color: 'text-emerald-400',
    borderGlow: 'hover:border-emerald-500/40',
    title: 'Live Analytical Tracking',
    desc: 'Proportional coverage metrics, pass-rate gauges, and execution speed breakdowns in high-definition 3D visualization.',
  },
  {
    icon: Shield,
    color: 'text-amber-400',
    borderGlow: 'hover:border-amber-500/40',
    title: 'Zero False Positives',
    desc: 'Context-aware validation prevents flaky false alarms. Assertions match your exact application business logic.',
  },
  {
    icon: Zap,
    color: 'text-purple-400',
    borderGlow: 'hover:border-purple-500/40',
    title: 'Sub-Second Cloud Execution',
    desc: 'Run distributed test matrices concurrently across headless sandboxes with real-time log streaming.',
  },
  {
    icon: Terminal,
    color: 'text-rose-400',
    borderGlow: 'hover:border-rose-500/40',
    title: 'Multi-Stack Native',
    desc: 'Out-of-the-box support for Next.js, MERN, Python, Java Spring, Golang, C# .NET, and PHP Laravel ecosystems.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect Repository',
    desc: 'Authorize GitHub in one click. Our AI indexes your routes, APIs, models, and view components automatically.',
  },
  {
    number: '02',
    title: 'Synthesize Test Suite',
    desc: 'Specialized language LLMs construct boundary, error, and happy-path test cases tailored to your stack.',
  },
  {
    number: '03',
    title: 'Execute & Automate',
    desc: 'Run full suites in isolated cloud workers with instant diagnostics, session recordings, and pass/fail reports.',
  },
];

const stats = [
  { value: '10x', label: 'Faster Delivery Cycle' },
  { value: '99.8%', label: 'Test Accuracy Rate' },
  { value: '7+', label: 'Tech Stacks Supported' },
  { value: '<1s', label: 'Cloud Latency' },
];

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const orbPlaceholderRef = useRef<HTMLDivElement>(null);
  const earthWrapperRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, isLoaded } = useUser();
  const currentYear = new Date().getFullYear();

  // High-performance direct GPU transform calculation (zero React re-renders during scroll)
  const updateEarthPosition = useCallback(() => {
    if (!earthWrapperRef.current || !orbPlaceholderRef.current) return;

    const scrollY = window.scrollY;
    // Transition smoothly from hero placeholder to viewport center over first 260px
    const progress = Math.min(Math.max(scrollY / 260, 0), 1);

    const rect = orbPlaceholderRef.current.getBoundingClientRect();
    const heroCenterX = rect.left + rect.width / 2;
    const heroCenterY = rect.top + rect.height / 2;

    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // Directly interpolate from hero placeholder to fixed viewport center
    const currentX = heroCenterX + (screenCenterX - heroCenterX) * progress;
    const currentY = heroCenterY + (screenCenterY - heroCenterY) * progress;
    const currentScale = 1 + 0.12 * progress;

    earthWrapperRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${currentScale})`;

    if (badgesRef.current) {
      badgesRef.current.style.opacity = Math.max(1 - progress * 2.5, 0).toString();
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (y > 20 !== prev ? y > 20 : prev));

      if (!ticking) {
        requestAnimationFrame(() => {
          updateEarthPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateEarthPosition();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateEarthPosition);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateEarthPosition);
    };
  }, [updateEarthPosition]);

  useEffect(() => {
    router.prefetch('/workspace');
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace('/workspace');
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/20 overflow-x-hidden w-full max-w-full">
      {/* 3D Three.js Background Starfield Canvas */}
      <ThreeHeroCanvas />

      {/* 3D Earth: Zero-rerender GPU-accelerated fixed container */}
      <div
        ref={earthWrapperRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 15,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
        className="w-[200px] xs:w-[260px] sm:w-[340px] lg:w-[440px] max-w-[85vw] aspect-square flex items-center justify-center select-none"
      >
        <div className="w-full h-full pointer-events-auto">
          <ThreeInteractiveOrb badgesRef={badgesRef} />
        </div>
      </div>

      {/* Modern Glassmorphic Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-8 lg:px-12 py-2.5 sm:py-4 ${
          scrolled
            ? 'bg-[#020617]/85 backdrop-blur-xl border-b border-indigo-500/15 shadow-lg shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-60 blur-xs group-hover:opacity-100 transition duration-300" />
              <Image
                src="/logo.svg"
                alt="Automate-Testing.io"
                width={28}
                height={28}
                className="relative rounded-lg w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
            <span className="font-extrabold text-xs sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-indigo-300 bg-clip-text text-transparent whitespace-nowrap truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
              Automate-Testing
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/sign-in"
              className="px-2 sm:px-3.5 py-1 sm:py-2 text-[11px] sm:text-sm font-semibold text-slate-300 hover:text-white rounded-lg sm:rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-2.5 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-sm font-semibold text-white rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden xs:inline-block" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-24 pb-12 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 px-3 sm:px-8 lg:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center pointer-events-none">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left pointer-events-auto">
            
            {/* Live Indicator Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] sm:text-sm font-semibold tracking-wide shadow-lg shadow-cyan-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>Next-Gen 3D Testing Intelligence</span>
            </div>

            {/* High-Impact Headline */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Ship Quality Code with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Absolute Confidence.
              </span>
            </h1>

            {/* Sub-headline / Value Proposition */}
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Transform raw codebases into production-ready test automation matrices in seconds. Let intelligent AI agents synthesize, execute, and verify your workflows while you stay in flow.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full xs:w-auto">
              <Link
                href="/sign-up"
                className="w-full xs:w-auto px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Automate Free Today</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/workspace"
                className="w-full xs:w-auto px-5 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-slate-200 hover:text-white font-semibold text-xs sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Workspace</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-6 text-[10px] xs:text-[11px] sm:text-xs text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No Credit Card Needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>1,000 Free Credits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Zero Installation</span>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Orb Column Placeholder */}
          <div className="lg:col-span-5 flex justify-center py-2 lg:py-0 pointer-events-none">
            <div
              ref={orbPlaceholderRef}
              className="relative w-[200px] xs:w-[260px] sm:w-[340px] lg:w-[440px] max-w-[85vw] aspect-square opacity-0 pointer-events-none"
            />
          </div>

        </div>
      </section>

      {/* Metrics & Statistics Bar */}
      <section className="relative z-20 py-6 sm:py-12 px-3 sm:px-8 lg:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-1.5 sm:p-4">
              <p className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] xs:text-xs sm:text-sm font-medium text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative z-20 py-10 sm:py-20 px-3 sm:px-8 lg:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Core Architecture
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Engineered for Modern Teams
          </h2>
          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-300 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-xl mx-auto">
            Eliminate hours of repetitive boilerplate unit and integration test coding with automated reasoning models trained on modern web standards.
          </p>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`group relative p-4 sm:p-7 rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 ${item.borderGlow}`}
              >
                <div className="p-2.5 sm:p-3 w-fit rounded-xl bg-slate-800/70 border border-slate-700/50 mb-3.5 sm:mb-5">
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1.5 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 sm:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Pipeline Section */}
      <section className="relative z-20 py-10 sm:py-20 px-3 sm:px-8 lg:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Seamless Workflow
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            From Git Push to Automated Verdict
          </h2>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative p-5 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl"
            >
              <div className="text-2xl sm:text-4xl font-black text-slate-700/80 mb-2 sm:mb-4 font-mono">
                {step.number}
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white mb-1.5 sm:mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 sm:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* High-Impact Call To Action Banner */}
      <section className="relative z-20 py-10 sm:py-20 px-3 sm:px-8 lg:px-12 max-w-5xl mx-auto pointer-events-none">
        <div className="pointer-events-auto relative overflow-hidden p-5 sm:p-14 rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-cyan-950/80 backdrop-blur-2xl text-center shadow-2xl">
          <div className="relative z-10 space-y-3 sm:space-y-5">
            <h2 className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Ready to automate your test suite?
            </h2>
            <p className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Connect your GitHub repository in 60 seconds and experience autonomous AI test synthesis with zero flakiness.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
              >
                <span>Launch Free Account</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Modern Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md py-6 sm:py-10 px-3 sm:px-8 lg:px-12 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <Image src="/logo.svg" alt="Automate-Testing.io" width={22} height={22} className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-bold text-xs sm:text-sm text-slate-300">Automate-Testing.io</span>
            <span className="text-slate-500 text-[10px] sm:text-xs">• &copy; {currentYear} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/parthpandya-qt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/_Parth_Pandya"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-cyan-400 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/in/parth1307"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-blue-400 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="mailto:ppandya573@gmail.com"
              aria-label="Email"
              className="hover:text-slate-200 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}