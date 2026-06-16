export type UserRole = "respondent" | "researcher" | "admin";
export type UserStatus = "PENDING_VERIFICATION" | "VERIFIED" | "PREMIUM";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  ninVerified: boolean;
  livenessVerified: boolean;
  status: UserStatus;
  createdAt?: string;
}

export interface Profile {
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  state?: string;
  occupation?: string;
}

export interface VerificationStatus {
  ninVerified: boolean;
  livenessVerified?: boolean;
  livenessEnabled?: boolean;
  ninLocked?: boolean;
  ninLockedUntil?: string | null;
  retryRemainingMs?: number;
  retryRemainingHours?: number;
  registeredName?: string;
  dateOfBirth?: string | null;
  profileComplete?: boolean;
  cooldownHours?: number;
}

export type QuestionType =
  | "text"
  | "single_choice"
  | "multiple_choice"
  | "number"
  | "rating"
  | "boolean";

export interface Question {
  questionId: string;
  questionText: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  configuration?: Record<string, unknown>;
}

export interface Survey {
  _id: string;
  title: string;
  description: string;
  category?: string;
  researcherId: string;
  targetAudience: "ALL_VERIFIED" | "PREMIUM_ONLY" | "ALL_USERS";
  budget: number;
  platformFee: number;
  totalCost: number;
  payoutPerResponse: number;
  responsesNeeded: number;
  responsesReceived: number;
  status: string;
  billingModel?: "PREPAID" | "PAYG";
  spendingCap?: number;
  amountSpent?: number;
  billingLocked?: boolean;
  billingLockReason?: string;
  questions: Question[];
  estimatedMinutes?: number;
  createdAt: string;
}

export interface Wallet {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
}

export interface Transaction {
  _id: string;
  type: string;
  amount: number;
  reference: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface BankAccount {
  _id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface Answer {
  questionId: string;
  type: string;
  value: unknown;
}
