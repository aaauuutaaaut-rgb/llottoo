import React, { useState } from 'react';
import { LotteryMarket, BetSlip, AdminStats, UserWallet } from '../types';
import {
  ShieldCheck,
  BarChart3,
  Sliders,
  Dices,
  FileSpreadsheet,
  Wallet,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Eye,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
  Calendar,
  Hash,
  User
} from 'lucide-react';

interface AdminPanelProps {
  lotteries: LotteryMarket[];
  slips: BetSlip[];
  stats: AdminStats;
  wallet: UserWallet;
  onToggleMarket: (id: string, currentStatus: string) => Promise<void>;
  onUpdatePayouts: (id: string, payoutRates: any) => Promise<void>;
  onDrawLottery: (
    id: string,
    data: { full6Digits?: string; top3?: string; bottom2?: string; powerballSpecial?: number }
  ) => Promise<void>;
  onAutoDrawLottery: (id: string) => Promise<void>;
  onCancelSlip: (id: string) => Promise<void>;
  onTopupWallet: (amount: number) => Promise<void>;
  onResetSystem: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lotteries,
  slips,
  stats,
  wallet,
  onToggleMarket,
  onUpdatePayouts,
  onDrawLottery,
  onAutoDrawLottery,
  onCancelSlip,
  onTopupWallet,
  onResetSystem
}) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'MARKETS' | 'DRAW' | 'SLIPS' | 'WALLET'>('STATS');

  // Market Edit Payout State
  const [editingMarketId, setEditingMarketId] = useState<string | null>(null);
  const [editPayouts, setEditPayouts] = useState<any>({});

  // Draw Form State
  const [selectedDrawLotteryId, setSelectedDrawLotteryId] = useState<string>(lotteries[0]?.id || 'lao-dev');
  const [drawFull6, setDrawFull6] = useState<string>('');
  const [drawTop3, setDrawTop3] = useState<string>('');
  const [drawBottom2, setDrawBottom2] = useState<string>('');

  // Wallet topup
  const [customTopup, setCustomTopup] = useState<number>(10000);

  // Status notification
  const [adminMsg, setAdminMsg] = useState<string | null>(null);

  // Slips filtering & detail view state
  const [expandedSlipIds, setExpandedSlipIds] = useState<string[]>([]);
  const [selectedSlipDetail, setSelectedSlipDetail] = useState<BetSlip | null>(null);
  const [slipFilterStatus, setSlipFilterStatus] = useState<'ALL' | 'PENDING' | 'SETTLED' | 'CANCELLED'>('ALL');
  const [slipSearchQuery, setSlipSearchQuery] = useState<string>('');

  const toggleExpandSlip = (id: string) => {
    setExpandedSlipIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getBetTypeLabel = (type: string) => {
    switch (type) {
      case 'top3': return '3 ตัวบน';
      case 'tod3': return '3 ตัวโต๊ด';
      case 'top2': return '2 ตัวบน';
      case 'bottom2': return '2 ตัวล่าง';
      case 'runTop': return 'วิ่งบน';
      case 'runBottom': return 'วิ่งล่าง';
      case 'powerball': return 'US Powerball';
      default: return type;
    }
  };

  const handleStartEditPayout = (market: LotteryMarket) => {
    setEditingMarketId(market.id);
    setEditPayouts({ ...market.payoutRates });
  };

  const handleSavePayout = async (marketId: string) => {
    await onUpdatePayouts(marketId, editPayouts);
    setEditingMarketId(null);
    setAdminMsg('บันทึกอัตราจ่ายเรียบร้อยแล้ว');
  };

  const handleExecuteManualDraw = async () => {
    if (!selectedDrawLotteryId) return;
    await onDrawLottery(selectedDrawLotteryId, {
      full6Digits: drawFull6,
      top3: drawTop3,
      bottom2: drawBottom2
    });
    setAdminMsg('คำนวณและจ่ายรางวัลเข้ากระเป๋าผู้ใช้อัตโนมัติเรียบร้อยแล้ว');
    setDrawFull6('');
    setDrawTop3('');
    setDrawBottom2('');
  };

  const handleExecuteAutoDraw = async () => {
    if (!selectedDrawLotteryId) return;
    await onAutoDrawLottery(selectedDrawLotteryId);
    setAdminMsg('สุ่มออกรางวัลและคำนวณจ่ายเงินรางวัลเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1A1D23] via-[#0F1115] to-[#1A1D23] p-6 rounded-2xl border border-[#C5A059] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-[#C5A059] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              ADMIN CONTROL PANEL
            </span>
            <span className="text-xs text-[#C5A059] font-semibold">ระบบบริหารจัดการหลังบ้าน</span>
          </div>
          <h2 className="text-xl font-bold text-white">ศูนย์ควบคุมการเงิน ผลรางวัล และตลาดหวย</h2>
        </div>

        <button
          onClick={async () => {
            if (confirm('คุณต้องการรีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้นหรือไม่?')) {
              await onResetSystem();
              setAdminMsg('รีเซ็ตข้อมูลระบบเรียบร้อยแล้ว');
            }
          }}
          className="bg-[#1A1D23] hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>รีเซ็ตระบบเป็นค่าเริ่มต้น</span>
        </button>
      </div>

      {/* Admin Notification Toast */}
      {adminMsg && (
        <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 p-3 rounded-xl text-xs text-[#22C55E] font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>{adminMsg}</span>
          </div>
          <button onClick={() => setAdminMsg(null)} className="text-[#888888] hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex items-center space-x-2 bg-[#0F1115] p-1.5 rounded-2xl border border-[#1E1E24] overflow-x-auto text-xs font-bold">
        {[
          { id: 'STATS', label: '1. ภาพรวมการเงิน', icon: BarChart3 },
          { id: 'MARKETS', label: '2. จัดการตลาด & อัตราจ่าย', icon: Sliders },
          { id: 'DRAW', label: '3. บันทึกผล & ออกรางวัล', icon: Dices },
          { id: 'SLIPS', label: '4. จัดการโพยลูกค้า', icon: FileSpreadsheet },
          { id: 'WALLET', label: '5. กระเป๋าเงินผู้ใช้', icon: Wallet }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#C5A059] text-black shadow-lg font-bold'
                  : 'text-[#888888] hover:bg-[#1A1D23] hover:text-[#E0E0E0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Financial Stats & Overview */}
      {activeTab === 'STATS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F1115] p-5 rounded-2xl border border-[#1E1E24] shadow-lg space-y-1">
              <span className="text-[10px] text-[#888888] uppercase font-semibold">ยอดขายรวม (Total Revenue)</span>
              <div className="text-2xl font-black text-[#C5A059]">฿{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-[10px] text-[#666666]">รวมจากโพยแทงทั้งหมด</p>
            </div>

            <div className="bg-[#0F1115] p-5 rounded-2xl border border-[#1E1E24] shadow-lg space-y-1">
              <span className="text-[10px] text-[#888888] uppercase font-semibold">ยอดจ่ายรางวัล (Total Payout)</span>
              <div className="text-2xl font-black text-rose-400">฿{stats.totalPayout.toLocaleString()}</div>
              <p className="text-[10px] text-[#666666]">รวมที่จ่ายให้โพยชนะ</p>
            </div>

            <div className="bg-[#0F1115] p-5 rounded-2xl border border-[#1E1E24] shadow-lg space-y-1">
              <span className="text-[10px] text-[#888888] uppercase font-semibold">กำไรสุทธิระบบ (Net Profit)</span>
              <div
                className={`text-2xl font-black ${stats.netProfit >= 0 ? 'text-[#22C55E]' : 'text-rose-500'}`}
              >
                ฿{stats.netProfit.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#666666]">ยอดขาย ลบ ยอดจ่าย</p>
            </div>

            <div className="bg-[#0F1115] p-5 rounded-2xl border border-[#1E1E24] shadow-lg space-y-1">
              <span className="text-[10px] text-[#888888] uppercase font-semibold">จำนวนโพยทั้งหมด</span>
              <div className="text-2xl font-black text-white">{stats.totalSlips} โพย</div>
              <p className="text-[10px] text-[#666666]">รอผล {stats.pendingSlips} / ถูกรางวัล {stats.wonSlips}</p>
            </div>
          </div>

          <div className="bg-[#0F1115] p-6 rounded-2xl border border-[#1E1E24] space-y-4">
            <h3 className="font-bold text-white text-sm">สถิติทางการเงินสรุปเรียลไทม์</h3>
            <p className="text-xs text-[#888888]">
              ระบบหลังบ้านเชื่อมต่อข้อมูลการแทง การคำนวณเงินรางวัล และยอดเงินในกระเป๋าผู้ใช้โดยอัตโนมัติ
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Market Controllers & Payout Rates */}
      {activeTab === 'MARKETS' && (
        <div className="bg-[#0F1115] rounded-2xl border border-[#1E1E24] p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="font-bold text-white text-base">จัดการเปิด/ปิดตลาด และปรับอัตราจ่าย (Payout Controller)</h3>
            <p className="text-xs text-[#888888]">แอดมินสามารถเปิด-ปิดรับแทงชั่วคราว หรือปรับเปลี่ยนอัตราจ่ายได้แบบเรียลไทม์</p>
          </div>

          <div className="space-y-4">
            {lotteries.map((market) => {
              const isOpen = market.status === 'OPEN';
              const isEditing = editingMarketId === market.id;

              return (
                <div
                  key={market.id}
                  className="bg-[#0A0A0C] p-4 rounded-xl border border-[#2D3139] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{market.flag}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{market.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOpen ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                      </div>
                      <p className="text-xs text-[#888888]">ปิดรับแทง: {market.closeTime} น.</p>
                    </div>
                  </div>

                  {/* Edit Payout Rates Form */}
                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2 text-xs bg-[#1A1D23] p-3 rounded-xl border border-[#2D3139]">
                      <div>
                        <span className="text-[10px] text-[#888888] block">3 ตัวบน:</span>
                        <input
                          type="number"
                          value={editPayouts.top3 || 900}
                          onChange={(e) => setEditPayouts({ ...editPayouts, top3: Number(e.target.value) })}
                          className="w-16 bg-[#0A0A0C] border border-[#2D3139] rounded px-1.5 py-1 text-center font-bold text-[#C5A059]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#888888] block">3 ตัวโต๊ด:</span>
                        <input
                          type="number"
                          value={editPayouts.tod3 || 130}
                          onChange={(e) => setEditPayouts({ ...editPayouts, tod3: Number(e.target.value) })}
                          className="w-16 bg-[#0A0A0C] border border-[#2D3139] rounded px-1.5 py-1 text-center font-bold text-[#C5A059]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#888888] block">2 ตัวบน/ล่าง:</span>
                        <input
                          type="number"
                          value={editPayouts.top2 || 92}
                          onChange={(e) =>
                            setEditPayouts({ ...editPayouts, top2: Number(e.target.value), bottom2: Number(e.target.value) })
                          }
                          className="w-16 bg-[#0A0A0C] border border-[#2D3139] rounded px-1.5 py-1 text-center font-bold text-[#C5A059]"
                        />
                      </div>

                      <div className="flex items-center space-x-1 pt-3">
                        <button
                          onClick={() => handleSavePayout(market.id)}
                          className="bg-[#C5A059] hover:bg-[#b59049] text-black px-3 py-1 rounded text-xs font-bold cursor-pointer"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setEditingMarketId(null)}
                          className="text-[#888888] hover:text-white px-2 py-1 text-xs cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-[#888888] block">อัตราจ่าย 3 ตัว / 2 ตัว</span>
                        <span className="font-bold text-[#C5A059]">
                          {market.payoutRates.top3}x / {market.payoutRates.top2}x
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartEditPayout(market)}
                        className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#E0E0E0] px-3 py-1.5 rounded-lg font-bold cursor-pointer border border-[#2D3139]"
                      >
                        ปรับอัตราจ่าย
                      </button>

                      <button
                        onClick={() => onToggleMarket(market.id, market.status)}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition ${
                          isOpen
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                            : 'bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 border border-[#22C55E]/30'
                        }`}
                      >
                        {isOpen ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>สั่งปิดรับแทง</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>สั่งเปิดรับแทง</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Draw Control & Auto Settlement */}
      {activeTab === 'DRAW' && (
        <div className="bg-[#0F1115] rounded-2xl border border-[#1E1E24] p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Dices className="w-5 h-5 text-[#C5A059]" />
              <span>บันทึกผลรางวัล & คำนวณจ่ายเงินอัตโนมัติ (Manual & Auto Draw Settlement)</span>
            </h3>
            <p className="text-xs text-[#888888]">
              กรอกผลรางวัลเอง หรือกดปุ่มออกรางวัลสุ่มอัตโนมัติ ระบบจะตรวจโพยของผู้ใช้ทั้งหมดและโอนเงินรางวัลเข้ากระเป๋าทันที!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0A0A0C] p-6 rounded-2xl border border-[#2D3139]">
            {/* Draw Form */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#E0E0E0]">เลือกรายการหวยที่จะออกรางวัล:</label>
                <select
                  value={selectedDrawLotteryId}
                  onChange={(e) => setSelectedDrawLotteryId(e.target.value)}
                  className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl p-2.5 text-xs text-[#C5A059] font-bold focus:outline-none"
                >
                  {lotteries.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] text-[#888888] block mb-1">ผลรางวัลเต็ม (6 หลัก):</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={drawFull6}
                    onChange={(e) => setDrawFull6(e.target.value.replace(/\D/g, ''))}
                    placeholder="เช่น 849302"
                    className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#888888] block mb-1">3 ตัวบน (ดึงอัตโนมัติ):</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={drawTop3}
                      onChange={(e) => setDrawTop3(e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 302"
                      className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3 py-2 text-sm font-bold text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#888888] block mb-1">2 ตัวล่าง (ดึงอัตโนมัติ):</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={drawBottom2}
                      onChange={(e) => setDrawBottom2(e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 49"
                      className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3 py-2 text-sm font-bold text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={handleExecuteManualDraw}
                  className="w-full bg-[#C5A059] hover:bg-[#b59049] text-black py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกผล & จ่ายเงินรางวัลตามที่กรอก</span>
                </button>

                <div className="text-center text-[11px] text-[#666666]">หรือใช้ออกรางวัลจำลองแบบสุ่ม:</div>

                <button
                  onClick={handleExecuteAutoDraw}
                  className="w-full bg-[#1A1D23] hover:bg-[#2D3139] text-[#C5A059] border border-[#C5A059] py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>🎲 สุ่มออกรางวัลอัตโนมัติ (Random Auto Draw)</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Preview */}
            <div className="bg-[#0F1115] p-4 rounded-xl border border-[#1E1E24] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="font-bold text-[#E0E0E0] text-xs">ข้อมูลโพยที่รอออกรางวัลสำหรับรายการนี้:</h4>
                {(() => {
                  const targetSlips = slips.filter(
                    (s) => s.lotteryId === selectedDrawLotteryId && s.status === 'PENDING'
                  );
                  const totalBetInRound = targetSlips.reduce((sum, s) => sum + s.totalAmount, 0);

                  return (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#888888]">
                        <span>จำนวนโพยที่รอผล:</span>
                        <span className="font-bold text-[#C5A059]">{targetSlips.length} โพย</span>
                      </div>
                      <div className="flex justify-between text-[#888888]">
                        <span>ยอดแทงรวมในงวดนี้:</span>
                        <span className="font-bold text-white">฿{totalBetInRound.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="text-[11px] text-[#888888] bg-[#0A0A0C] p-3 rounded-lg border border-[#2D3139]">
                💡 เมื่อกดปุ่มออกรางวัล ระบบจะประมวลผลโพยทั้งหมด หากถูกรางวัล ยอดเงินจะถูกโอนเข้ากระเป๋าเงินผู้ใช้ทันที
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: All Slips Manager */}
      {activeTab === 'SLIPS' && (
        <div className="bg-[#0F1115] rounded-2xl border border-[#1E1E24] p-6 space-y-5 shadow-xl">
          {/* Header & Filter / Search Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E1E24] pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-[#C5A059]" />
                <span>รายการโพยลูกค้าทั้งหมดในระบบ ({slips.length} โพย)</span>
              </h3>
              <p className="text-xs text-[#888888]">
                คลิกที่ตัวเลขโพย หรือปุ่ม "ดูรายละเอียด" เพื่อตรวจสอบตัวเลขทุกตัวที่ลูกค้าส่งเข้ามา
              </p>
            </div>

            {/* Filter Pills & Search Box */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาตาม #รหัส, ชื่อหวย, หรือตัวเลข..."
                  value={slipSearchQuery}
                  onChange={(e) => setSlipSearchQuery(e.target.value)}
                  className="bg-[#0A0A0C] border border-[#2D3139] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C5A059] w-52 sm:w-64"
                />
                {slipSearchQuery && (
                  <button
                    onClick={() => setSlipSearchQuery('')}
                    className="absolute right-2.5 top-2 text-[#888888] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center bg-[#0A0A0C] border border-[#2D3139] p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSlipFilterStatus('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    slipFilterStatus === 'ALL'
                      ? 'bg-[#C5A059] text-black font-bold'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  ทั้งหมด ({slips.length})
                </button>
                <button
                  onClick={() => setSlipFilterStatus('PENDING')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    slipFilterStatus === 'PENDING'
                      ? 'bg-[#C5A059] text-black font-bold'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  รอผล ({slips.filter((s) => s.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setSlipFilterStatus('SETTLED')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    slipFilterStatus === 'SETTLED'
                      ? 'bg-[#22C55E] text-black font-bold'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  ออกผลแล้ว ({slips.filter((s) => s.status === 'SETTLED').length})
                </button>
                <button
                  onClick={() => setSlipFilterStatus('CANCELLED')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    slipFilterStatus === 'CANCELLED'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  ยกเลิก ({slips.filter((s) => s.status === 'CANCELLED').length})
                </button>
              </div>
            </div>
          </div>

          {/* Slips List Table */}
          {(() => {
            const filteredSlips = slips.filter((s) => {
              if (slipFilterStatus !== 'ALL' && s.status !== slipFilterStatus) return false;
              if (slipSearchQuery.trim()) {
                const q = slipSearchQuery.toLowerCase();
                const matchId = s.id.toLowerCase().includes(q);
                const matchName = s.lotteryName.toLowerCase().includes(q);
                const matchItem = s.items.some((item) => item.digit.toLowerCase().includes(q));
                if (!matchId && !matchName && !matchItem) return false;
              }
              return true;
            });

            if (filteredSlips.length === 0) {
              return (
                <div className="p-12 text-center text-[#888888] space-y-2 bg-[#0A0A0C] rounded-xl border border-[#2D3139]">
                  <AlertCircle className="w-8 h-8 mx-auto text-[#666666]" />
                  <div className="text-sm font-semibold">ไม่พบรายการโพยที่ตรงตามเงื่อนไขการค้นหา</div>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto rounded-xl border border-[#2D3139]">
                <table className="w-full text-xs text-left text-[#E0E0E0]">
                  <thead className="bg-[#1A1D23] text-[#C5A059] font-bold uppercase border-b border-[#2D3139]">
                    <tr>
                      <th className="p-3 text-center">ขยาย</th>
                      <th className="p-3">รหัสโพย</th>
                      <th className="p-3">ชื่อหวย</th>
                      <th className="p-3">วันที่ / เวลา</th>
                      <th className="p-3 text-center">จำนวนตัวเลข</th>
                      <th className="p-3 text-right">ยอดแทงรวม</th>
                      <th className="p-3 text-right">เงินรางวัลที่ได้</th>
                      <th className="p-3 text-center">สถานะ</th>
                      <th className="p-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E24]">
                    {filteredSlips.map((s) => {
                      const isExpanded = expandedSlipIds.includes(s.id);
                      return (
                        <React.Fragment key={s.id}>
                          <tr className={`hover:bg-[#1A1D23]/60 transition ${isExpanded ? 'bg-[#1A1D23]/40' : ''}`}>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => toggleExpandSlip(s.id)}
                                className="p-1 rounded hover:bg-[#2D3139] text-[#C5A059] cursor-pointer transition"
                                title="ขยายดูตัวเลขในโพย"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>

                            <td
                              onClick={() => setSelectedSlipDetail(s)}
                              className="p-3 font-mono text-[#C5A059] font-black cursor-pointer hover:underline"
                            >
                              #{s.id}
                            </td>

                            <td className="p-3 font-semibold text-white">
                              {s.flag} {s.lotteryName}
                            </td>

                            <td className="p-3 text-[#888888] font-mono">
                              {s.createdAt || s.roundDate}
                            </td>

                            <td className="p-3 text-center">
                              <span className="bg-[#0A0A0C] border border-[#2D3139] text-[#E0E0E0] px-2 py-0.5 rounded-full font-bold">
                                {s.items.length} ชุดเลข
                              </span>
                            </td>

                            <td className="p-3 text-right font-black text-white">
                              ฿{s.totalAmount.toLocaleString()}
                            </td>

                            <td className="p-3 text-right font-black text-[#22C55E]">
                              ฿{s.totalWinAmount.toLocaleString()}
                            </td>

                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                  s.status === 'PENDING'
                                    ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30'
                                    : s.status === 'SETTLED'
                                    ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {s.status === 'PENDING' ? '⏳ รอผล' : s.status === 'SETTLED' ? '✅ ออกผลแล้ว' : '❌ ยกเลิก'}
                              </span>
                            </td>

                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setSelectedSlipDetail(s)}
                                className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#C5A059] border border-[#2D3139] px-2.5 py-1 rounded-lg font-bold text-[11px] transition inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>ดูรายละเอียด</span>
                              </button>

                              {s.status === 'PENDING' && (
                                <button
                                  onClick={() => onCancelSlip(s.id)}
                                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer text-[11px]"
                                >
                                  ยกเลิก
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* INLINE EXPANDED NUMBERS BREAKDOWN */}
                          {isExpanded && (
                            <tr className="bg-[#0A0A0C]">
                              <td colSpan={9} className="p-4 border-t border-[#1E1E24]">
                                <div className="space-y-3 bg-[#0F1115] p-4 rounded-xl border border-[#2D3139]">
                                  <div className="flex items-center justify-between text-xs font-bold text-[#C5A059] border-b border-[#2D3139] pb-2">
                                    <span>📋 รายการตัวเลขในโพย #{s.id} (รวม {s.items.length} รายการ):</span>
                                    <span>ยอดเดิมพันรวม: ฿{s.totalAmount.toLocaleString()}</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {s.items.map((item, idx) => (
                                      <div
                                        key={item.id || idx}
                                        className="bg-[#1A1D23] p-2.5 rounded-lg border border-[#2D3139] flex items-center justify-between text-xs"
                                      >
                                        <div>
                                          <div className="text-[10px] text-[#888888] font-semibold">
                                            {getBetTypeLabel(item.betType)}
                                          </div>
                                          <div className="font-mono font-black text-[#C5A059] text-sm">
                                            {item.digit}
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <div className="font-bold text-white">฿{item.amount.toLocaleString()}</div>
                                          <div className="text-[10px] text-[#888888]">
                                            จ่าย {item.payoutRate}x
                                          </div>
                                          {item.status === 'WIN' && (
                                            <div className="text-[10px] font-bold text-[#22C55E]">
                                              +฿{item.winAmount.toLocaleString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: User Wallet Management */}
      {activeTab === 'WALLET' && (
        <div className="bg-[#0F1115] rounded-2xl border border-[#1E1E24] p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="font-bold text-white text-base">จัดการยอดเงินผู้ใช้ & เติมเครดิตจำลอง</h3>
            <p className="text-xs text-[#888888]">เพิ่ม/ลด ยอดเงินในกระเป๋าเพื่อทดสอบสการเดิมพันขนาดใหญ่</p>
          </div>

          <div className="bg-[#0A0A0C] p-6 rounded-2xl border border-[#2D3139] space-y-4 max-w-md">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#888888]">ยอดเงินปัจจุบัน:</span>
              <span className="font-black text-[#C5A059] text-lg">฿{wallet.balance.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#E0E0E0] font-semibold">จำนวนเงินที่ต้องการปรับเพิ่ม:</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={customTopup}
                  onChange={(e) => setCustomTopup(Number(e.target.value))}
                  className="flex-1 bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3 py-2 text-sm font-bold text-[#C5A059] focus:outline-none"
                />
                <button
                  onClick={async () => {
                    await onTopupWallet(customTopup);
                    setAdminMsg(`ปรับเพิ่มเครดิตจำลอง +${customTopup.toLocaleString()} ฿ สำเร็จ`);
                  }}
                  className="bg-[#C5A059] hover:bg-[#b59049] text-black px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  เติมเครดิต
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL SLIP DETAILS MODAL */}
      {selectedSlipDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1115] border border-[#2D3139] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E1E24] pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black text-[#C5A059] font-mono">
                    #{selectedSlipDetail.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      selectedSlipDetail.status === 'PENDING'
                        ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30'
                        : selectedSlipDetail.status === 'SETTLED'
                        ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {selectedSlipDetail.status === 'PENDING'
                      ? '⏳ รอผลรางวัล'
                      : selectedSlipDetail.status === 'SETTLED'
                      ? '✅ ออกผลเรียบร้อย'
                      : '❌ ยกเลิกแล้ว'}
                  </span>
                </div>
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <span>{selectedSlipDetail.flag}</span>
                  <span>{selectedSlipDetail.lotteryName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSlipDetail(null)}
                className="text-[#888888] hover:text-white p-1.5 rounded-lg hover:bg-[#1A1D23] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Key Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0A0A0C] p-3 rounded-xl border border-[#2D3139] text-xs">
              <div>
                <div className="text-[10px] text-[#888888]">ผู้ส่งโพย:</div>
                <div className="font-bold text-white truncate">
                  User ID: {selectedSlipDetail.userId || 'DEMO_USER'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#888888]">เวลาส่งโพย:</div>
                <div className="font-mono text-[#E0E0E0]">
                  {selectedSlipDetail.createdAt || selectedSlipDetail.roundDate}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#888888]">ยอดแทงรวม:</div>
                <div className="font-black text-[#C5A059]">
                  ฿{selectedSlipDetail.totalAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#888888]">รางวัลรวมที่ชนะ:</div>
                <div className="font-black text-[#22C55E]">
                  ฿{selectedSlipDetail.totalWinAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Numbers Breakdown List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#E0E0E0]">
                <span>รายการตัวเลขที่แทงทั้งหมด ({selectedSlipDetail.items.length} รายการ):</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#2D3139]">
                <table className="w-full text-xs text-left text-[#E0E0E0]">
                  <thead className="bg-[#1A1D23] text-[#C5A059] font-bold border-b border-[#2D3139]">
                    <tr>
                      <th className="p-2.5 text-center">#</th>
                      <th className="p-2.5">ประเภท</th>
                      <th className="p-2.5 text-center">ตัวเลข</th>
                      <th className="p-2.5 text-right">ยอดแทง</th>
                      <th className="p-2.5 text-right">อัตราจ่าย</th>
                      <th className="p-2.5 text-right">รางวัลที่ได้</th>
                      <th className="p-2.5 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E24] bg-[#0A0A0C]">
                    {selectedSlipDetail.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-[#1A1D23]/50">
                        <td className="p-2.5 text-center text-[#888888] font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-[#E0E0E0]">
                          {getBetTypeLabel(item.betType)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="bg-[#1A1D23] border border-[#2D3139] text-[#C5A059] font-black font-mono px-2.5 py-1 rounded-lg text-sm inline-block shadow-sm">
                            {item.digit}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-bold text-white">
                          ฿{item.amount.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono text-[#888888]">
                          {item.payoutRate}x
                        </td>
                        <td className="p-2.5 text-right font-bold text-[#22C55E]">
                          ฿{(item.amount * item.payoutRate).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'WIN'
                                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                                : item.status === 'LOSE'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-[#C5A059]/10 text-[#C5A059]'
                            }`}
                          >
                            {item.status === 'WIN'
                              ? '🏆 ชนะรางวัล'
                              : item.status === 'LOSE'
                              ? 'ไม่ถูก'
                              : 'รอผล'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between border-t border-[#1E1E24] pt-4">
              {selectedSlipDetail.status === 'PENDING' ? (
                <button
                  onClick={async () => {
                    await onCancelSlip(selectedSlipDetail.id);
                    setSelectedSlipDetail(null);
                  }}
                  className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  ❌ ยกเลิกโพยนี้ (คืนเงินให้ลูกค้า)
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedSlipDetail(null)}
                className="bg-[#C5A059] hover:bg-[#B58F48] text-black font-extrabold px-6 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
