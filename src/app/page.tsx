"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { ArrowRight, Code2, Globe2, Zap, Users, Play, ChevronDown, Github, Instagram, Linkedin, Terminal } from 'lucide-react';

/* ─── Cursor Glow (desktop/mouse only) ─────────────── */
function CursorGlow() {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable on touch/mobile — backdrop-blur + cursor glow is expensive on low-end GPUs
    if (window.matchMedia('(pointer: coarse)').matches) { setIsTouch(true); return; }
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  if (isTouch) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 w-64 h-64 rounded-full hidden md:block"
      style={{
        x: sx,
        y: sy,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
      }}
    />
  );
}

/* ─── Animated Counter ───────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Section Title ─────────────────────────────────── */
function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref} className="text-center max-w-3xl mx-auto mb-20">
      <motion.span
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-purple-400 text-sm font-mono tracking-widest uppercase block mb-4"
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-gray-400 leading-relaxed"
      >
        {sub}
      </motion.p>
    </div>
  );
}

/* ─── Feature Card ──────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }: { icon: React.ElementType; title: string; desc: string; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative p-8 rounded-2xl bg-white/4 border border-white/8 backdrop-blur-xl overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at top left, ${color}15 0%, transparent 60%)` }}
      />
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6`} style={{ background: `${color}20` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─── Code Terminal ─────────────────────────────────── */
const codeLines = [
  { code: 'import { useStorage } from "./liveblocks";', color: '#a78bfa' },
  { code: 'const codes = useStorage(root => root.codes);', color: '#34d399' },
  { code: '// Real-time sync active: Dev_412 is typing...', color: '#6b7280', isComment: true },
  { code: 'updatePresence({ isTyping: true });', color: '#60a5fa' },
  // { code: 'setPresence({ css: "Dev_412" });', color: '#f472b6' },
];

function LiveTerminal() {
  const [visible, setVisible] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => {
      setVisible(v => { if (v >= codeLines.length) { clearInterval(t); return v; } return v + 1; });
    }, 600);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <div ref={ref} className="bg-[#0d0d1a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-gray-500 font-mono">collaborative.js</span>
      </div>
      <div className="p-6 font-mono text-sm leading-loose min-h-200px">
        {codeLines.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-4"
          >
            <span className="text-gray-600 w-4 text-right select-none">{i + 1}</span>
            <span style={{ color: line.isComment ? '#6b7280' : line.color }}>{line.code}</span>
          </motion.div>
        ))}
        {visible < codeLines.length && (
          <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-4 bg-purple-400 ml-12" />
        )}
      </div>
    </div>
  );
}

/* ─── Story Step ────────────────────────────────────── */
function StoryStep({ n, title, desc, delay }: { n: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-6 items-start"
    >
      <div className="shrink-0 w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-lg">
        {n}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Static star data (seeded so no hydration mismatch, cheap on mobile) ─── */
const STARS = Array.from({ length: 25 }, (_, i) => ({
  size: (((i * 7 + 3) % 3) * 0.6 + 0.8).toFixed(1),
  top: `${((i * 137.5) % 100).toFixed(2)}%`,
  left: `${((i * 97.3 + 11) % 100).toFixed(2)}%`,
  dur: 2 + (i % 5),
  delay: (i * 0.3) % 4,
}));

/* ─── Tech Stack Data ─────────────────────────────────── */
const TECH: { name: string; cat: 'Frontend' | 'Backend'; color: string }[] = [
  { name: 'Next.js 15', cat: 'Frontend', color: '#ffffff' },
  { name: 'React 19', cat: 'Frontend', color: '#61dafb' },
  { name: 'TypeScript', cat: 'Frontend', color: '#3b82f6' },
  { name: 'Tailwind CSS', cat: 'Frontend', color: '#38bdf8' },
  { name: 'Framer Motion', cat: 'Frontend', color: '#e879f9' },
  { name: 'Monaco Editor', cat: 'Frontend', color: '#0ea5e9' },
  { name: 'Node.js', cat: 'Backend', color: '#4ade80' },
  { name: 'Redis', cat: 'Backend', color: '#d1d5db' },
  { name: 'Liveblocks', cat: 'Backend', color: '#ffffff' },
  { name: 'Judge0 AI', cat: 'Backend', color: '#f59e0b' },
];

/* ─── Page Loader ─────────────────────────────────────── */
function PageLoader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-[#070711]"
    >
      {/* Outer glow orb */}
      <div className="absolute w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        <Image src="/resources/codivirlogo.png" alt="CODIVIR" width={140} height={46} className="object-contain" priority />
        {/* Progress bar */}
        <div className="w-44 h-2px bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-purple-500 via-violet-400 to-pink-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        {/* Pulsing dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.25], ['0%', '-15%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [showNav, setShowNav] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowNav(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = ['Write', 'Sync', 'Ship'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <div ref={containerRef} className="bg-[#070711] text-white overflow-x-hidden">
      <AnimatePresence>
        {!loaded && <PageLoader key="loader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>
      <CursorGlow />

      {/* ── Sticky Nav ── */}
      <AnimatePresence>
        {showNav && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-40 px-8 py-4 flex justify-between items-center backdrop-blur-xl bg-black/40 border-b border-white/5"
          >
            <div className="flex items-center gap-2">
              <Image src="/resources/codivirlogo.png" alt="CODIVIR" width={90} height={30} className="object-contain" />
            </div>
            <Link href="/editor">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition-colors"
              >
                Open Lab →
              </motion.button>
            </Link>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Starfield — static positions (no Math.random in render, avoids hydration mismatch + GPU overdraw on mobile) */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {STARS.map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{ width: s.size, height: s.size, top: s.top, left: s.left }}
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
            />
          ))}
        </div>

        {/* Purple orb */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{ width: 800, height: 800, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-400 text-sm font-mono mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
            </span>
            v2.0 — Live Presence Active Globally
          </motion.div>

          <div className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-2">
            {['Code', ' Together.'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {i === 1 ? (
                  <span className="bg-linear-to-r from-purple-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : word}
              </motion.span>
            ))}
          </div>

          {/* Cycling word */}
          <div className="mt-4 sm:mt-6 flex items-center gap-3 text-xl sm:text-2xl md:text-4xl font-bold text-gray-400">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[wordIdx]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-white"
              >
                {words[wordIdx]}
              </motion.span>
            </AnimatePresence>
            <span>in Real-time with Liveblocks.</span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed px-2"
          >
            A cinematic collaborative coding experience. See your teammate&apos;s cursor. Watch code appear letter-by-letter. Ship together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 items-center"
          >
            <Link href="/editor">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-bold text-base sm:text-lg transition-colors"
              >
                <Play size={18} />
                Launch the Lab
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/10 hover:bg-white/5 font-semibold transition-colors"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll hint — z-20 to stay above orb */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-0 z-20 flex flex-col items-center gap-2 text-gray-600"
        >
          <span className="text-xs font-mono tracking-widest uppercase">scroll to explore</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 sm:py-24 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
          {[
            { n: 5, suffix: 'ms', label: 'Sync Latency' },
            { n: 100, suffix: '+', label: 'Language Support' },
            { n: 99, suffix: '%', label: 'Uptime SLA' },
            { n: 10, suffix: 'k+', label: 'Snippets Shared' },
          ].map(({ n, suffix, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-black text-white mb-2">
                <Counter to={n} suffix={suffix} />
              </div>
              <div className="text-sm text-gray-500 font-mono uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STORY: THE PROBLEM ── */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="01 — The Problem"
          title={<>Collaboration tools were <span className="text-purple-400">built for documents</span>, not code.</>}
          sub="Sharing snippets meant pastes, screenshots, and lag. CODIVIR changes that — with a live, shared environment where code breathes."
        />
        <div className="grid md:grid-cols-2 gap-16 items-center mt-16">
          <div className="space-y-10">
            {[
              { n: '01', title: 'You paste a link. They wait.', desc: "Traditional sharing is dead. By the time your teammate opens the snippet, you've already refactored it twice." },
              { n: '02', title: 'Context collapses.', desc: 'Without seeing who is editing what, conflicts destroy work and trust. Someone always wins. Someone always loses.' },
              { n: '03', title: 'Feedback loops are broken.', desc: 'You review code in PRs, not in real-time. The gap between write and review costs hours every day.' },
            ].map((step, i) => (
              <StoryStep key={step.n} {...step} delay={i * 0.15} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <LiveTerminal />
          </motion.div>
        </div>
      </section>

      {/* ── STORY: THE SOLUTION ── */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 bg-linear-to-b from-purple-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            eyebrow="02 — The Solution"
            title={<>A living, breathing <span className="text-purple-400">shared workspace.</span></>}
            sub="CODIVIR fuses Monaco Editor's power with instant WebSocket sync, producing a platform where ideas become code — together."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Globe2, title: 'Global Presence System', desc: 'See who is typing and in which pane — Google-Docs style name labels float above every cursor.', color: '#a78bfa', delay: 0 },
              { icon: Code2, title: 'Web Trio Layout', desc: 'HTML, CSS, and JS panes live side-by-side with a real-time preview that updates on every keystroke.', color: '#34d399', delay: 0.1 },
              { icon: Zap, title: 'Zero-Latency Liveblocks Sync', desc: 'Powered by Liveblocks — your changes travel at the speed of light to every connected collaborator via optimized storage.', color: '#60a5fa', delay: 0.2 },
              { icon: Users, title: 'Unique User Identities', desc: 'Every session generates a unique Dev_XXX handle so you always know who is in the room with you.', color: '#f472b6', delay: 0.3 },
              { icon: Terminal, title: 'Cross-Language Alerts', desc: 'Working in Python while your teammate edits CSS? Get notified in real-time so nothing slips past you.', color: '#f59e0b', delay: 0.4 },
              { icon: Zap, title: 'Instant Shareable Links', desc: 'One click generates a permanent URL. Share to anyone — they join the live session instantly.', color: '#f87171', delay: 0.5 },
            ].map(feat => (
              <FeatureCard key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW: HOW IT WORKS ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#0a0a1a]/50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            eyebrow="Workflow"
            title={<>Four steps to <span className="text-purple-400">Collaborative Mastery.</span></>}
            sub="CODIVIR is designed to be frictionless. No complex setup, just pure coding synergy."
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Open Lab', desc: 'Launch a new session with a single click. Every session is private and isolated.' },
              { n: '02', title: 'Invite Team', desc: 'Share the unique URL with your teammates. They join the live editor instantly.' },
              { n: '03', title: 'Code & Sync', desc: 'Write code in any language. Watch your teammate\'s cursor and typing indicators in real-time.' },
              { n: '04', title: 'Run & Ship', desc: 'Execute your code on our high-speed Judge0 backend and see the output instantly.' },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-4xl font-black text-purple-500/20 absolute top-4 right-6 select-none">{step.n}</div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA MANIFESTO ── */}
      <section className="py-20 sm:py-40 px-4 sm:px-6 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-60 -right-60 w-600px h-600px rounded-full border border-purple-500/10"
        />
        <motion.div
          animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-60 -left-60 w-700px h-700px rounded-full border border-purple-500/5"
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6 sm:mb-8"
          >
            Stop sharing{' '}
            <span className="bg-linear-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
              screenshots.
            </span>
            <br /> Start coding together.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-gray-400 mb-14 max-w-2xl mx-auto"
          >
            Your next great feature is one shared link away. Open a session, invite your team, and build something extraordinary.
          </motion.p>
          <Link href="/editor">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 60px rgba(124,58,237,0.4)' }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 px-12 py-5 bg-linear-to-r from-purple-600 to-violet-600 rounded-full text-xl font-bold shadow-2xl"
            >
              Open Your Lab <ArrowRight size={22} />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <SectionTitle
            eyebrow="03 — Built With"
            title={<>The stack that powers <span className="text-purple-400">real-time collaboration.</span></>}
            sub="Every tool chosen for a reason. Speed, reliability, and developer experience at every layer."
          />
          {(['Frontend', 'Backend'] as const).map(cat => (
            <div key={cat} className="mb-10">
              <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-4">{cat}</p>
              <div className="flex flex-wrap gap-3">
                {TECH.filter(t => t.cat === cat).map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 20, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3, scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 cursor-default"
                    style={{
                      borderColor: `${t.color}30`,
                      background: `${t.color}0d`,
                      color: t.color,
                      boxShadow: `0 0 0 0 ${t.color}00`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 16px ${t.color}25`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 0 0 ${t.color}00`)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />
                    {t.name}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEVELOPER CARD ── */}
      <section className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            eyebrow="Creator"
            title={<>Built with passion by a <span className="text-purple-400">solo developer.</span></>}
            sub="CODIVIR is a passion project — handcrafted from architecture to animation by one developer who believed collaborative coding deserved better tools."
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xs mx-auto p-6 rounded-2xl bg-white/4 border border-white/10 text-center relative overflow-hidden group"
          >
            {/* subtle hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />

            <div className="relative w-20 h-20 mx-auto mb-4 shrink-0">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 to-pink-500 blur-sm opacity-60" />
              <Image
                src="/resources/Ishaan-Ray.png"
                alt="Ishaan Ray"
                width={80}
                height={80}
                className="relative w-20 h-20 rounded-full object-cover object-top border-2 border-purple-500/50" priority
              />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">Ishaan Ray</h3>
            <p className="text-purple-400 font-mono text-xs mb-5">Full Stack Developer</p>

            <div className="flex justify-center gap-3">
              <motion.a
                href="https://github.com/Cipher-Shadow-IR"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.12, y: -2 }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="GitHub"
              >
                <Github size={16} className="text-gray-300" />
              </motion.a>
              <motion.a
                href="https://instagram.com/i.r.1972k6"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.12, y: -2 }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Instagram"
              >
                <Instagram size={16} className="text-gray-300" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/ishaan-ray-cs"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.12, y: -2 }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={16} className="text-gray-300" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 sm:py-10 px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Image src="/resources/codivirlogo.png" alt="CODIVIR" width={80} height={24} className="object-contain opacity-70" />
        </div>
        <p>© {new Date().getFullYear()} CODIVIR. Real-Time. Collaborative. Open.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/editor" className="hover:text-white transition-colors">Lab</Link>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
      </footer>
    </div>
  );
}
