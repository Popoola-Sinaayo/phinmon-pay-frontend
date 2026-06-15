"use client";

import { Marquee } from "./LandingPrimitives";

const ACTIVITY = [
  { user: "Amaka O.", action: "completed", survey: "Fintech UX Study", amount: "₦750" },
  { user: "Tunde B.", action: "withdrew", survey: "GTBank", amount: "₦8,000" },
  { user: "Fatima A.", action: "verified", survey: "NIN + Liveness", amount: "Premium" },
  { user: "Research Co.", action: "launched", survey: "Brand Pulse Q2", amount: "200 responses" },
  { user: "Emeka C.", action: "completed", survey: "EdTech Survey", amount: "₦500" },
  { user: "Zainab H.", action: "completed", survey: "Premium FMCG Test", amount: "₦2,100" },
];

const ACTION_COLORS: Record<string, string> = {
  completed: "bg-primary-100 text-primary-700",
  withdrew: "bg-secondary-100 text-secondary-700",
  verified: "bg-amber-100 text-amber-800",
  launched: "bg-violet-100 text-violet-700",
};

export function LiveActivityTicker() {
  return (
    <div className="border-y border-gray-100 bg-gray-950 py-3">
      <Marquee speed={35}>
        <div className="flex gap-6 px-4">
          {ACTIVITY.map((item, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-3 rounded-full border border-gray-800 bg-gray-900 px-4 py-1.5"
            >
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ACTION_COLORS[item.action]}`}>
                {item.action}
              </span>
              <span className="text-xs text-gray-300">
                <span className="font-semibold text-white">{item.user}</span>
                {" · "}
                {item.survey}
              </span>
              <span className="text-xs font-bold text-primary-400">{item.amount}</span>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
