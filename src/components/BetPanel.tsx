import React, { useState } from 'react';
import { LotteryMarket, BetType, BetItem, UserWallet } from '../types';
import { ArrowLeft, Trash2, Plus, Sparkles, AlertCircle, CheckCircle2, Shuffle, Calculator, FileText } from 'lucide-react';
import { NumberKeypad } from './NumberKeypad';
import { PowerballBallSelector } from './PowerballBallSelector';

interface BetPanelProps {
  lottery: LotteryMarket;
  wallet: UserWallet;
  onBack: () => void;
  onSubmitSlip: (lotteryId: string, items: Omit<BetItem, 'id' | 'status' | 'winAmount'>[]) => Promise<void>;
  onOpenTopup: () => void;
}

export const BetPanel: React.FC<BetPanelProps> = ({ lottery, wallet, onBack, onSubmitSlip, onOpenTopup }) => {
  const [selectedBetType, setSelectedBetType] = useState<BetType>(lottery.isPowerballType ? 'powerball' : 'top3');
  const [inputDigits, setInputDigits] = useState<string>('');
  const [items, setItems] = useState<Omit<BetItem, 'id' | 'status' | 'winAmount'>[]>([]);
  const [globalAmount, setGlobalAmount] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pasteModalOpen, setPasteModalOpen] = useState<boolean>(false);
  const [rawPasteText, setRawPasteText] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Powerball state
  const [pbMains, setPbMains] = useState<number[]>([]);
  const [pbSpecial, setPbSpecial] = useState<number | null>(null);

  const getPayoutRate = (type: BetType): number => {
    switch (type) {
      case 'top3':
        return lottery.payoutRates.top3;
      case 'tod3':
        return lottery.payoutRates.tod3;
      case 'top2':
        return lottery.payoutRates.top2;
      case 'bottom2':
        return lottery.payoutRates.bottom2;
      case 'runTop':
        return lottery.payoutRates.runTop;
      case 'runBottom':
        return lottery.payoutRates.runBottom;
      case 'powerball':
        return 10000;
      default:
        return 900;
    }
  };

  // Helper 1: Add numbers manually
  const handleAddDigit = () => {
    if (!inputDigits.trim()) return;
    const cleanDigit = inputDigits.trim();

    // Validation
    let requiredLen = 3;
    if (selectedBetType === 'top2' || selectedBetType === 'bottom2') requiredLen = 2;
    if (selectedBetType === 'runTop' || selectedBetType === 'runBottom') requiredLen = 1;

    if (cleanDigit.length !== requiredLen) {
      setFeedback({ type: 'error', message: `กรุณากรอกตัวเลข ${requiredLen} หลักสำหรับประเภทนี้` });
      return;
    }

    const rate = getPayoutRate(selectedBetType);
    setItems((prev) => [
      ...prev,
      {
        digit: cleanDigit,
        betType: selectedBetType,
        amount: globalAmount,
        payoutRate: rate
      }
    ]);

    setInputDigits('');
    setFeedback(null);
  };

  // Helper 2: 19 ประตู Generator (for 2D)
  const handle19Doors = (singleDigit: string) => {
    if (!singleDigit || singleDigit.length !== 1) {
      setFeedback({ type: 'error', message: 'กรุณากรอกตัวเลข 1 หลักเพื่อสร้าง 19 ประตู' });
      return;
    }
    const d = singleDigit.trim();
    const generated: string[] = [];
    for (let i = 0; i <= 9; i++) {
      generated.push(`${d}${i}`);
      if (i.toString() !== d) {
        generated.push(`${i}${d}`);
      }
    }

    const rateTop = getPayoutRate('top2');
    const rateBottom = getPayoutRate('bottom2');

    const newItems: Omit<BetItem, 'id' | 'status' | 'winAmount'>[] = [];
    generated.forEach((num) => {
      newItems.push({ digit: num, betType: 'top2', amount: globalAmount, payoutRate: rateTop });
      newItems.push({ digit: num, betType: 'bottom2', amount: globalAmount, payoutRate: rateBottom });
    });

    setItems((prev) => [...prev, ...newItems]);
    setInputDigits('');
    setFeedback({ type: 'success', message: `เพิ่มเลข 19 ประตู (${d}) รวม ${newItems.length} รายการแล้ว` });
  };

  // Helper 3: Reverse Digits (กลับเลข)
  const handleReverseDigits = () => {
    if (!inputDigits.trim()) return;
    const clean = inputDigits.trim();

    if (clean.length === 2) {
      const orig = clean;
      const rev = clean.split('').reverse().join('');
      const rate = getPayoutRate(selectedBetType);
      const list = [orig];
      if (orig !== rev) list.push(rev);

      const newItems = list.map((num) => ({
        digit: num,
        betType: selectedBetType,
        amount: globalAmount,
        payoutRate: rate
      }));

      setItems((prev) => [...prev, ...newItems]);
      setInputDigits('');
      setFeedback({ type: 'success', message: `เพิ่มเลขกลับ (${list.join(', ')}) เรียบร้อยแล้ว` });
    } else if (clean.length === 3) {
      // Generate all permutations for 3D
      const set3 = new Set<string>();
      const chars = clean.split('');
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            if (i !== j && j !== k && i !== k) {
              set3.add(`${chars[i]}${chars[j]}${chars[k]}`);
            }
          }
        }
      }

      const arr = Array.from(set3);
      const rate = getPayoutRate(selectedBetType);
      const newItems = arr.map((num) => ({
        digit: num,
        betType: selectedBetType,
        amount: globalAmount,
        payoutRate: rate
      }));

      setItems((prev) => [...prev, ...newItems]);
      setInputDigits('');
      setFeedback({ type: 'success', message: `เพิ่มเลขกลับ 3 ตัว (${arr.join(', ')}) เรียบร้อยแล้ว` });
    }
  };

  // Helper 4: Quick Paste / Import Text
  const handleProcessPasteText = () => {
    if (!rawPasteText.trim()) return;
    const lines = rawPasteText.split(/[\n,;]+/);
    const newItems: Omit<BetItem, 'id' | 'status' | 'winAmount'>[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const match = trimmed.match(/^(\d+)(?:\s*[x=]\s*(\d+))?$/i);
      if (match) {
        const num = match[1];
        const amt = match[2] ? Number(match[2]) : globalAmount;
        let type: BetType = 'top3';
        if (num.length === 2) type = 'top2';
        if (num.length === 1) type = 'runTop';

        newItems.push({
          digit: num,
          betType: type,
          amount: amt,
          payoutRate: getPayoutRate(type)
        });
      }
    });

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setPasteModalOpen(false);
      setRawPasteText('');
      setFeedback({ type: 'success', message: `นำเข้าข้อมูลตัวเลข ${newItems.length} รายการเรียบร้อยแล้ว` });
    }
  };

  // Powerball Quick Pick Randomizer
  const handlePowerballQuickPick = () => {
    const mains: number[] = [];
    while (mains.length < 5) {
      const rand = Math.floor(1 + Math.random() * 69);
      if (!mains.includes(rand)) mains.push(rand);
    }
    mains.sort((a, b) => a - b);
    const special = Math.floor(1 + Math.random() * 26);

    const formatted = `${mains.map((n) => n.toString().padStart(2, '0')).join(', ')} + PB ${special}`;

    setItems((prev) => [
      ...prev,
      {
        digit: formatted,
        betType: 'powerball',
        amount: 100, // 100 THB per Powerball ticket
        payoutRate: 10000
      }
    ]);
  };

  const handleApplyGlobalAmount = () => {
    setItems((prev) => prev.map((item) => ({ ...item, amount: globalAmount })));
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateItemAmount = (index: number, newAmount: number) => {
    const amount = Math.max(0, isNaN(newAmount) ? 0 : newAmount);
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, amount } : item))
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalPotentialPayout = items.reduce((sum, item) => sum + item.amount * item.payoutRate, 0);

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmitSlip(lottery.id, items);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation Back Header */}
      <div className="flex items-center justify-between bg-[#0F1115] p-4 rounded-2xl border border-[#1E1E24] shadow-md">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-[#E0E0E0] hover:text-white bg-[#1A1D23] hover:bg-[#2D3139] px-3.5 py-2 rounded-xl transition cursor-pointer border border-[#2D3139]"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5A059]" />
          <span>ย้อนกลับตลาดหวย</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-3xl">{lottery.flag}</span>
          <div>
            <h2 className="font-bold text-white text-lg">{lottery.name}</h2>
            <p className="text-xs text-[#C5A059]">เวลาปิดรับแทงวันนี้: {lottery.closeTime} น.</p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] text-[#888888] uppercase font-semibold">เครดิตจำลองคงเหลือ</span>
          <div className="text-sm font-bold text-[#C5A059]">฿{wallet.balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Number Input & Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0F1115] p-6 rounded-2xl border border-[#1E1E24] space-y-6 shadow-xl">
          {/* Bet Type Selection Bar */}
          {!lottery.isPowerballType ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#E0E0E0] flex items-center justify-between">
                <span>เลือกรูปแบบการแทง (Bet Type)</span>
                <span className="text-[#C5A059]">อัตราจ่าย: {getPayoutRate(selectedBetType)}x</span>
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { id: 'top3', name: '3 ตัวบน', rate: lottery.payoutRates.top3 },
                  { id: 'tod3', name: '3 ตัวโต๊ด', rate: lottery.payoutRates.tod3 },
                  { id: 'top2', name: '2 ตัวบน', rate: lottery.payoutRates.top2 },
                  { id: 'bottom2', name: '2 ตัวล่าง', rate: lottery.payoutRates.bottom2 },
                  { id: 'runTop', name: 'วิ่งบน', rate: lottery.payoutRates.runTop },
                  { id: 'runBottom', name: 'วิ่งล่าง', rate: lottery.payoutRates.runBottom }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedBetType(type.id as BetType);
                      setInputDigits('');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedBetType === type.id
                        ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-md'
                        : 'bg-[#1A1D23] text-[#E0E0E0] border-[#2D3139] hover:border-[#C5A059]/50'
                    }`}
                  >
                    <div>{type.name}</div>
                    <div className="text-[10px] opacity-80">{type.rate}x</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Powerball Ball Grid Selector */
            <PowerballBallSelector
              onAddTicket={(newItem) => setItems((prev) => [...prev, newItem])}
              onSetFeedback={setFeedback}
            />
          )}

          {/* Interactive Number Keypad & Selection Grid */}
          {!lottery.isPowerballType && (
            <div className="space-y-3">
              <NumberKeypad
                betType={selectedBetType}
                payoutRate={getPayoutRate(selectedBetType)}
                globalAmount={globalAmount}
                onAddItems={(newItems) => setItems((prev) => [...prev, ...newItems])}
                onSetFeedback={setFeedback}
              />

              {/* Quick Paste Modal Trigger Bar */}
              <div className="bg-[#0A0A0C] p-3 rounded-xl border border-[#2D3139] flex items-center justify-between">
                <span className="text-xs text-[#888888] flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>มีชุดตัวเลขที่คัดลอกไว้?</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPasteModalOpen(true)}
                  className="bg-[#1A1D23] hover:bg-[#2D3139] border border-[#2D3139] text-[#C5A059] px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  📋 คัดลอก/วางชุดตัวเลข
                </button>
              </div>
            </div>
          )}

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                feedback.type === 'success'
                  ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Right Column: Bet Slip Cart & Calculations (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0F1115] p-6 rounded-2xl border border-[#1E1E24] space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E1E24] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-[#C5A059]" />
                <span>รายการโพยแทง ({items.length} รายการ)</span>
              </h3>
              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  ล้างทั้งหมด
                </button>
              )}
            </div>

            {/* Set Equal Amount Control */}
            {items.length > 0 && (
              <div className="bg-[#0A0A0C] p-3 rounded-xl border border-[#2D3139] space-y-2">
                <div className="text-[11px] text-[#888888] font-semibold flex justify-between">
                  <span>กำหนดจำนวนเงินเท่ากันทุกรายการ:</span>
                  <span className="text-[#C5A059] font-bold">{globalAmount} ฿</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min={1}
                    value={globalAmount}
                    onChange={(e) => setGlobalAmount(Math.max(1, Number(e.target.value)))}
                    className="w-24 bg-[#1A1D23] border border-[#2D3139] rounded-lg px-2 py-1 text-xs text-center font-bold text-white"
                  />
                  <div className="flex gap-1 flex-1">
                    {[10, 50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setGlobalAmount(amt)}
                        className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#E0E0E0] px-2 py-1 rounded text-[10px] font-bold transition flex-1 cursor-pointer border border-[#2D3139]"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleApplyGlobalAmount}
                    className="bg-[#C5A059] text-black px-2 py-1 rounded text-[11px] font-bold cursor-pointer hover:bg-[#B58F48]"
                  >
                    ปรับใช้
                  </button>
                </div>
              </div>
            )}

            {/* Items List Table */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {items.length === 0 ? (
                <div className="text-center py-10 text-[#888888] text-xs border-2 border-dashed border-[#2D3139] rounded-xl space-y-2">
                  <div>🎯 ยังไม่มีรายการในโพย</div>
                  <p className="text-[11px] text-[#666666]">กรอกตัวเลขแล้วกดปุ่ม "เพิ่มเลข" ด้านซ้าย</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0A0A0C] p-2.5 rounded-xl border border-[#2D3139] flex items-center justify-between text-xs hover:border-[#C5A059]/40 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="font-black text-[#C5A059] tracking-wider text-sm">{item.digit}</div>
                      <div className="text-[10px] text-[#888888]">
                        {item.betType} ({item.payoutRate}x)
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-end space-y-0.5">
                        <div className="flex items-center space-x-1 bg-[#1A1D23] border border-[#2D3139] focus-within:border-[#C5A059] rounded-lg px-2 py-1 transition">
                          <span className="text-[10px] text-[#888888]">ซื้อ:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.amount === 0 ? '' : item.amount}
                            onChange={(e) => handleUpdateItemAmount(idx, Number(e.target.value))}
                            className="w-16 bg-transparent text-right font-bold text-xs text-[#E0E0E0] focus:outline-none focus:text-[#C5A059]"
                          />
                          <span className="text-[10px] text-[#888888] font-bold">฿</span>
                        </div>
                        <div className="text-[9px] text-[#22C55E] font-semibold">
                          ชนะได้ {(item.amount * item.payoutRate).toLocaleString()} ฿
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[#666666] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Slip Summary & Submit Action */}
          <div className="space-y-4 pt-4 border-t border-[#1E1E24]">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#888888]">
                <span>จำนวนรายการทั้งหมด:</span>
                <span className="font-bold text-[#E0E0E0]">{items.length} รายการ</span>
              </div>
              <div className="flex justify-between text-[#888888]">
                <span>ยอดรวมเงินเดิมพัน (Total Bet):</span>
                <span className="font-bold text-[#C5A059] text-base">฿{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#888888] bg-[#0A0A0C] p-2 rounded-lg border border-[#2D3139]">
                <span>ผลตอบแทนสูงสุด (Potential Payout):</span>
                <span className="font-bold text-[#22C55E]">฿{totalPotentialPayout.toLocaleString()}</span>
              </div>
            </div>

            {/* Wallet Balance Check warning */}
            {wallet.balance < totalAmount && totalAmount > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                <span>ยอดเงินไม่พอ (ขาด { (totalAmount - wallet.balance).toLocaleString() } ฿)</span>
                <button
                  onClick={onOpenTopup}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  เติมเครดิต
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={items.length === 0 || wallet.balance < totalAmount || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                items.length > 0 && wallet.balance >= totalAmount && !isSubmitting
                  ? 'bg-[#C5A059] hover:bg-[#B58F48] text-black shadow-md'
                  : 'bg-[#1A1D23] text-[#666666] border border-[#2D3139] cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังส่งโพย...' : 'ยืนยันส่งโพยแทงหวย (Submit Slip)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Paste Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1115] border border-[#2D3139] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">วางคัดลอกชุดตัวเลข (Paste Numbers)</h3>
            <p className="text-xs text-[#888888]">
              วางข้อความตัวเลขคั่นด้วยเว้นวรรคหรือบรรทัดใหม่ เช่น <code>123 456 789</code> หรือ <code>123=20 456=50</code>
            </p>
            <textarea
              rows={6}
              value={rawPasteText}
              onChange={(e) => setRawPasteText(e.target.value)}
              placeholder="ตัวอย่าง:&#10;123&#10;456&#10;789 50x50"
              className="w-full bg-[#0A0A0C] border border-[#2D3139] rounded-xl p-3 text-xs text-[#C5A059] font-mono focus:outline-none focus:border-[#C5A059]"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#888888] hover:bg-[#1A1D23] cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleProcessPasteText}
                className="bg-[#C5A059] hover:bg-[#B58F48] text-black px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                ประมวลผลตัวเลข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
