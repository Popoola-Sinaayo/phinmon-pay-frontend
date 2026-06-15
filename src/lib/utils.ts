import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function calculateSurveyCost(responsesNeeded: number, payoutPerResponse: number, feePercent = 15) {
  const budget = responsesNeeded * payoutPerResponse;
  const platformFee = budget * (feePercent / 100);
  return { budget, platformFee, totalCost: budget + platformFee };
}

export function calculatePerResponseCost(payoutPerResponse: number, feePercent = 15) {
  const platformFee = payoutPerResponse * (feePercent / 100);
  return payoutPerResponse + platformFee;
}
