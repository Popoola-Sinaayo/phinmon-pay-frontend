"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Clock,
  CreditCard,
  Crown,
  Download,
  Fingerprint,
  GraduationCap,
  LineChart,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  Palette,
  Rocket,
  ScanFace,
  Shield,
  ShieldCheck,
  Smartphone,
  // Star, // re-enable with testimonials section
  Target,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import {
  FadeIn,
  MotionCard,
  StaggerItem,
  StaggerList,
} from "@/components/motion";
import { computeFromTiers, usePricingConfig } from "@/lib/pricingConfig";
// Temporarily disabled  re-enable when we have real data
// import { LiveActivityTicker } from "./LiveActivityTicker";
// import { PartnerMarquee, ResearchTeamsMarquee } from "./PartnerMarquee";
import { PhoneMockup } from "./PhoneMockup";
import { Marquee, SectionLabel, TextReveal } from "./LandingPrimitives";

const WHY_VERIFY = [
  {
    icon: Fingerprint,
    title: "One real person, one account",
    desc: "Every panelist verifies a real NIN, so a respondent can't sign up multiple times to game payouts or skew your data.",
  },
  {
    icon: ShieldCheck,
    title: "Results you can trust",
    desc: "Verified identities mean researchers get validated, representative responses  not noise from duplicate or fake accounts.",
  },
  {
    icon: Lock,
    title: "Privacy by design",
    desc: "We never store your raw NIN. It's hashed and used only to confirm you're real, then discarded  never kept on our systems.",
  },
];

const STEPS = [
  {
    title: "Sign up with email",
    desc: "OTP login  no password to forget. Pick respondent or researcher role.",
    icon: Smartphone,
    time: "60 sec",
  },
  {
    title: "Verify with NIN",
    desc: "One-time identity check via NIMC. Required before tasks or withdrawals.",
    icon: Fingerprint,
    time: "2 min",
  },
  {
    title: "Complete tasks",
    desc: "One question per screen. MCQ, ratings, open text  all on mobile.",
    icon: ClipboardList,
    time: "5–20 min",
  },
  {
    title: "Cash out to bank",
    desc: "Withdraw from ₦1,000 to GTBank, Access, UBA, Zenith & more.",
    icon: Building2,
    time: "Same day",
  },
];

const SURVEY_TYPES = [
  { label: "Market Research", icon: LineChart, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Product Validation", icon: Package, color: "bg-violet-50 text-violet-600 border-violet-100" },
  { label: "Brand Testing", icon: Palette, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { label: "Customer Feedback", icon: MessageSquare, color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  { label: "Startup Validation", icon: Rocket, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { label: "Academic Research", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];

const BENTO_FEATURES = [
  {
    title: "NIN gate on every respondent",
    desc: "No anonymous answers. Every panelist passes NIMC identity verification before their first task.",
    icon: Fingerprint,
    size: "lg",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
  },
  {
    title: "Premium liveness tier",
    desc: "Optional face match unlocks higher-paying studies for researchers who need extra trust.",
    icon: ScanFace,
    size: "sm",
  },
  {
    title: "Fast bank payouts",
    desc: "Fund projects and pay respondents directly to Nigerian bank accounts.",
    icon: CreditCard,
    size: "sm",
  },
  {
    title: "Export clean CSV data",
    desc: "Download per-question responses with respondent metadata. Ready for Excel or SPSS.",
    icon: Download,
    size: "sm",
  },
  {
    title: "Real-time fill tracking",
    desc: "Watch responses roll in live. Pause, extend, or close projects from your dashboard.",
    icon: BarChart3,
    size: "sm",
  },
];

// Testimonials hidden until we have real customer quotes  re-enable with the section below
/*
const TESTIMONIALS = [
  {
    quote:
      "We needed 200 Lagos & Abuja responses for a fintech UX study. Phinmon delivered in 36 hours  every response NIN-verified.",
    name: "Chioma Okonkwo",
    role: "Product Lead · PayFlow",
    location: "Lagos",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    stat: "200 responses · 36 hrs",
  },
  {
    quote:
      "₦85,000 earned in 3 months between lectures. Surveys pay ₦500–₦2,400 and GTBank withdrawals always land same day.",
    name: "Ibrahim Musa",
    role: "Student · Verified Respondent",
    location: "Kano",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    stat: "₦85K earned · 47 surveys",
  },
  {
    quote:
      "Premium tier respondents gave us 40% longer open-ended answers. We run all Nigeria panels through Phinmon now.",
    name: "Adaobi Nwachukwu",
    role: "Research Director · BrandScope",
    location: "Abuja",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    stat: "12 campaigns · 4.9★ avg",
  },
];
*/

const COMPARISON = {
  standard: {
    title: "Standard Panel",
    price: "₦300 – ₦800",
    icon: Shield,
    items: [
      { icon: Fingerprint, text: "NIN verified via NIMC" },
      { icon: MapPin, text: "Demographic targeting by state" },
      { icon: ClipboardList, text: "Standard task access" },
      { icon: Clock, text: "Typical fill: 2–4 days" },
    ],
  },
  premium: {
    title: "Premium Panel",
    price: "₦1,000 – ₦5,000",
    icon: Crown,
    items: [
      { icon: ScanFace, text: "NIN + liveness face match" },
      { icon: Target, text: "Priority task matching" },
      { icon: Lock, text: "Premium-only studies" },
      { icon: Zap, text: "Typical fill: under 24 hrs" },
    ],
  },
};

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  const pricingConfig = usePricingConfig();
  const pricing = computeFromTiers(pricingConfig);

  return (
    <div className="overflow-hidden bg-white">
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative overflow-hidden border-b border-ink-900/[0.06] bg-paper">
        {/* Subtle warm grid  quiet, editorial */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(26,24,21,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,21,0.045) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto grid max-w-landing items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            <SectionLabel icon={Users} text="Nigeria's verified research panel" />

            <h1 className="font-display mt-5 text-[2.75rem] font-medium leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-6xl lg:text-[4rem]">
              <TextReveal text="Earn from tasks." />
              <br />
              <span className="italic text-primary-700">
                <TextReveal text="Trust every response." />
              </span>
            </h1>

            <motion.p
              className="mt-6 max-w-md text-base leading-relaxed text-ink-600 sm:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Phinmon connects researchers with NIN-verified Nigerians. Real identities,
              real payouts, real insights  built for mobile-first Africa.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-3 xs:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/register?role=respondent" className="btn-accent w-full px-7 py-3.5 sm:w-auto">
                  <CircleDollarSign className="h-4 w-4" />
                  Start earning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/register?role=researcher" className="btn-secondary w-full px-7 py-3.5 sm:w-auto">
                  <BarChart3 className="h-4 w-4" />
                  Launch a project
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust chips with real icons */}
            <motion.div
              className="mt-8 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: Fingerprint, label: "NIMC NIN check" },
                { icon: CreditCard, label: "Bank payouts" },
                { icon: MapPin, label: "36 states + FCT" },
                { icon: Lock, label: "NDPR-ready" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-ink-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-600 shadow-subtle"
                >
                  <Icon className="h-3.5 w-3.5 text-primary-600" />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* Completed-surveys activity ticker hidden until real data is available */}
      {/* <LiveActivityTicker /> */}

      {/* ── Why we verify ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-landing px-4 sm:px-6">
          <FadeIn className="text-center">
            <SectionLabel icon={ShieldCheck} text="Why we verify" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
              Verification keeps results real
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              We verify every panelist&apos;s identity so researchers get validated, trustworthy
              results  and respondents are protected. Your NIN is hashed to confirm you&apos;re a real
              person, never stored on our systems.
            </p>
          </FadeIn>

          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_VERIFY.map((item) => (
              <StaggerItem key={item.title}>
                <motion.div
                  className="group h-full rounded-2xl border border-ink-900/[0.07] p-6 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
                  whileHover={{ y: -3 }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* "Integrated with Nigeria's trusted infrastructure" hidden until real partners are confirmed */}
      {/* <PartnerMarquee /> */}

      {/* ── Survey types marquee ── */}
      <section className="border-y border-ink-900/[0.07] py-6">
        <Marquee speed={25}>
          <div className="flex gap-3 px-4">
            {SURVEY_TYPES.map((type) => (
              <div
                key={type.label}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${type.color}`}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </div>
            ))}
          </div>
        </Marquee>
      </section>

      {/* ── How it works  timeline ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-landing px-4 sm:px-6">
          <FadeIn className="text-center">
            <SectionLabel icon={Zap} text="How it works" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
              From signup to bank alert in 4 steps
            </h2>
          </FadeIn>

          <div className="relative mt-16">
            {/* Connecting line  desktop */}
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-paper-200 lg:block" />
            <motion.div
              className="absolute left-0 top-8 hidden h-0.5 origin-left bg-primary-500 lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%" }}
            />

            <StaggerList className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <StaggerItem key={step.title}>
                  <motion.div
                    className="relative text-center lg:text-left"
                    whileHover={{ y: -4 }}
                  >
                    <motion.div
                      className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-ink-900 text-white shadow-lg lg:mx-0"
                      whileInView={{ scale: [0.8, 1.1, 1] }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <step.icon className="h-7 w-7" />
                    </motion.div>
                    <span className="mt-4 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700">
                      {step.time}
                    </span>
                    <h3 className="mt-2 font-bold text-ink-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{step.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </div>
      </section>

      {/* ── Bento feature grid ── */}
      <section className="bg-paper-100 py-20 sm:py-28">
        <div className="mx-auto max-w-landing px-4 sm:px-6">
          <FadeIn>
            <SectionLabel icon={Shield} text="Built for trust" color="secondary" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
              Everything researchers and respondents need
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENTO_FEATURES.map((feat) => (
              <MotionCard
                key={feat.title}
                className={`card-hover overflow-hidden ${
                  feat.size === "lg" ? "sm:col-span-2 lg:row-span-2" : ""
                }`}
                hover
              >
                {feat.image && (
                  <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden sm:h-48">
                    <Image
                      src={feat.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  </div>
                )}
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white"
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <feat.icon className="h-5 w-5" />
                </motion.div>
                <h3 className="mt-4 font-bold text-ink-900">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{feat.desc}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Researcher section ── */}
      <section className="bg-ink-950 py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-landing items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <FadeIn direction="right">
            <SectionLabel icon={BarChart3} text="For researchers" color="amber" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Launch a Nigeria panel study tonight. Fill it by Friday.
            </h2>
            <ul className="mt-8 space-y-4">
              {[
                { icon: Target, text: "Target Standard or Premium verification tiers" },
                { icon: BarChart3, text: "Live dashboard  responses, spend, completion rate" },
                { icon: Download, text: "One-click CSV export with question-level data" },
                { icon: CreditCard, text: "Pay securely — project goes live instantly" },
              ].map(({ icon: Icon, text }) => (
                <motion.li
                  key={text}
                  className="flex items-start gap-3"
                  whileInView={{ x: [20, 0], opacity: [0, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-primary-400" />
                  </div>
                  <span className="pt-1 text-gray-300">{text}</span>
                </motion.li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-8 inline-block">
              <Link href="/register?role=researcher" className="btn-primary">
                Create Research Project <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </FadeIn>

          <FadeIn direction="left">
            <motion.div
              className="rounded-card border border-white/10 bg-ink-900 p-6 shadow-2xl"
              whileInView={{ rotate: [1, 0] }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs text-gray-500">Active project</p>
                  <p className="text-lg font-bold">Brand Pulse Q2 · Lagos</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-primary-500/20 px-3 py-1 text-xs font-bold text-primary-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" />
                  Live
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Responses", value: "187/200", icon: Users },
                  { label: "Spend", value: "₦98K", icon: Wallet },
                  { label: "Fill rate", value: "93.5%", icon: BarChart3 },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl bg-white/[0.06] p-3 text-center">
                    <Icon className="mx-auto h-4 w-4 text-gray-500" />
                    <p className="mt-1 text-lg font-bold">{value}</p>
                    <p className="text-[10px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: "93.5%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Est. 4 hours to completion · Premium tier</p>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* "Research teams collecting insights on Phinmon"  re-enable once we have real teams to feature */}
      {/* <ResearchTeamsMarquee /> */}

      {/* ── Tier comparison ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-landing px-4 sm:px-6">
          <FadeIn className="text-center">
            <SectionLabel icon={Target} text="Audience tiers" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
              Pick the panel quality your study needs
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {(["standard", "premium"] as const).map((tier) => {
              const data = COMPARISON[tier];
              const isPremium = tier === "premium";
              return (
                <MotionCard
                  key={tier}
                  className={`card-hover relative overflow-hidden ${isPremium ? "border-amber-200 ring-1 ring-amber-100" : ""}`}
                >
                  {isPremium && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      <Crown className="h-3 w-3" /> Recommended for high-stakes research
                    </div>
                  )}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-white">
                    <data.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-ink-900">{data.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-primary-600">{data.price} per task</p>
                  <ul className="mt-6 space-y-3">
                    {data.items.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-ink-600">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPremium ? "bg-amber-50 text-amber-600" : "bg-primary-50 text-primary-600"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {text}
                      </li>
                    ))}
                  </ul>
                </MotionCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials  hidden until we have real customer quotes ── */}
      {/* <section className="bg-paper-100 py-20 sm:py-28">
        <div className="mx-auto max-w-landing px-4 sm:px-6">
          <FadeIn className="text-center">
            <SectionLabel icon={Star} text="Testimonials" color="amber" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
              Used by teams across Nigeria
            </h2>
          </FadeIn>

          <StaggerList className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <MotionCard className="card-hover flex h-full flex-col">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 rounded-lg bg-paper-200 px-3 py-2 text-xs font-semibold text-ink-600">
                    {t.stat}
                  </div>
                  <div className="mt-4 flex items-center gap-3 border-t border-ink-900/[0.07] pt-4">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                      <p className="font-semibold text-ink-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" /> {t.location}
                      </p>
                    </div>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section> */}

      {/* ── Pricing ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-landing px-4 sm:px-6">
          <FadeIn className="text-center">
            <SectionLabel icon={CreditCard} text="Pricing" />
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
              Transparent pricing. No subscriptions.
            </h2>
            <p className="mt-3 text-gray-500">
              Cost depends on your number of questions, respondents, and question types  shown before
              you pay. A {pricingConfig.platformFeeRate}% platform fee applies.
            </p>
          </FadeIn>

          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
            {pricing.map((p, i) => (
              <StaggerItem key={p.responses}>
                <MotionCard
                  className={`card-hover relative text-center ${i === 1 ? "border-2 border-primary-500 shadow-glow" : ""}`}
                >
                  {i === 1 && (
                    <motion.span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      Most popular
                    </motion.span>
                  )}
                  <p className="text-4xl font-extrabold text-ink-900">{p.responses}</p>
                  <p className="text-sm text-gray-500">responses · auto-calculated</p>
                  <div className="my-5 space-y-1 border-y border-ink-900/[0.07] py-5 text-sm text-gray-500">
                    <p>Response cost: from ₦{p.budget.toLocaleString()}</p>
                    <p>Platform fee ({pricingConfig.platformFeeRate}%): ₦{p.platformFee.toLocaleString()}</p>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">from</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ₦{p.totalCost.toLocaleString()}
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
                    <Link href="/register?role=researcher" className="btn-secondary w-full">
                      Get started
                    </Link>
                  </motion.div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #1f9d63 0%, transparent 50%), radial-gradient(circle at 80% 50%, #107a4c 0%, transparent 50%)",
            backgroundSize: "100% 100%",
          }}
        />
        <FadeIn className="relative mx-auto max-w-landing px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Ready to earn or launch your first study?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Join 12,400+ verified Nigerians and hundreds of research teams already on Phinmon.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register?role=respondent" className="btn-primary px-10 py-3.5 text-base">
                <CircleDollarSign className="h-4 w-4" /> Start earning
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register?role=researcher" className="inline-flex items-center gap-2 rounded-btn border border-gray-600 px-10 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
                <BarChart3 className="h-4 w-4" /> Create a project
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
