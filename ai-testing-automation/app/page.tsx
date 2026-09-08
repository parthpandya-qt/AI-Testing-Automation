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
  { value: '< 1s', label: 'Cloud Execution Latency' },
];

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroPos, setHeroPos] = useState({ x: 0, y: 0 });
  const [windowDims, setWindowDims] = useState({ w: 0, h: 0 });
  const orbPlaceholderRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, isLoaded } = useUser();
  const currentYear = new Date().getFullYear();

  // Measure initial hero column position and viewport dimensions
  const updateMeasurements = useCallback(() => {
    if (typeof window === 'undefined') return;
    setWindowDims({ w: window.innerWidth, h: window.innerHeight });
    if (!orbPlaceholderRef.current) return;
    const rect = orbPlaceholderRef.current.getBoundingClientRect();
    setHeroPos({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY + rect.height / 2,
    });
  }, []);

  useEffect(() => {
    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, [updateMeasurements]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      // Smoothly transition from hero position to viewport center over first 260px
      const progress = Math.min(Math.max(y / 260, 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    router.prefetch('/workspace');
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace('/workspace');
    }
  }, [isSignedIn, isLoaded, router]);

  // Calculate viewport center
  const screenCenterX = windowDims.w ? windowDims.w / 2 : 0;
  const screenCenterY = windowDims.h ? windowDims.h / 2 : 0;
  const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  const heroViewportY = heroPos.y - currentScrollY;

  // Once scrollProgress reaches 1, currentX and currentY stay at screenCenterX and screenCenterY throughout the entire page
  const currentX = heroPos.x
    ? heroPos.x + (screenCenterX - heroPos.x) * scrollProgress
    : screenCenterX;
  const currentY = heroPos.y
    ? heroViewportY + (screenCenterY - heroViewportY) * scrollProgress
    : screenCenterY;

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/20 overflow-x-hidden">
      {/* 3D Three.js Background Starfield Canvas */}
      <ThreeHeroCanvas />

      {/* 3D Earth: Transitions from Hero Right to Viewport Center and Remains Fixed in Center Throughout Page */}
      <div
        style={{
          position: 'fixed',
          left: `${currentX}px`,
          top: `${currentY}px`,
          transform: `translate(-50%, -50%) scale(${1 + 0.12 * scrollProgress})`,
          zIndex: 15,
          pointerEvents: 'none',
          transition: 'transform 0.12s ease-out',
        }}
        className="w-full max-w-[440px] aspect-square flex items-center justify-center select-none"
      >
        <div className="w-full h-full pointer-events-auto">
          <ThreeInteractiveOrb scrollProgress={scrollProgress} />
        </div>
      </div>

      {/* Modern Glassmorphic Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 sm:px-12 py-4 flex items-center justify-between ${
          scrolled
            ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-indigo-500/15 shadow-lg shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-60 blur-xs group-hover:opacity-100 transition duration-300" />
            <Image
              src="/logo.svg"
              alt="Automate-Testing.io"
              width={34}
              height={34}
              className="relative rounded-lg"
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
            Automate-Testing.io
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 sm:px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 sm:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pointer-events-none">
          
          {/* Left Hero Text Column */}
          <div
            style={{
              opacity: 1 - scrollProgress * 0.45,
              transform: `translateY(${-scrollProgress * 20}px)`,
              transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
            }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left will-change-transform pointer-events-auto"
          >
            {/* Live 3D Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>Next-Gen 3D Testing Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Ship Quality Code with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Absolute Confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Transform raw codebases into production-ready test automation matrices in seconds. Let intelligent AI agents synthesize, execute, and verify your workflows while you stay in flow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Automate Free Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-in"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800/60 backdrop-blur-md text-slate-200 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Explore Workspace</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>1,000 Free Test Credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Zero Installation</span>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Orb Column Placeholder (keeps hero layout intact) */}
          <div className="lg:col-span-5 flex justify-center pointer-events-none">
            <div
              ref={orbPlaceholderRef}
              className="relative w-full max-w-[420px] aspect-square opacity-0 pointer-events-none"
            />
          </div>

        </div>
      </section>

      {/* Metrics & Statistics Bar */}
      <section className="relative z-20 py-12 px-6 sm:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <p className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative z-20 py-20 px-6 sm:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Core Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Engineered for Modern Teams
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            Eliminate hours of repetitive boilerplate unit and integration test coding with automated reasoning models trained on modern web standards.
          </p>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`group relative p-7 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 ${item.borderGlow}`}
              >
                <div className="p-3 w-fit rounded-xl bg-slate-800/70 border border-slate-700/50 mb-5">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Pipeline Section */}
      <section className="relative z-20 py-20 px-6 sm:px-12 max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Seamless Workflow
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            From Git Push to Automated Verdict
          </h2>
        </div>

        <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl"
            >
              <div className="text-4xl font-black text-slate-700/80 mb-4 font-mono">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* High-Impact Call To Action Banner */}
      <section className="relative z-20 py-20 px-6 sm:px-12 max-w-5xl mx-auto pointer-events-none">
        <div className="pointer-events-auto relative overflow-hidden p-10 sm:p-14 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-cyan-950/60 backdrop-blur-2xl text-center shadow-2xl">
          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Ready to automate your test suite?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Connect your GitHub repository in 60 seconds and experience autonomous AI test synthesis with zero flakiness.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Launch Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Modern Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-10 px-6 sm:px-12 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Automate-Testing.io" width={24} height={24} />
            <span className="font-bold text-sm text-slate-300">Automate-Testing.io</span>
            <span className="text-slate-600 text-xs">• &copy; {currentYear} All rights reserved.</span>
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