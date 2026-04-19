"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Zap,
  Database,
  TerminalSquare,
  ArrowRight,
  Sparkles,
  GitBranch,
  Activity,
  Lock,
  Gauge,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RevealText } from "@/components/ui/RevealText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { AutoFixSimulator } from "@/components/landing/widgets/AutoFixSimulator";
import { SystemHealthRadar } from "@/components/landing/widgets/SystemHealthRadar";
import { DeepMemoryNetwork } from "@/components/landing/widgets/DeepMemoryNetwork";
import { OperationalTerminal } from "@/components/landing/widgets/OperationalTerminal";

const features = [
  {
    name: "AI-Powered AutoFix",
    description:
      "Detect incidents and ship patches autonomously — before your pager fires.",
    icon: Zap,
    component: AutoFixSimulator,
    size: "lg",
  },
  {
    name: "Deep Memory Context",
    description:
      "Every PR, postmortem, and architecture call — indexed and recall-ready.",
    icon: Database,
    component: DeepMemoryNetwork,
    size: "sm",
  },
  {
    name: "Intelligent Triage",
    description:
      "Severity scoring trained on your incident history. No more alert fatigue.",
    icon: Shield,
    component: SystemHealthRadar,
    size: "sm",
  },
  {
    name: "Operational Feed",
    description:
      "Transparent, real-time trace of every decision Nexus makes on your stack.",
    icon: TerminalSquare,
    component: OperationalTerminal,
    size: "md",
  },
];

const metrics = [
  { value: "92%", label: "Incidents auto-resolved" },
  { value: "4.2m", label: "Mean time to patch" },
  { value: "18×", label: "Faster triage vs. manual" },
  { value: "99.98%", label: "Platform uptime SLA" },
];

const logos = [
  "VERCEL",
  "LINEAR",
  "STRIPE",
  "DATADOG",
  "SUPABASE",
  "RAILWAY",
  "CLOUDFLARE",
];

const workflow = [
  {
    step: "01",
    title: "Ingest",
    body: "Stream logs, traces, and Git history into Nexus. Zero-config adapters for 40+ sources.",
    icon: Activity,
  },
  {
    step: "02",
    title: "Reason",
    body: "Deep-context model correlates symptoms to root cause using your codebase history.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Resolve",
    body: "Nexus drafts a PR, runs the test suite, and ships — with human-in-the-loop gates.",
    icon: GitBranch,
  },
];

const faqs = [
  {
    question: "How does the AutoFix Engine intercept production errors?",
    answer:
      "Nexus integrates directly into your logging cluster. When an anomaly is detected, the engine cross-references your entire GitHub history to propose a high-confidence root-cause patch within seconds.",
  },
  {
    question: "Is Nexus compliant with SOC2 and enterprise security?",
    answer:
      "Yes. The architecture evaluates telemetry metadata without exposing raw PII or secrets. Enterprise deployments are fully self-hostable on your VPC.",
  },
  {
    question: "Do you support Bitbucket and GitLab?",
    answer:
      "Deep GitHub integration ships natively with v2. GitLab and Bitbucket are in private beta for enterprise tier — contact sales for access.",
  },
  {
    question: "What models power Nexus reasoning?",
    answer:
      "A multi-model routing layer over frontier LLMs plus a fine-tuned severity classifier. You can also bring your own keys (Anthropic, OpenAI, Bedrock).",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yHeroText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacityShader = useTransform(scrollYProgress, [0, 0.5], [1, 0.2]);

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden selection:bg-nexus-primary/30 selection:text-white">
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-nexus-primary focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Scroll Progress Bar */}
      <motion.div
        role="progressbar"
        aria-label="Page scroll progress"
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-nexus-primary via-blue-400 to-nexus-primary z-[100] origin-left motion-reduce:hidden"
        style={{ scaleX }}
      />

      <Navbar />

      <main id="main">
      {/* ============ HERO (Centered, Dashboard-forward) ============ */}
      <section
        ref={containerRef}
        className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden"
      >
        {/* Ambient gradient field */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: opacityShader, y: yBg }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[70%] bg-nexus-primary/20 blur-[160px] rounded-full" />
          <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[140px] rounded-full" />
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[#C9B6FF]/10 blur-[140px] rounded-full" />
        </motion.div>

        {/* Dotted grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        />

        {/* Top fade */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-bg-base to-transparent z-0"
        />

        <motion.div
          style={{ y: yHeroText }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          {/* Release pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="#features"
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm text-text-secondary text-[11px] font-medium tracking-wide mb-10 hover:border-nexus-primary/40 hover:bg-white/[0.07] transition-colors"
            >
              <span className="px-1.5 py-0.5 rounded-full bg-nexus-primary/15 text-nexus-primary text-[10px] font-semibold tracking-wider">
                NEW
              </span>
              Nexus v2.4 — autonomous PR drafting now GA
              <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden">
            <RevealText>
              <h1 className="text-[40px] sm:text-6xl lg:text-[84px] font-semibold text-white tracking-[-0.035em] leading-[0.95] mb-6">
                The autopilot for
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-nexus-primary to-blue-400">
                    production incidents.
                  </span>
                  <svg
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-3 w-full h-3 opacity-60"
                    viewBox="0 0 400 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 Q 100 2 200 6 T 398 5"
                      stroke="url(#hg)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="hg" x1="0" x2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
            </RevealText>
          </div>

          <RevealText delay={0.15}>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed mb-10">
              Nexus watches your logs, correlates failures against your
              codebase, and ships the fix. Your on-call rotation just got a
              senior engineer that never sleeps.
            </p>
          </RevealText>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-white bg-nexus-primary hover:bg-nexus-hover transition-all rounded-lg shadow-[0_10px_40px_-10px_rgba(139,92,246,0.6)]"
            >
              Deploy Nexus free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-white bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all rounded-lg backdrop-blur-sm"
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-nexus-primary/30 transition-colors">
                <span className="block w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-white ml-0.5" />
              </span>
              Watch 90-sec demo
            </Link>
          </motion.div>


        </motion.div>

        {/* ========== Dashboard preview ========== */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-20 lg:mt-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Glow halo */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-10 -top-10 h-[60%] bg-gradient-to-b from-nexus-primary/30 via-blue-500/10 to-transparent blur-3xl opacity-60"
          />

          <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-[0_40px_120px_-20px_rgba(139,92,246,0.35)]">
            <div className="rounded-[15px] bg-[#0A0A0F]/95 backdrop-blur-2xl overflow-hidden border border-white/5">
              {/* Browser chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/15" />
                  <div className="w-3 h-3 rounded-full bg-white/15" />
                  <div className="w-3 h-3 rounded-full bg-white/15" />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/5 text-[11px] text-text-muted font-mono">
                  <Lock className="w-3 h-3" />
                  app.nexusops.io/incidents
                </div>
                <span className="text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Dashboard body */}
              <div className="grid grid-cols-12 gap-0 min-h-[380px] lg:min-h-[460px]">
                {/* Sidebar */}
                <aside className="hidden md:flex col-span-2 flex-col gap-1 p-4 border-r border-white/5 bg-white/[0.015]">
                  {[
                    { label: "Overview", active: false },
                    { label: "Incidents", active: true },
                    { label: "AutoFix", active: false },
                    { label: "Memory", active: false },
                    { label: "Settings", active: false },
                  ].map((i) => (
                    <div
                      key={i.label}
                      className={`text-[11px] px-2.5 py-1.5 rounded-md ${
                        i.active
                          ? "bg-nexus-primary/15 text-white border border-nexus-primary/30"
                          : "text-text-muted"
                      }`}
                    >
                      {i.label}
                    </div>
                  ))}
                </aside>

                {/* Main panel */}
                <div className="col-span-12 md:col-span-10 p-5 lg:p-7 flex flex-col gap-5">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { k: "Open incidents", v: "3", sub: "-2 vs yesterday", tone: "text-emerald-400" },
                      { k: "Auto-resolved", v: "47", sub: "+12% this week", tone: "text-nexus-primary" },
                      { k: "MTTR", v: "4m 12s", sub: "-38% MoM", tone: "text-emerald-400" },
                      { k: "PRs shipped", v: "128", sub: "18 today", tone: "text-blue-400" },
                    ].map((m) => (
                      <div
                        key={m.k}
                        className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                      >
                        <div className="text-[10px] uppercase tracking-wider text-text-muted">
                          {m.k}
                        </div>
                        <div className="text-xl font-semibold text-white mt-0.5">
                          {m.v}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${m.tone}`}>
                          {m.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Incidents table */}
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-nexus-primary" />
                        <span className="text-xs font-medium text-white">
                          Recent incidents
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono">
                        auto-refresh · 5s
                      </span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {[
                        {
                          id: "INC-4821",
                          title: "Prisma query timeout on /users/:id",
                          sev: "P1",
                          sevClr: "bg-red-500/15 text-red-400 border-red-500/30",
                          status: "AutoFix running",
                          statusClr: "text-nexus-primary",
                          time: "12s ago",
                          highlight: true,
                        },
                        {
                          id: "INC-4820",
                          title: "OOM on worker-queue-3",
                          sev: "P2",
                          sevClr: "bg-orange-500/15 text-orange-400 border-orange-500/30",
                          status: "PR #4819 merged",
                          statusClr: "text-emerald-400",
                          time: "4m ago",
                        },
                        {
                          id: "INC-4817",
                          title: "429 spike from Stripe webhook",
                          sev: "P3",
                          sevClr: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
                          status: "Resolved",
                          statusClr: "text-text-muted",
                          time: "22m ago",
                        },
                        {
                          id: "INC-4812",
                          title: "Cache stampede — redis/session",
                          sev: "P2",
                          sevClr: "bg-orange-500/15 text-orange-400 border-orange-500/30",
                          status: "Resolved",
                          statusClr: "text-text-muted",
                          time: "1h ago",
                        },
                      ].map((row, idx) => (
                        <motion.div
                          key={row.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + idx * 0.08 }}
                          className={`flex items-center gap-4 px-4 py-3 text-[12px] ${
                            row.highlight ? "bg-nexus-primary/[0.04]" : ""
                          }`}
                        >
                          <span className="font-mono text-text-muted w-16 shrink-0">
                            {row.id}
                          </span>
                          <span
                            className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${row.sevClr}`}
                          >
                            {row.sev}
                          </span>
                          <span className="flex-1 text-white/90 truncate">
                            {row.title}
                          </span>
                          <span
                            className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] ${row.statusClr}`}
                          >
                            {row.highlight && (
                              <span className="w-1.5 h-1.5 rounded-full bg-nexus-primary animate-pulse" />
                            )}
                            {row.status}
                          </span>
                          <span className="hidden lg:block text-[11px] text-text-muted w-16 text-right shrink-0 font-mono">
                            {row.time}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating PR toast */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="absolute -bottom-6 right-8 lg:right-16 hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0F] border border-nexus-primary/30 shadow-[0_20px_60px_-10px_rgba(139,92,246,0.5)]"
          >
            <div className="w-8 h-8 rounded-lg bg-nexus-primary/15 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-nexus-primary" />
            </div>
            <div>
              <div className="text-xs font-medium text-white">
                PR #4821 opened
              </div>
              <div className="text-[10px] text-text-muted">
                fix: handle prisma timeout on user lookup
              </div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============ LOGO MARQUEE ============ */}
      <section className="relative z-10 border-y border-white/5 bg-bg-base/50 backdrop-blur-sm py-10 overflow-hidden">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-text-muted mb-6">
          Trusted by engineering teams that ship at scale
        </p>
        <div className="relative" aria-hidden="true">
          <div className="flex gap-16 animate-[scroll_40s_linear_infinite] motion-reduce:animate-none whitespace-nowrap">
            {[...logos, ...logos, ...logos].map((l, i) => (
              <span
                key={i}
                className="text-2xl font-semibold tracking-[0.25em] text-white/30 hover:text-white/60 transition-colors"
              >
                {l}
              </span>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-base to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-base to-transparent pointer-events-none" />
        </div>
        <style jsx>{`
          @keyframes scroll {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </section>

      {/* ============ METRICS ============ */}
      <section className="relative z-10 py-24 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-bg-base p-8 lg:p-10 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="text-4xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-nexus-primary tracking-tight mb-2">
                  {m.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-text-muted group-hover:text-text-secondary transition-colors">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES (Bento) ============ */}
      <div
        id="features"
        className="py-32 bg-bg-base relative z-10 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-20"
          >
            <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-nexus-primary mb-4">
              Platform
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white tracking-[-0.02em] mb-5">
              Every capability a staff SRE
              <br />
              <span className="text-text-secondary">wished they had.</span>
            </h2>
            <p className="text-base text-text-secondary leading-relaxed max-w-xl">
              A focused surface of tools that compound. Nexus is opinionated
              where it matters, and invisible where it shouldn't.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: [0.33, 1, 0.68, 1],
                }}
                className={`
                  rounded-2xl p-px bg-gradient-to-b from-white/10 to-white/[0.02] hover:from-nexus-primary/40 hover:to-transparent transition-all duration-500 group
                  ${feature.size === "lg" ? "md:col-span-6 lg:col-span-8" : ""}
                  ${feature.size === "md" ? "md:col-span-3 lg:col-span-4" : ""}
                  ${feature.size === "sm" ? "md:col-span-3 lg:col-span-4" : ""}
                `}
              >
                <div className="relative h-full rounded-[15px] bg-bg-surface overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-b from-nexus-primary/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col h-full p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center bg-white/[0.03] group-hover:border-nexus-primary/40 group-hover:bg-nexus-primary/10 transition-all duration-300">
                        <feature.icon className="w-[18px] h-[18px] text-nexus-primary/90 group-hover:text-nexus-primary transition-colors" />
                      </div>
                      <span className="text-text-muted font-mono text-[10px] tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                        /{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-md">
                      {feature.description}
                    </p>

                    <div className="mt-auto flex-1 rounded-lg overflow-hidden border border-white/5 bg-black/30 min-h-[180px]">
                      <feature.component />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ WORKFLOW ============ */}
      <section className="relative z-10 py-32 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-nexus-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-nexus-primary mb-4">
              How it works
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white tracking-[-0.02em]">
              From alert to merged PR in under 5 minutes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[72px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-nexus-primary/40 to-transparent" />
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative p-8 rounded-2xl bg-bg-surface border border-white/5 hover:border-nexus-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-11 h-11 rounded-xl bg-nexus-primary/10 border border-nexus-primary/20 flex items-center justify-center">
                    <w.icon className="w-[18px] h-[18px] text-nexus-primary" />
                  </div>
                  <span className="font-mono text-xs tracking-widest text-nexus-primary/80">
                    STEP {w.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {w.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {w.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LIVE OPS THEATER — unique widgets ============ */}
      <section className="relative z-10 py-32 border-b border-white/5 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)] pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-nexus-primary mb-4">
              Live Ops Theater
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white tracking-[-0.02em]">
              Watch Nexus think in real time.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SignalMeshWidget />
            <IncidentHeatwaveWidget />
            <PatchVelocityWidget />
          </div>
        </div>
      </section>

      {/* ============ SECURITY BAND ============ */}
      <section className="relative z-10 py-24 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
          {[
            {
              icon: Lock,
              title: "SOC2 + ISO 27001",
              body: "Audited controls, encrypted at rest and in transit, scoped API keys.",
            },
            {
              icon: Gauge,
              title: "Self-hostable",
              body: "Deploy inside your VPC. Your telemetry never leaves your perimeter.",
            },
            {
              icon: Shield,
              title: "Human-in-the-loop",
              body: "Every autonomous action is reviewable, approvable, and revertible.",
            },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-nexus-primary/10 border border-nexus-primary/20 flex items-center justify-center">
                <s.icon className="w-[18px] h-[18px] text-nexus-primary" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1.5">{s.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section
        id="faq"
        className="py-32 relative z-10 border-b border-white/5 bg-bg-base overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nexus-primary/5 via-transparent to-transparent z-0 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 grid md:grid-cols-[1fr_2fr] gap-16">
          <div>
            <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-nexus-primary mb-4">
              FAQ
            </span>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-[-0.02em] mb-4">
              Answers before you ask.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Still curious? Our team is in your Slack the moment you start a
              trial.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-white/10 border-b"
              >
                <AccordionTrigger className="text-left text-white hover:text-nexus-primary hover:no-underline transition-colors py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary leading-relaxed pt-1 pb-6 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative z-10 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexus-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl lg:text-6xl font-semibold text-white tracking-[-0.02em] mb-6"
          >
            Stop babysitting{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-primary to-blue-400">
              production.
            </span>
          </motion.h2>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            Give your on-call rotation back their weekends. 14 days free, no
            credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-white bg-nexus-primary hover:bg-nexus-hover transition-all rounded-lg shadow-[0_8px_40px_rgba(139,92,246,0.45)]"
            >
              Deploy Nexus
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-white bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all rounded-lg"
            >
              Talk to an engineer
            </Link>
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}

/* ================= UNIQUE WIDGETS ================= */

function WidgetShell({
  label,
  title,
  subtitle,
  children,
}: {
  label: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/15 via-white/[0.04] to-transparent hover:from-nexus-primary/50 transition-all duration-500 group">
      <div className="relative h-full rounded-[15px] bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/5 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-nexus-primary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        <div className="relative p-5 flex flex-col h-full min-h-[340px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-nexus-primary/80">
              {label}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              streaming
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-xs text-text-secondary mb-5">{subtitle}</p>
          <div className="flex-1 relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* 1. Signal Mesh — animated SVG graph */
function SignalMeshWidget() {
  const nodes = [
    { id: "api", x: 50, y: 50, label: "API" },
    { id: "db", x: 180, y: 30, label: "DB" },
    { id: "cache", x: 180, y: 130, label: "CACHE" },
    { id: "worker", x: 300, y: 80, label: "WORKER" },
    { id: "queue", x: 300, y: 180, label: "QUEUE" },
    { id: "core", x: 160, y: 220, label: "CORE" },
  ];
  const edges: [string, string][] = [
    ["api", "db"],
    ["api", "cache"],
    ["db", "worker"],
    ["cache", "worker"],
    ["worker", "queue"],
    ["api", "core"],
    ["core", "queue"],
  ];
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <WidgetShell
      label="WIDGET_01 / MESH"
      title="Signal Mesh"
      subtitle="Live service topology — packet-level trace."
    >
      <svg viewBox="0 0 360 260" className="w-full h-full">
        <defs>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edgeGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {edges.map(([a, b], i) => {
          const na = pos[a];
          const nb = pos[b];
          return (
            <g key={`${a}-${b}`}>
              <line
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <motion.circle
                r="2.5"
                fill="#8B5CF6"
                initial={{ cx: na.x, cy: na.y, opacity: 0 }}
                animate={{
                  cx: [na.x, nb.x],
                  cy: [na.y, nb.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "linear",
                }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="22" fill="url(#nodeGlow)" opacity="0.4" />
            <motion.circle
              cx={n.x}
              cy={n.y}
              r="7"
              fill="#0A0A0F"
              stroke="#8B5CF6"
              strokeWidth="1.5"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            />
            <text
              x={n.x}
              y={n.y + 22}
              textAnchor="middle"
              className="fill-white/60 text-[9px] font-mono tracking-wider"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-mono text-text-muted border-t border-white/5 pt-3">
        <span>6 services</span>
        <span className="text-emerald-400">0 anomalies</span>
        <span>p99 · 42ms</span>
      </div>
    </WidgetShell>
  );
}

/* 2. Incident Heatwave — grid of pulsing cells */
function IncidentHeatwaveWidget() {
  const cols = 18;
  const rows = 7;
  const cells = Array.from({ length: cols * rows });

  const hotspots = [
    { idx: 3 * cols + 4, delay: 0 },
    { idx: 1 * cols + 11, delay: 0.6 },
    { idx: 5 * cols + 9, delay: 1.2 },
    { idx: 2 * cols + 15, delay: 1.8 },
    { idx: 4 * cols + 2, delay: 2.4 },
  ];
  const hotMap = new Map(hotspots.map((h) => [h.idx, h.delay]));

  return (
    <WidgetShell
      label="WIDGET_02 / HEAT"
      title="Incident Heatwave"
      subtitle="Severity by service × time — last 7 days."
    >
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((_, i) => {
          const isHot = hotMap.has(i);
          const delay = hotMap.get(i) ?? 0;
          const base = Math.random() > 0.82 ? 0.18 : 0.06;
          return (
            <motion.div
              key={i}
              className="aspect-square rounded-[2px]"
              style={{ background: `rgba(139,92,246,${base})` }}
              animate={
                isHot
                  ? {
                      backgroundColor: [
                        "rgba(239,68,68,0.15)",
                        "rgba(239,68,68,0.9)",
                        "rgba(139,92,246,0.3)",
                        "rgba(139,92,246,0.08)",
                      ],
                      scale: [1, 1.15, 1, 1],
                    }
                  : {}
              }
              transition={
                isHot
                  ? { duration: 3, repeat: Infinity, delay }
                  : {}
              }
            />
          );
        })}
      </div>

      <div className="mt-5 space-y-2">
        {[
          { label: "auth-svc", val: 92, tone: "bg-red-500/70" },
          { label: "orders-api", val: 64, tone: "bg-orange-500/70" },
          { label: "billing", val: 38, tone: "bg-nexus-primary/70" },
        ].map((r, i) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-text-muted w-16 shrink-0">
              {r.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full ${r.tone}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${r.val}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/70 w-8 text-right">
              {r.val}
            </span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

/* 3. Patch Velocity — radial + ticker */
function PatchVelocityWidget() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1800);
    return () => clearInterval(t);
  }, []);

  const feed = [
    { time: "00:12", msg: "PR #4821 · prisma timeout", ok: true },
    { time: "00:38", msg: "PR #4819 · OOM worker-3", ok: true },
    { time: "01:04", msg: "PR #4815 · null-check /users", ok: true },
    { time: "01:27", msg: "PR #4811 · retry stripe-hook", ok: true },
    { time: "01:52", msg: "PR #4808 · redis stampede", ok: true },
  ];

  const radius = 48;
  const circ = 2 * Math.PI * radius;
  const progress = 0.78;

  return (
    <WidgetShell
      label="WIDGET_03 / VELOCITY"
      title="Patch Velocity"
      subtitle="Autonomous PR throughput — last 60 min."
    >
      <div className="flex items-center gap-5">
        {/* Radial */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              fill="none"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#velGrad)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              whileInView={{ strokeDashoffset: circ * (1 - progress) }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="velGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-white tracking-tight">
              78
              <span className="text-base text-text-muted">%</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-text-muted mt-0.5">
              auto-merged
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              PRs / hr
            </div>
            <div className="text-2xl font-semibold text-white">
              12.4
              <span className="text-xs text-emerald-400 ml-1.5">↑ 2.1</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-text-muted">
              avg ship time
            </div>
            <div className="text-2xl font-semibold text-white">
              4m
              <span className="text-xs text-text-muted ml-1">12s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {feed
            .slice(tick % feed.length, (tick % feed.length) + 3)
            .concat(feed.slice(0, Math.max(0, ((tick % feed.length) + 3) - feed.length)))
            .slice(0, 3)
            .map((f, i) => (
              <motion.div
                key={`${tick}-${i}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1 - i * 0.3, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 text-[10px] font-mono"
              >
                <span className="text-text-muted">{f.time}</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-white/80 truncate">{f.msg}</span>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </WidgetShell>
  );
}
