'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Activity,
  Brain,
  Clock,
  FileText,
  Heart,
  Lock,
  Pill,
  Share2,
  Shield,
  Users,
  ArrowRight,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  UserX,
  RefreshCcw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Reusable animated section wrapper                                  */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard mockup component                                         */
/* ------------------------------------------------------------------ */
function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Glow behind the card */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#6366f1]/20 via-[#22d3ee]/10 to-[#6366f1]/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#12121a] shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-[#1e1e2e] px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
          <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
          <span className="ml-3 text-xs text-[#94a3b8]">
            Helix Health — Dashboard
          </span>
        </div>

        {/* Content */}
        <div className="grid grid-cols-12 gap-4 p-5">
          {/* Sidebar */}
          <div className="col-span-3 hidden space-y-3 md:block">
            {['Timeline', 'Providers', 'Documents', 'Medications', 'Sharing'].map(
              (item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    i === 0
                      ? 'bg-[#6366f1]/20 text-[#6366f1]'
                      : 'text-[#94a3b8] hover:bg-[#1e1e2e]'
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </div>

          {/* Main area */}
          <div className="col-span-12 space-y-4 md:col-span-9">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Providers', value: '6', color: '#6366f1' },
                { label: 'Documents', value: '24', color: '#22d3ee' },
                { label: 'Medications', value: '3', color: '#22c55e' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] p-3"
                >
                  <p className="text-[10px] text-[#94a3b8]">{stat.label}</p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline entries */}
            <div className="space-y-2">
              {[
                {
                  date: 'Feb 18',
                  title: 'Cardiology Follow-up',
                  tag: 'Dr. Patel',
                  tagColor: '#6366f1',
                },
                {
                  date: 'Feb 10',
                  title: 'Blood Panel Results',
                  tag: 'Lab',
                  tagColor: '#22d3ee',
                },
                {
                  date: 'Jan 28',
                  title: 'Primary Care Visit',
                  tag: 'Dr. Chen',
                  tagColor: '#22c55e',
                },
              ].map((entry) => (
                <div
                  key={entry.title}
                  className="flex items-center justify-between rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#94a3b8]">
                      {entry.date}
                    </span>
                    <span className="text-xs font-medium text-[#f8fafc]">
                      {entry.title}
                    </span>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: entry.tagColor + '20',
                      color: entry.tagColor,
                    }}
                  >
                    {entry.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f8fafc]">
      {/* ============================================================ */}
      {/*  NAVBAR                                                       */}
      {/* ============================================================ */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#1e1e2e]/60 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl text-[#6366f1]">&#9877;</span>
            <span className="text-lg font-bold tracking-tight text-[#f8fafc]">
              Helix
            </span>
          </Link>

          {/* Links */}
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'How It Works', 'Security'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366f1]/15 blur-[120px]" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[#22d3ee]/10 blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-[300px] w-[500px] rounded-full bg-[#6366f1]/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1e1e2e] bg-[#12121a]/80 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#22d3ee]" />
              <span className="text-[#94a3b8]">
                Your complete health story, one source of truth.
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto max-w-4xl text-center text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Your health story,{' '}
            <span className="bg-gradient-to-r from-[#6366f1] via-[#22d3ee] to-[#6366f1] bg-clip-text text-transparent">
              finally in one place.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-[#94a3b8] md:text-xl"
          >
            Your specialists work in silos. Your records are scattered across
            portals you can&apos;t access. Helix puts you in control of every
            diagnosis, prescription, and lab result &mdash; in one unified
            timeline.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/25 transition-all hover:bg-[#4f46e5] hover:shadow-xl hover:shadow-[#6366f1]/30"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#12121a]/50 px-7 py-3.5 text-sm font-semibold text-[#f8fafc] backdrop-blur-sm transition-all hover:border-[#6366f1]/40 hover:bg-[#12121a]"
            >
              See How It Works
              <ChevronRight className="h-4 w-4 text-[#94a3b8] transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-16 md:mt-20"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PROBLEM SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#22d3ee]">
              The Problem
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Healthcare is{' '}
              <span className="bg-gradient-to-r from-[#ef4444] to-[#f59e0b] bg-clip-text text-transparent">
                broken by design.
              </span>
            </h2>
            <p className="mt-5 text-lg text-[#94a3b8]">
              Every provider has a piece of your puzzle, but nobody sees the full
              picture.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Pill,
                title: 'Your cardiologist doesn\u2019t know your medications',
                desc: 'Prescriptions clash because providers can\u2019t see what others have prescribed. You\u2019re the only one keeping track\u200a\u2014\u200aif you even know to.',
                color: '#ef4444',
              },
              {
                icon: RefreshCcw,
                title: 'Every new specialist starts from scratch',
                desc: 'You repeat the same history, same allergies, same procedures at every new office. Hours wasted, details lost in translation.',
                color: '#f59e0b',
              },
              {
                icon: AlertTriangle,
                title: 'Critical information gets lost between appointments',
                desc: 'Faxes fail. Portals don\u2019t talk. Lab results sit unseen. When it matters most, the data isn\u2019t there.',
                color: '#22d3ee',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.15}>
                <div className="group h-full rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-8 transition-all hover:border-[#1e1e2e] hover:bg-[#12121a]/80 hover:shadow-lg hover:shadow-[#0a0a0f]/50">
                  <div
                    className="mb-5 inline-flex rounded-xl p-3"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <item.icon
                      className="h-6 w-6"
                      style={{ color: item.color }}
                    />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-[#f8fafc]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#94a3b8]">
                    {item.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section id="how-it-works" className="relative py-24 md:py-32">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366f1]/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#6366f1]">
              How It Works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Three steps to{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">
                clarity.
              </span>
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: Clock,
                title: 'Build your health timeline',
                desc: 'Import records, add visits, upload documents. Helix stitches it all into one chronological story\u200a\u2014\u200aautomatically.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Add your providers',
                desc: 'Connect every specialist, GP, therapist, and pharmacist. Each one gets a profile with their role in your care.',
              },
              {
                step: '03',
                icon: Share2,
                title: 'Share intelligently with one click',
                desc: 'Generate a secure health brief for any appointment. Providers see exactly what they need\u200a\u2014\u200anothing more, nothing less.',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 0.15}>
                <div className="relative h-full rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-8">
                  {/* Step number */}
                  <span className="absolute -top-4 left-6 rounded-full bg-[#6366f1] px-3 py-1 text-xs font-bold text-white">
                    {item.step}
                  </span>

                  <div className="mb-5 mt-2 inline-flex rounded-xl bg-[#6366f1]/10 p-3">
                    <item.icon className="h-6 w-6 text-[#6366f1]" />
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-[#f8fafc]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#94a3b8]">
                    {item.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                     */}
      {/* ============================================================ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#22d3ee]">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#22d3ee] bg-clip-text text-transparent">
                own your health.
              </span>
            </h2>
            <p className="mt-5 text-lg text-[#94a3b8]">
              Built for patients who refuse to be passive participants in their
              own care.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Activity,
                title: 'Unified Timeline',
                desc: 'Every visit, diagnosis, lab result, and prescription in one chronological view. No more jumping between portals.',
                color: '#6366f1',
              },
              {
                icon: Brain,
                title: 'AI Health Briefs',
                desc: 'Generate a concise summary for any provider visit. AI pulls the relevant context so your doctor is caught up in seconds.',
                color: '#22d3ee',
              },
              {
                icon: Lock,
                title: 'Secure Provider Sharing',
                desc: 'Granular access controls let you share specific records with specific providers. Revoke access anytime.',
                color: '#22c55e',
              },
              {
                icon: FileText,
                title: 'Document Storage',
                desc: 'Upload and organize lab reports, imaging, prescriptions, and insurance documents. Everything searchable, always available.',
                color: '#f59e0b',
              },
              {
                icon: Pill,
                title: 'Medication Tracker',
                desc: 'Track every active prescription, dosage, and refill. Get alerts for potential interactions when new meds are added.',
                color: '#ef4444',
              },
              {
                icon: Shield,
                title: 'Emergency Access',
                desc: 'A secure, always-available emergency card with critical allergies, conditions, and medications for first responders.',
                color: '#6366f1',
              },
            ].map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-8 transition-all duration-300 hover:border-[#6366f1]/30 hover:shadow-2xl hover:shadow-[#6366f1]/5">
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(400px circle at top right, ${feature.color}08, transparent 60%)`,
                    }}
                  />

                  <div className="relative">
                    <div
                      className="mb-5 inline-flex rounded-xl p-3"
                      style={{ backgroundColor: feature.color + '15' }}
                    >
                      <feature.icon
                        className="h-6 w-6"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-[#f8fafc]">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#94a3b8]">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS                                                        */}
      {/* ============================================================ */}
      <section className="relative py-24 md:py-32">
        {/* Divider glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22d3ee]/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="rounded-3xl border border-[#1e1e2e] bg-[#12121a] p-10 md:p-16">
              <div className="grid gap-10 md:grid-cols-3">
                {[
                  {
                    stat: '1 in 5',
                    label: 'medication errors occur due to poor care coordination',
                    icon: Pill,
                    color: '#ef4444',
                  },
                  {
                    stat: '4+',
                    label: 'specialists seen by the average patient',
                    icon: UserX,
                    color: '#f59e0b',
                  },
                  {
                    stat: '80%',
                    label: 'of serious medical errors involve communication failures',
                    icon: AlertTriangle,
                    color: '#22d3ee',
                  },
                ].map((item, i) => (
                  <AnimatedSection key={item.stat} delay={i * 0.15}>
                    <div className="text-center">
                      <div
                        className="mx-auto mb-4 inline-flex rounded-xl p-3"
                        style={{ backgroundColor: item.color + '15' }}
                      >
                        <item.icon
                          className="h-6 w-6"
                          style={{ color: item.color }}
                        />
                      </div>
                      <p
                        className="text-4xl font-extrabold tracking-tight md:text-5xl"
                        style={{ color: item.color }}
                      >
                        {item.stat}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
                        {item.label}
                      </p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                          */}
      {/* ============================================================ */}
      <section className="relative py-24 md:py-32">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366f1]/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Own your{' '}
                <span className="bg-gradient-to-r from-[#6366f1] via-[#22d3ee] to-[#6366f1] bg-clip-text text-transparent">
                  health story.
                </span>
              </h2>
              <p className="mt-6 text-lg text-[#94a3b8]">
                Stop being a passenger in your own care. Build your health record,
                control who sees it, and walk into every appointment fully
                prepared.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#6366f1]/25 transition-all hover:bg-[#4f46e5] hover:shadow-xl hover:shadow-[#6366f1]/30"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <p className="text-sm text-[#94a3b8]">
                  No credit card required. Free forever for individuals.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f]">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl text-[#6366f1]">&#9877;</span>
                <span className="text-lg font-bold tracking-tight text-[#f8fafc]">
                  Helix
                </span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
                Patient-owned unified health records. Your data, your control,
                your story.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#f8fafc]">
                Product
              </h4>
              <ul className="space-y-2.5">
                {['Features', 'How It Works', 'Security', 'Pricing'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
                      >
                        {link}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#f8fafc]">
                Company
              </h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-[#f8fafc]">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
                      >
                        {link}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between border-t border-[#1e1e2e] pt-8 md:flex-row">
            <p className="text-xs text-[#94a3b8]">
              &copy; {new Date().getFullYear()} Helix Health. All rights
              reserved.
            </p>
            <div className="mt-4 flex gap-6 md:mt-0">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
