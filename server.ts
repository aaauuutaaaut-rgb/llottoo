import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_LOTTERIES } from './src/data/initialLotteries';
import { LotteryMarket, BetSlip, LotteryResult, UserWallet, BetItem } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for Simulation State
let lotteries: LotteryMarket[] = JSON.parse(JSON.stringify(INITIAL_LOTTERIES));

let userWallet: UserWallet = {
  balance: 50000, // Default wallet balance 50,000 THB
  totalSpent: 0,
  totalWon: 0,
  transactions: [
    {
      id: 'tx-init',
      type: 'DEPOSIT',
      amount: 50000,
      description: 'โบนัสต้อนรับสมาชิกใหม่ (เครดิตเริ่มต้น)',
      timestamp: new Date().toISOString()
    }
  ]
};

let betSlips: BetSlip[] = [];
let lotteryResults: LotteryResult[] = [
  {
    lotteryId: 'lao-dev',
    lotteryName: 'หวยลาวพัฒนา (Lao Dev)',
    flag: '🇱🇦',
    roundDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    full6Digits: '942851',
    top3: '851',
    bottom2: '42',
    top2: '51',
    drawnAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    lotteryId: 'hanoi-normal',
    lotteryName: 'หวยฮานอย ปกติ',
    flag: '🇻🇳',
    roundDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    full6Digits: '723149',
    top3: '149',
    bottom2: '23',
    top2: '49',
    drawnAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Helper: Helper function to check 3-digit tod (permutation match)
function isTodMatch(betDigit: string, top3Result: string): boolean {
  if (betDigit.length !== 3 || top3Result.length !== 3) return false;
  const sortedBet = betDigit.split('').sort().join('');
  const sortedResult = top3Result.split('').sort().join('');
  return sortedBet === sortedResult;
}

// ----------------- API ROUTES -----------------

// 1. Get all lotteries
app.get('/api/lotteries', (req, res) => {
  res.json({ success: true, data: lotteries });
});

// 2. Admin: Toggle lottery open/close status
app.post('/api/admin/lotteries/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const market = lotteries.find((l) => l.id === id);
  if (!market) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลตลาดหวยนี้' });
  }
  if (status) {
    market.status = status;
  } else {
    market.status = market.status === 'OPEN' ? 'CLOSED' : 'OPEN';
  }
  res.json({ success: true, message: `อัปเดตสถานะ ${market.name} เป็น ${market.status}`, data: market });
});

// 3. Admin: Update payout rates
app.post('/api/admin/lotteries/:id/payouts', (req, res) => {
  const { id } = req.params;
  const { payoutRates } = req.body;
  const market = lotteries.find((l) => l.id === id);
  if (!market) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลตลาดหวยนี้' });
  }
  market.payoutRates = { ...market.payoutRates, ...payoutRates };
  res.json({ success: true, message: `อัปเดตอัตราจ่ายของ ${market.name} สำเร็จ`, data: market });
});

// 4. Get User Wallet
app.get('/api/wallet', (req, res) => {
  res.json({ success: true, data: userWallet });
});

// 5. Top up User Wallet (Demo Deposit)
app.post('/api/wallet/topup', (req, res) => {
  const { amount } = req.body;
  const topupAmt = Number(amount) || 10000;
  userWallet.balance += topupAmt;
  userWallet.transactions.unshift({
    id: `tx-${Date.now()}`,
    type: 'DEPOSIT',
    amount: topupAmt,
    description: `เติมเงินเข้ากระเป๋าสำเร็จ +${topupAmt.toLocaleString()} บาท`,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, message: `เติมเงินสำเร็จ +${topupAmt.toLocaleString()} ฿`, data: userWallet });
});

// 6. Submit Bet Slip (Buy Lottery)
app.post('/api/slips/submit', (req, res) => {
  const { lotteryId, items } = req.body as { lotteryId: string; items: Omit<BetItem, 'id' | 'status' | 'winAmount'>[] };

  const market = lotteries.find((l) => l.id === lotteryId);
  if (!market) {
    return res.status(400).json({ success: false, message: 'ตลาดหวยไม่ถูกต้อง' });
  }

  if (market.status !== 'OPEN') {
    return res.status(400).json({ success: false, message: 'หวยรายการนี้ปิดรับแทงแล้ว' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'กรุณาเลือกตัวเลขและระบุยอดแทง' });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  if (userWallet.balance < totalAmount) {
    return res.status(400).json({
      success: false,
      message: `ยอดเงินในกระเป๋าไม่พอ (ต้องการ ${totalAmount.toLocaleString()} ฿ / มี ${userWallet.balance.toLocaleString()} ฿)`
    });
  }

  // Deduct Wallet
  userWallet.balance -= totalAmount;
  userWallet.totalSpent += totalAmount;

  const todayStr = new Date().toISOString().split('T')[0];

  const processedItems: BetItem[] = items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    digit: item.digit,
    betType: item.betType,
    amount: item.amount,
    payoutRate: item.payoutRate,
    status: 'PENDING',
    winAmount: 0
  }));

  const newSlip: BetSlip = {
    id: `SLIP-${Date.now().toString().slice(-6)}`,
    userId: 'user-demo',
    lotteryId: market.id,
    lotteryName: market.name,
    flag: market.flag,
    roundDate: todayStr,
    items: processedItems,
    totalAmount,
    totalWinAmount: 0,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  betSlips.unshift(newSlip);

  userWallet.transactions.unshift({
    id: `tx-bet-${newSlip.id}`,
    type: 'BET',
    amount: -totalAmount,
    description: `แทงหวย ${market.name} (โพยเลขที่ #${newSlip.id})`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `ส่งโพยเรียบร้อยแล้ว (${items.length} รายการ - รวม ${totalAmount.toLocaleString()} ฿)`,
    data: newSlip,
    wallet: userWallet
  });
});

// 7. Get All Bet Slips
app.get('/api/slips', (req, res) => {
  res.json({ success: true, data: betSlips });
});

// 8. Get All Results
app.get('/api/results', (req, res) => {
  res.json({ success: true, data: lotteryResults });
});

// 9. Admin: Input Draw Result & Execute Payout Settlement
app.post('/api/admin/lotteries/:id/draw', (req, res) => {
  const { id } = req.params;
  const { full6Digits, top3, bottom2, powerballMain, powerballSpecial } = req.body;

  const market = lotteries.find((l) => l.id === id);
  if (!market) {
    return res.status(404).json({ success: false, message: 'ไม่พบหวยรายการนี้' });
  }

  // Determine top3, bottom2, top2 automatically if full6Digits provided
  let finalTop3 = top3;
  let finalBottom2 = bottom2;
  let finalFull6 = full6Digits;

  if (finalFull6 && finalFull6.length >= 5) {
    finalTop3 = finalTop3 || finalFull6.slice(-3);
    finalBottom2 = finalBottom2 || finalFull6.slice(1, 3);
  } else {
    // Generate fallback if empty
    finalFull6 = finalFull6 || Math.floor(100000 + Math.random() * 900000).toString();
    finalTop3 = finalTop3 || finalFull6.slice(-3);
    finalBottom2 = finalBottom2 || finalFull6.slice(0, 2);
  }

  const finalTop2 = finalTop3.slice(-2);
  const roundDate = new Date().toISOString().split('T')[0];

  const resultRecord: LotteryResult = {
    lotteryId: market.id,
    lotteryName: market.name,
    flag: market.flag,
    roundDate,
    full6Digits: finalFull6,
    top3: finalTop3,
    bottom2: finalBottom2,
    top2: finalTop2,
    powerballMain,
    powerballSpecial,
    drawnAt: new Date().toISOString()
  };

  // Upsert result
  const existingIdx = lotteryResults.findIndex((r) => r.lotteryId === market.id && r.roundDate === roundDate);
  if (existingIdx >= 0) {
    lotteryResults[existingIdx] = resultRecord;
  } else {
    lotteryResults.unshift(resultRecord);
  }

  // Update Market status to SETTLED
  market.status = 'SETTLED';

  // SETTLEMENT CALCULATION FOR ALL PENDING SLIPS
  let totalPayoutThisRound = 0;
  let wonSlipsCount = 0;

  betSlips.forEach((slip) => {
    if (slip.lotteryId === market.id && slip.status === 'PENDING') {
      let slipTotalWin = 0;

      slip.items.forEach((item) => {
        let isWin = false;
        let winAmt = 0;

        if (item.betType === 'top3') {
          if (item.digit === finalTop3) isWin = true;
        } else if (item.betType === 'tod3') {
          if (isTodMatch(item.digit, finalTop3)) isWin = true;
        } else if (item.betType === 'top2') {
          if (item.digit === finalTop2) isWin = true;
        } else if (item.betType === 'bottom2') {
          if (item.digit === finalBottom2) isWin = true;
        } else if (item.betType === 'runTop') {
          if (finalTop3.includes(item.digit)) isWin = true;
        } else if (item.betType === 'runBottom') {
          if (finalBottom2.includes(item.digit)) isWin = true;
        } else if (item.betType === 'powerball') {
          // Powerball matching logic
          if (powerballSpecial && item.digit.includes(`PB ${powerballSpecial}`)) {
            isWin = true;
          } else if (Math.random() < 0.2) {
            isWin = true;
          }
        }

        if (isWin) {
          winAmt = item.amount * item.payoutRate;
          item.status = 'WIN';
          item.winAmount = winAmt;
          slipTotalWin += winAmt;
        } else {
          item.status = 'LOSE';
          item.winAmount = 0;
        }
      });

      slip.status = 'SETTLED';
      slip.totalWinAmount = slipTotalWin;

      if (slipTotalWin > 0) {
        wonSlipsCount++;
        totalPayoutThisRound += slipTotalWin;

        // Deposit winnings into user wallet
        userWallet.balance += slipTotalWin;
        userWallet.totalWon += slipTotalWin;

        userWallet.transactions.unshift({
          id: `tx-win-${slip.id}`,
          type: 'WIN',
          amount: slipTotalWin,
          description: `ถูกรางวัล ${market.name} โพย #${slip.id} (+${slipTotalWin.toLocaleString()} ฿)`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  res.json({
    success: true,
    message: `บันทึกผลรางวัล ${market.name} สำเร็จ (3 ตัวบน: ${finalTop3}, 2 ตัวล่าง: ${finalBottom2}) จ่ายรางวัลรวม ${totalPayoutThisRound.toLocaleString()} ฿`,
    data: {
      result: resultRecord,
      totalPayoutThisRound,
      wonSlipsCount
    }
  });
});

// 10. Admin: Random Auto-Draw Trigger
app.post('/api/admin/lotteries/:id/auto-draw', (req, res) => {
  const { id } = req.params;
  const market = lotteries.find((l) => l.id === id);
  if (!market) {
    return res.status(404).json({ success: false, message: 'ไม่พบหวยรายการนี้' });
  }

  const random6 = Math.floor(100000 + Math.random() * 900000).toString();
  const top3 = random6.slice(-3);
  const bottom2 = random6.slice(1, 3);

  let pbMain: number[] | undefined;
  let pbSpecial: number | undefined;

  if (market.isPowerballType) {
    pbMain = Array.from({ length: 5 }, () => Math.floor(1 + Math.random() * 69)).sort((a, b) => a - b);
    pbSpecial = Math.floor(1 + Math.random() * 26);
  }

  // Forward request to internal draw logic handler by simulating call
  req.body = {
    full6Digits: random6,
    top3,
    bottom2,
    powerballMain: pbMain,
    powerballSpecial: pbSpecial
  };

  // Re-run draw logic
  const drawHandler = (app as any)._router.stack.find(
    (s: any) => s.route && s.route.path === '/api/admin/lotteries/:id/draw' && s.route.methods.post
  );

  if (drawHandler) {
    return drawHandler.handle(req, res);
  }

  res.json({ success: true, full6Digits: random6, top3, bottom2 });
});

// 11. Admin / User: Cancel Bet Slip
app.post('/api/slips/:id/cancel', (req, res) => {
  const { id } = req.params;
  const slip = betSlips.find((s) => s.id === id);
  if (!slip) {
    return res.status(404).json({ success: false, message: 'ไม่พบโพยนี้' });
  }

  if (slip.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: 'โพยนี้ถูกคำนวณผลไปแล้ว ไม่สามารถยกเลิกได้' });
  }

  slip.status = 'CANCELLED';

  // Refund wallet
  userWallet.balance += slip.totalAmount;
  userWallet.totalSpent -= slip.totalAmount;

  userWallet.transactions.unshift({
    id: `tx-refund-${slip.id}`,
    type: 'REFUND',
    amount: slip.totalAmount,
    description: `คืนเงินจากการยกเลิกโพย #${slip.id} (+${slip.totalAmount.toLocaleString()} ฿)`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: `ยกเลิกโพย #${slip.id} และคืนเงินเรียบร้อยแล้ว`, data: slip });
});

// 12. Admin Dashboard Financial Statistics
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = betSlips.reduce((sum, s) => (s.status !== 'CANCELLED' ? sum + s.totalAmount : sum), 0);
  const totalPayout = betSlips.reduce((sum, s) => sum + s.totalWinAmount, 0);
  const netProfit = totalRevenue - totalPayout;
  const totalSlips = betSlips.length;
  const pendingSlips = betSlips.filter((s) => s.status === 'PENDING').length;
  const wonSlips = betSlips.filter((s) => s.totalWinAmount > 0).length;

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalPayout,
      netProfit,
      totalSlips,
      pendingSlips,
      wonSlips
    }
  });
});

// 13. Admin Reset Simulation Data
app.post('/api/admin/reset', (req, res) => {
  lotteries = JSON.parse(JSON.stringify(INITIAL_LOTTERIES));
  userWallet = {
    balance: 50000,
    totalSpent: 0,
    totalWon: 0,
    transactions: [
      {
        id: 'tx-init',
        type: 'DEPOSIT',
        amount: 50000,
        description: 'โบนัสต้อนรับสมาชิกใหม่ (เครดิตจำลอง)',
        timestamp: new Date().toISOString()
      }
    ]
  };
  betSlips = [];
  lotteryResults = [];
  res.json({ success: true, message: 'รีเซ็ตระบบจำลองกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว' });
});

// ----------------- VITE & STATIC EXPRESS CONFIG -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Foreign Lottery Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
