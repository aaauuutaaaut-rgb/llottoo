import React, { useState } from 'react';
import { LotteryMarket, LotteryCategory } from '../types';
import { Search, Clock, Sparkles, TrendingUp, CheckCircle2, Lock } from 'lucide-react';

interface LotteryListProps {
  lotteries: LotteryMarket[];
  onSelectLottery: (lottery: LotteryMarket) => void;
}

export const LotteryList: React.FC<LotteryListProps> = ({ lotteries, onSelectLottery }) => {
  const [selectedCategory, setSelectedCategory] = useState<LotteryCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { id: LotteryCategory; label: string; icon: string }[] = [
    { id: 'ALL', label: 'ทั้งหมด (All)', icon: '🌐' },
    { id: 'LAO', label: 'หวยลาว (Lao)', icon: '🇱🇦' },
    { id: 'HANOI', label: 'หวยฮานอย (Vietnam)', icon: '🇻🇳' },
    { id: 'STOCK', label: 'หวยหุ้นต่างประเทศ (Stocks)', icon: '📈' },
    { id: 'GLOBAL', label: 'หวยสากล US Powerball', icon: '🇺🇸' }
  ];

  const filteredLotteries = lotteries.filter((l) => {
    const matchesCat = selectedCategory === 'ALL' || l.category === selectedCategory;
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F1115] p-4 rounded-2xl border border-[#1E1E24] shadow-md">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'bg-[#1A1D23] text-[#E0E0E0] hover:bg-[#2D3139] hover:text-white border border-[#2D3139]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาหวยต่างประเทศ..."
            className="w-full bg-[#0A0A0C] border border-[#2D3139] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E0E0E0] focus:outline-none focus:border-[#C5A059] transition"
          />
        </div>
      </div>

      {/* Recommended Hot Markets Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1A1D23] via-[#0F1115] to-[#0A0A0C] p-4 rounded-2xl border border-[#C5A059]/60 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] bg-[#C5A059] text-black px-2 py-0.5 rounded-full font-bold">
              🇱🇦 ยอดนิยมสูงสุด
            </span>
            <h4 className="font-bold text-white text-sm">หวยลาวพัฒนา</h4>
            <p className="text-xs text-[#888888]">อัตราจ่ายสูง 3 ตัวบน 900 บาท</p>
          </div>
          <button
            onClick={() => {
              const lao = lotteries.find((l) => l.id === 'lao-dev');
              if (lao) onSelectLottery(lao);
            }}
            className="bg-[#C5A059] hover:bg-[#B58F48] text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            แทงเลย 🎯
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1A1D23] via-[#0F1115] to-[#0A0A0C] p-4 rounded-2xl border border-[#2D3139] flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] bg-[#1A1D23] text-[#C5A059] border border-[#C5A059]/40 px-2 py-0.5 rounded-full font-bold">
              🇻🇳 ออกรางวัลทุกวัน
            </span>
            <h4 className="font-bold text-white text-sm">หวยฮานอย VIP</h4>
            <p className="text-xs text-[#888888]">ปิดรับ 19:00 น. ผลแม่นยำ</p>
          </div>
          <button
            onClick={() => {
              const hanoi = lotteries.find((l) => l.id === 'hanoi-vip');
              if (hanoi) onSelectLottery(hanoi);
            }}
            className="bg-[#C5A059] hover:bg-[#B58F48] text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            แทงเลย 🎯
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1A1D23] via-[#0F1115] to-[#0A0A0C] p-4 rounded-2xl border border-[#C5A059] flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] bg-[#C5A059] text-black px-2 py-0.5 rounded-full font-bold">
              🇺🇸 แจ็กพอต 500 ล้าน
            </span>
            <h4 className="font-bold text-white text-sm">US Powerball</h4>
            <p className="text-xs text-[#888888]">สุ่ม 5 เลขหลัก + Powerball</p>
          </div>
          <button
            onClick={() => {
              const pb = lotteries.find((l) => l.id === 'us-powerball');
              if (pb) onSelectLottery(pb);
            }}
            className="bg-[#C5A059] hover:bg-[#B58F48] text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            แทงเลย 🎰
          </button>
        </div>
      </div>

      {/* Main Lotteries Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLotteries.map((lottery) => {
          const isOpen = lottery.status === 'OPEN';
          return (
            <div
              key={lottery.id}
              className={`bg-[#0A0A0C] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg ${
                isOpen
                  ? 'border-[#2D3139] hover:border-[#C5A059]'
                  : 'border-[#1E1E24] opacity-70'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl bg-[#1A1D23] p-2 rounded-xl border border-[#2D3139] shadow-inner">
                      {lottery.flag}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">{lottery.name}</h3>
                      <p className="text-xs text-[#888888]">{lottery.country}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1 ${
                      isOpen
                        ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>เปิดรับแทง</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>ปิดรับแทง</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed line-clamp-2">{lottery.description}</p>

                {/* Draw schedule & Close time */}
                <div className="bg-[#1A1D23] p-3 rounded-xl border border-[#2D3139] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#E0E0E0]">
                    <span className="flex items-center space-x-1 text-[#888888]">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>เวลาปิดรับแทง:</span>
                    </span>
                    <span className="font-bold text-[#C5A059]">{lottery.closeTime} น.</span>
                  </div>
                  <div className="flex items-center justify-between text-[#888888]">
                    <span>วันออกรางวัล:</span>
                    <span className="text-[#E0E0E0]">{lottery.openDays}</span>
                  </div>
                </div>

                {/* Payout Rate Summary */}
                <div className="pt-1">
                  <div className="text-[11px] text-[#888888] mb-1.5 flex items-center justify-between">
                    <span>อัตราจ่ายสูงสุด (บาทละ):</span>
                    <span className="text-[#C5A059] font-bold">จ่ายจริง จ่ายไว</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="bg-[#1A1D23] p-1.5 rounded-lg border border-[#2D3139]">
                      <div className="text-[10px] text-[#888888]">3 ตัวบน</div>
                      <div className="font-bold text-[#C5A059]">{lottery.payoutRates.top3}x</div>
                    </div>
                    <div className="bg-[#1A1D23] p-1.5 rounded-lg border border-[#2D3139]">
                      <div className="text-[10px] text-[#888888]">2 ตัวบน/ล่าง</div>
                      <div className="font-bold text-[#C5A059]">{lottery.payoutRates.top2}x</div>
                    </div>
                    <div className="bg-[#1A1D23] p-1.5 rounded-lg border border-[#2D3139]">
                      <div className="text-[10px] text-[#888888]">3 ตัวโต๊ด</div>
                      <div className="font-bold text-[#C5A059]">{lottery.payoutRates.tod3}x</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-[#0F1115] border-t border-[#1E1E24]">
                <button
                  onClick={() => onSelectLottery(lottery)}
                  disabled={!isOpen}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer ${
                    isOpen
                      ? 'bg-[#C5A059] hover:bg-[#B58F48] text-black shadow-md'
                      : 'bg-[#1A1D23] text-[#666666] border border-[#2D3139] cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isOpen ? 'แทงหวยรายการนี้ (Place Bet)' : 'ปิดรับแทงชั่วคราว'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
