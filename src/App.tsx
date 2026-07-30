import React, { useState, useEffect } from 'react';
import { LotteryMarket, BetSlip, LotteryResult, UserWallet, AdminStats, BetItem } from './types';
import { INITIAL_LOTTERIES } from './data/initialLotteries';
import { Navbar } from './components/Navbar';
import { LotteryList } from './components/LotteryList';
import { BetPanel } from './components/BetPanel';
import { MySlips } from './components/MySlips';
import { ResultsBoard } from './components/ResultsBoard';
import { RulesAndPayouts } from './components/RulesAndPayouts';
import { AdminPanel } from './components/AdminPanel';
import { TopupModal } from './components/TopupModal';

const DEFAULT_WALLET: UserWallet = {
  balance: 50000,
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

const isTodMatch = (digit: string, targetTop3: string): boolean => {
  if (!digit || !targetTop3 || digit.length !== 3 || targetTop3.length !== 3) return false;
  const sortedDigit = digit.split('').sort().join('');
  const sortedTarget = targetTop3.split('').sort().join('');
  return sortedDigit === sortedTarget;
};

export default function App() {
  const [activeView, setActiveView] = useState<'PLAYER' | 'ADMIN'>('PLAYER');
  const [playerTab, setPlayerTab] = useState<'LOTTERIES' | 'MY_SLIPS' | 'RESULTS' | 'RULES'>('LOTTERIES');
  const [selectedLottery, setSelectedLottery] = useState<LotteryMarket | null>(null);

  // Data States
  const [lotteries, setLotteries] = useState<LotteryMarket[]>([]);
  const [wallet, setWallet] = useState<UserWallet>(DEFAULT_WALLET);
  const [slips, setSlips] = useState<BetSlip[]>([]);
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalPayout: 0,
    netProfit: 0,
    totalSlips: 0,
    pendingSlips: 0,
    wonSlips: 0
  });

  const [topupModalOpen, setTopupModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLocalStorageFallback = () => {
    try {
      const storedLotteries = localStorage.getItem('nosmilee_lotteries');
      const storedWallet = localStorage.getItem('nosmilee_wallet');
      const storedSlips = localStorage.getItem('nosmilee_slips');
      const storedResults = localStorage.getItem('nosmilee_results');

      const parsedLotteries = storedLotteries ? JSON.parse(storedLotteries) : INITIAL_LOTTERIES;
      const parsedWallet = storedWallet ? JSON.parse(storedWallet) : DEFAULT_WALLET;
      const parsedSlips: BetSlip[] = storedSlips ? JSON.parse(storedSlips) : [];
      const parsedResults: LotteryResult[] = storedResults ? JSON.parse(storedResults) : [];

      setLotteries(parsedLotteries);
      setWallet(parsedWallet);
      setSlips(parsedSlips);
      setResults(parsedResults);

      recalculateStats(parsedSlips, parsedWallet);
    } catch (e) {
      setLotteries(INITIAL_LOTTERIES);
      setWallet(DEFAULT_WALLET);
      setSlips([]);
      setResults([]);
    }
  };

  const recalculateStats = (slipsList: BetSlip[], walletData: UserWallet) => {
    const totalRevenue = slipsList.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPayout = slipsList.reduce((sum, s) => sum + s.totalWinAmount, 0);
    const netProfit = totalRevenue - totalPayout;
    const totalSlips = slipsList.length;
    const pendingSlips = slipsList.filter((s) => s.status === 'PENDING').length;
    const wonSlips = slipsList.filter((s) => s.totalWinAmount > 0).length;

    setAdminStats({
      totalRevenue,
      totalPayout,
      netProfit,
      totalSlips,
      pendingSlips,
      wonSlips
    });
  };

  const saveToLocalStorage = (
    newLotteries?: LotteryMarket[],
    newWallet?: UserWallet,
    newSlips?: BetSlip[],
    newResults?: LotteryResult[]
  ) => {
    try {
      if (newLotteries) localStorage.setItem('nosmilee_lotteries', JSON.stringify(newLotteries));
      if (newWallet) localStorage.setItem('nosmilee_wallet', JSON.stringify(newWallet));
      if (newSlips) localStorage.setItem('nosmilee_slips', JSON.stringify(newSlips));
      if (newResults) localStorage.setItem('nosmilee_results', JSON.stringify(newResults));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  };

  // Fetch all data from Express API (with Client Fallback)
  const fetchAllData = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/lotteries'),
        fetch('/api/wallet'),
        fetch('/api/slips'),
        fetch('/api/results'),
        fetch('/api/admin/stats')
      ]);

      if (responses.every((r) => r.ok)) {
        const [resLotteries, resWallet, resSlips, resResults, resStats] = await Promise.all(
          responses.map((r) => r.json())
        );

        if (resLotteries.success && resWallet.success) {
          setLotteries(resLotteries.data);
          setWallet(resWallet.data);
          setSlips(resSlips.data);
          setResults(resResults.data);
          setAdminStats(resStats.data);

          saveToLocalStorage(resLotteries.data, resWallet.data, resSlips.data, resResults.data);
          return;
        }
      }

      loadLocalStorageFallback();
    } catch (err) {
      loadLocalStorageFallback();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleSubmitSlip = async (
    lotteryId: string,
    items: Omit<BetItem, 'id' | 'status' | 'winAmount'>[]
  ) => {
    const market = lotteries.find((l) => l.id === lotteryId);
    if (!market) return;

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    if (wallet.balance < totalAmount) {
      alert('ยอดเงินคงเหลือไม่พอสำหรับการแทงชุดนี้ กรุณาเติมเงินก่อนทำรายการ');
      return;
    }

    try {
      const res = await fetch('/api/slips/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotteryId, items })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchAllData();
          setSelectedLottery(null);
          setPlayerTab('MY_SLIPS');
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    // Client-side fallback
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
      roundDate: new Date().toISOString().split('T')[0],
      items: processedItems,
      totalAmount,
      totalWinAmount: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const updatedSlips = [newSlip, ...slips];
    const updatedWallet: UserWallet = {
      ...wallet,
      balance: wallet.balance - totalAmount,
      totalSpent: wallet.totalSpent + totalAmount,
      transactions: [
        {
          id: `tx-bet-${newSlip.id}`,
          type: 'BET',
          amount: -totalAmount,
          description: `แทงหวย ${market.name} (โพยเลขที่ #${newSlip.id})`,
          timestamp: new Date().toISOString()
        },
        ...wallet.transactions
      ]
    };

    setSlips(updatedSlips);
    setWallet(updatedWallet);
    recalculateStats(updatedSlips, updatedWallet);
    saveToLocalStorage(lotteries, updatedWallet, updatedSlips, results);

    setSelectedLottery(null);
    setPlayerTab('MY_SLIPS');
  };

  const handleTopup = async (amount: number) => {
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchAllData();
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    const updatedWallet: UserWallet = {
      ...wallet,
      balance: wallet.balance + amount,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'DEPOSIT',
          amount,
          description: `เติมเงินเข้ากระเป๋าสำเร็จ +${amount.toLocaleString()} บาท`,
          timestamp: new Date().toISOString()
        },
        ...wallet.transactions
      ]
    };
    setWallet(updatedWallet);
    saveToLocalStorage(lotteries, updatedWallet, slips, results);
  };

  const handleCancelSlip = async (slipId: string) => {
    try {
      const res = await fetch(`/api/slips/${slipId}/cancel`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchAllData();
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    const targetSlip = slips.find((s) => s.id === slipId);
    if (!targetSlip || targetSlip.status !== 'PENDING') return;

    const updatedSlips = slips.map((s) => (s.id === slipId ? { ...s, status: 'CANCELLED' as const } : s));
    const refundAmount = targetSlip.totalAmount;

    const updatedWallet: UserWallet = {
      ...wallet,
      balance: wallet.balance + refundAmount,
      totalSpent: Math.max(0, wallet.totalSpent - refundAmount),
      transactions: [
        {
          id: `tx-cancel-${slipId}`,
          type: 'REFUND',
          amount: refundAmount,
          description: `ยกเลิกโพย #${slipId} และคืนเงินเรียบร้อย`,
          timestamp: new Date().toISOString()
        },
        ...wallet.transactions
      ]
    };

    setSlips(updatedSlips);
    setWallet(updatedWallet);
    recalculateStats(updatedSlips, updatedWallet);
    saveToLocalStorage(lotteries, updatedWallet, updatedSlips, results);
  };

  // Admin Handlers
  const handleToggleMarket = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await fetch(`/api/admin/lotteries/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchAllData();
        return;
      }
    } catch (e) {
      // Fallback
    }

    const updatedLotteries = lotteries.map((l) => (l.id === id ? { ...l, status: nextStatus as any } : l));
    setLotteries(updatedLotteries);
    saveToLocalStorage(updatedLotteries, wallet, slips, results);
  };

  const handleUpdatePayouts = async (id: string, payoutRates: any) => {
    try {
      const res = await fetch(`/api/admin/lotteries/${id}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutRates })
      });
      if (res.ok) {
        await fetchAllData();
        return;
      }
    } catch (e) {
      // Fallback
    }

    const updatedLotteries = lotteries.map((l) => (l.id === id ? { ...l, payoutRates } : l));
    setLotteries(updatedLotteries);
    saveToLocalStorage(updatedLotteries, wallet, slips, results);
  };

  const handleDrawLottery = async (
    id: string,
    data: { full6Digits?: string; top3?: string; bottom2?: string }
  ) => {
    try {
      const res = await fetch(`/api/admin/lotteries/${id}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchAllData();
        return;
      }
    } catch (e) {
      // Fallback
    }

    const market = lotteries.find((l) => l.id === id);
    if (!market) return;

    let finalTop3 = data.top3;
    let finalBottom2 = data.bottom2;
    let finalFull6 = data.full6Digits;

    if (finalFull6 && finalFull6.length >= 5) {
      finalTop3 = finalTop3 || finalFull6.slice(-3);
      finalBottom2 = finalBottom2 || finalFull6.slice(1, 3);
    } else {
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
      drawnAt: new Date().toISOString()
    };

    const updatedResults = [resultRecord, ...results.filter((r) => !(r.lotteryId === market.id && r.roundDate === roundDate))];
    const updatedLotteries = lotteries.map((l) => (l.id === id ? { ...l, status: 'SETTLED' as const } : l));

    let userWinTotal = 0;

    const updatedSlips = slips.map((slip) => {
      if (slip.lotteryId === market.id && slip.status === 'PENDING') {
        let slipWinAmt = 0;

        const items = slip.items.map((item) => {
          let isWin = false;
          if (item.betType === 'top3' && item.digit === finalTop3) isWin = true;
          if (item.betType === 'tod3' && isTodMatch(item.digit, finalTop3)) isWin = true;
          if (item.betType === 'top2' && item.digit === finalTop2) isWin = true;
          if (item.betType === 'bottom2' && item.digit === finalBottom2) isWin = true;
          if (item.betType === 'runTop' && finalTop3.includes(item.digit)) isWin = true;
          if (item.betType === 'runBottom' && finalBottom2.includes(item.digit)) isWin = true;

          if (isWin) {
            const winAmt = item.amount * item.payoutRate;
            slipWinAmt += winAmt;
            return { ...item, status: 'WIN' as const, winAmount: winAmt };
          }
          return { ...item, status: 'LOSE' as const, winAmount: 0 };
        });

        userWinTotal += slipWinAmt;

        return {
          ...slip,
          items,
          status: 'SETTLED' as const,
          totalWinAmount: slipWinAmt
        };
      }
      return slip;
    }
    );

    let updatedWallet = wallet;
    if (userWinTotal > 0) {
      updatedWallet = {
        ...wallet,
        balance: wallet.balance + userWinTotal,
        totalWon: wallet.totalWon + userWinTotal,
        transactions: [
          {
            id: `tx-win-${Date.now()}`,
            type: 'WIN',
            amount: userWinTotal,
            description: `ถูกรางวัลหวย ${market.name} รับเงิน +${userWinTotal.toLocaleString()} ฿`,
            timestamp: new Date().toISOString()
          },
          ...wallet.transactions
        ]
      };
    }

    setResults(updatedResults);
    setLotteries(updatedLotteries);
    setSlips(updatedSlips);
    setWallet(updatedWallet);
    recalculateStats(updatedSlips, updatedWallet);
    saveToLocalStorage(updatedLotteries, updatedWallet, updatedSlips, updatedResults);
  };

  const handleAutoDrawLottery = async (id: string) => {
    const market = lotteries.find((l) => l.id === id);
    if (!market) return;

    if (market.isPowerballType) {
      const mainNums: string[] = [];
      while (mainNums.length < 5) {
        const n = Math.floor(1 + Math.random() * 69).toString().padStart(2, '0');
        if (!mainNums.includes(n)) mainNums.push(n);
      }
      mainNums.sort((a, b) => Number(a) - Number(b));
      const pbNum = Math.floor(1 + Math.random() * 26);
      const top3 = mainNums[2] + mainNums[3] + mainNums[4];
      const bottom2 = mainNums[0] + mainNums[1];

      await handleDrawLottery(id, {
        full6Digits: mainNums.join('-') + ` [PB: ${pbNum}]`,
        top3,
        bottom2
      });
    } else {
      const full6 = Math.floor(100000 + Math.random() * 900000).toString();
      const top3 = full6.slice(-3);
      const bottom2 = full6.slice(1, 3);
      await handleDrawLottery(id, { full6Digits: full6, top3, bottom2 });
    }
  };

  const handleResetSystem = async () => {
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        return;
      }
    } catch (e) {
      // Fallback
    }

    localStorage.removeItem('nosmilee_lotteries');
    localStorage.removeItem('nosmilee_wallet');
    localStorage.removeItem('nosmilee_slips');
    localStorage.removeItem('nosmilee_results');

    setLotteries(INITIAL_LOTTERIES);
    setWallet(DEFAULT_WALLET);
    setSlips([]);
    setResults([]);
    recalculateStats([], DEFAULT_WALLET);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E0] font-sans selection:bg-[#C5A059] selection:text-black pb-16">
      {/* Navigation Header */}
      <Navbar
        wallet={wallet}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          setSelectedLottery(null);
        }}
        playerTab={playerTab}
        setPlayerTab={(t) => {
          setPlayerTab(t);
          setSelectedLottery(null);
        }}
        onOpenTopup={() => setTopupModalOpen(true)}
        onRefreshData={fetchAllData}
      />

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-xs text-[#888888] font-semibold">กำลังเชื่อมต่อฐานข้อมูลระบบหวย...</div>
          </div>
        ) : activeView === 'PLAYER' ? (
          /* PLAYER VIEW */
          selectedLottery ? (
            <BetPanel
              lottery={selectedLottery}
              wallet={wallet}
              onBack={() => setSelectedLottery(null)}
              onSubmitSlip={handleSubmitSlip}
              onOpenTopup={() => setTopupModalOpen(true)}
            />
          ) : (
            <>
              {playerTab === 'LOTTERIES' && (
                <LotteryList lotteries={lotteries} onSelectLottery={(l) => setSelectedLottery(l)} />
              )}
              {playerTab === 'MY_SLIPS' && <MySlips slips={slips} onCancelSlip={handleCancelSlip} />}
              {playerTab === 'RESULTS' && <ResultsBoard results={results} />}
              {playerTab === 'RULES' && <RulesAndPayouts />}
            </>
          )
        ) : (
          /* ADMIN BACKEND VIEW */
          <AdminPanel
            lotteries={lotteries}
            slips={slips}
            stats={adminStats}
            wallet={wallet}
            onToggleMarket={handleToggleMarket}
            onUpdatePayouts={handleUpdatePayouts}
            onDrawLottery={handleDrawLottery}
            onAutoDrawLottery={handleAutoDrawLottery}
            onCancelSlip={handleCancelSlip}
            onTopupWallet={handleTopup}
            onResetSystem={handleResetSystem}
          />
        )}
      </main>

      {/* Topup Modal */}
      <TopupModal isOpen={topupModalOpen} onClose={() => setTopupModalOpen(false)} onTopup={handleTopup} />
    </div>
  );
}
