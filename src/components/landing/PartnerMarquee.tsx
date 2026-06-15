"use client";

import { Marquee } from "./LandingPrimitives";

const PARTNERS = [
  { name: "Paystack", abbr: "PS", color: "bg-[#011B33] text-white" },
  { name: "GTBank", abbr: "GT", color: "bg-[#E65100] text-white" },
  { name: "Access Bank", abbr: "AB", color: "bg-[#FF8200] text-white" },
  { name: "Flutterwave", abbr: "FW", color: "bg-[#F5A623] text-gray-900" },
  { name: "NIMC", abbr: "NIN", color: "bg-[#1B4332] text-white" },
  { name: "UBA", abbr: "UBA", color: "bg-[#D71920] text-white" },
  { name: "Zenith Bank", abbr: "ZB", color: "bg-[#E30613] text-white" },
  { name: "Kuda", abbr: "K", color: "bg-[#40196D] text-white" },
];

export function PartnerMarquee() {
  return (
    <div className="bg-white py-8">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
        Integrated with Nigeria&apos;s trusted infrastructure
      </p>
      <Marquee speed={40}>
        <div className="flex items-center gap-10 px-6">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex shrink-0 items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${p.color}`}>
                {p.abbr}
              </div>
              <span className="text-sm font-semibold text-gray-700">{p.name}</span>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}

const RESEARCH_TEAMS = [
  { name: "PayFlow", sector: "Fintech", color: "bg-blue-600" },
  { name: "BrandScope", sector: "Agency", color: "bg-violet-600" },
  { name: "FarmConnect", sector: "AgriTech", color: "bg-green-600" },
  { name: "EduNova", sector: "EdTech", color: "bg-orange-500" },
  { name: "HealthBridge", sector: "HealthTech", color: "bg-teal-600" },
  { name: "RetailIQ", sector: "Retail", color: "bg-rose-600" },
];

export function ResearchTeamsMarquee() {
  return (
    <div className="border-t border-gray-100 bg-gray-50 py-10">
      <p className="mb-6 text-center text-sm font-medium text-gray-500">
        Research teams collecting insights on InsightPay
      </p>
      <Marquee speed={45}>
        <div className="flex gap-8 px-6">
          {RESEARCH_TEAMS.map((team) => (
            <div
              key={team.name}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-subtle"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white ${team.color}`}>
                {team.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{team.name}</p>
                <p className="text-xs text-gray-500">{team.sector}</p>
              </div>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
