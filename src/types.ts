export type LotteryCategory = 'ALL' | 'LAO' | 'HANOI' | 'STOCK' | 'GLOBAL';

export type LotteryStatus = 'OPEN' | 'CLOSED' | 'DRAWING' | 'SETTLED';

export interface PayoutRates {
  top3: number;        // 3 ตัวบน (e.g. 900)
  tod3: number;        // 3 ตัวโต๊ด (e.g. 130)
  top2: number;        // 2 ตัวบน (e.g. 92)
  bottom2: number;     // 2 ตัวล่าง (e.g. 92)
  runTop: number;      // วิ่งบน (e.g. 3.2)
  runBottom: number;   // วิ่งล่าง (e.g. 4.2)
  powerballJackpot?: number; // US Powerball Jackpot (e.g. 500,000,000)
}

export interface LotteryMarket {
  id: string;
  name: string;
  country: string;
  flag: string;
  category: LotteryCategory;
  closeTime: string; // HH:mm format
  openDays: string; // e.g. "จันทร์, พุธ, ศุกร์" or "ทุกวัน"
  status: LotteryStatus;
  payoutRates: PayoutRates;
  description: string;
  isPowerballType?: boolean;
}

export type BetType = 'top3' | 'tod3' | 'top2' | 'bottom2' | 'runTop' | 'runBottom' | 'powerball';

export interface BetItem {
  id: string;
  digit: string; // e.g. "789", "45", "7" or "05,12,34,56,62 + PB 14"
  betType: BetType;
  amount: number;
  payoutRate: number;
  status: 'PENDING' | 'WIN' | 'LOSE';
  winAmount: number;
}

export interface BetSlip {
  id: string;
  userId: string;
  lotteryId: string;
  lotteryName: string;
  flag: string;
  roundDate: string; // YYYY-MM-DD
  items: BetItem[];
  totalAmount: number;
  totalWinAmount: number;
  status: 'PENDING' | 'SETTLED' | 'CANCELLED';
  createdAt: string;
}

export interface LotteryResult {
  lotteryId: string;
  lotteryName: string;
  flag: string;
  roundDate: string;
  full6Digits: string; // e.g. "849302"
  top3: string;        // e.g. "302"
  bottom2: string;     // e.g. "49"
  top2: string;        // e.g. "02"
  powerballMain?: number[]; // [5, 18, 26, 44, 61]
  powerballSpecial?: number; // 12
  drawnAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'BET' | 'WIN' | 'REFUND' | 'ADMIN_ADJUST';
  amount: number;
  description: string;
  timestamp: string;
}

export interface UserWallet {
  balance: number;
  totalSpent: number;
  totalWon: number;
  transactions: WalletTransaction[];
}

export interface AdminStats {
  totalRevenue: number;
  totalPayout: number;
  netProfit: number;
  totalSlips: number;
  pendingSlips: number;
  wonSlips: number;
}
