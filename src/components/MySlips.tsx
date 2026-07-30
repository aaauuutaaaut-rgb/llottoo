import React, { useState } from 'react';
import { BetSlip } from '../types';
import { FileText, CheckCircle2, XCircle, Clock, Search, RotateCcw } from 'lucide-react';

interface MySlipsProps {
  slips: BetSlip[];
  onCancelSlip: (slipId: string) => Promise<void>;
}

export const MySlips: React.FC<MySlipsProps> = ({ slips, onCancelSlip }) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'SETTLED' | 'CANCELLED'>('ALL');
  const [searchId, setSearchId] = useState<string>('');
  const [selectedSlip, setSelectedSlip] = useState<BetSlip | null>(null);

  const filteredSlips = slips.filter((s) => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch = s.id.toLowerCase().includes(searchId.toLowerCase()) || s.lotteryName.includes(searchId);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F1115] p-4 rounded-2xl border border-[#1E1E24] shadow-md">
        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'SETTLED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : 'bg-[#1A1D23] text-[#E0E0E0] hover:bg-[#2D3139] border border-[#2D3139]'
              }`}
            >
              {st === 'ALL' && 'โพยทั้งหมด'}
              {st === 'PENDING' && 'รอผลรางวัล'}
              {st === 'SETTLED' && 'ออกผลแล้ว'}
              {st === 'CANCELLED' && 'ยกเลิกแล้ว'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="ค้นหาตามรหัสโพย / ชื่อหวย..."
            className="w-full bg-[#0A0A0C] border border-[#2D3139] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E0E0E0] focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Slips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSlips.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#888888] text-xs border-2 border-dashed border-[#2D3139] rounded-2xl bg-[#0F1115] space-y-2">
            <FileText className="w-8 h-8 mx-auto text-[#666666]" />
            <div>ยังไม่มีโพยหวยในหมวดหมู่นี้</div>
            <p className="text-[11px] text-[#666666]">เลือกแทงหวยเพื่อสร้างโพยของคุณ</p>
          </div>
        ) : (
          filteredSlips.map((slip) => {
            const isWon = slip.totalWinAmount > 0;
            return (
              <div
                key={slip.id}
                className="bg-[#0A0A0C] rounded-2xl border border-[#2D3139] p-5 space-y-4 hover:border-[#C5A059] transition shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Top */}
                  <div className="flex items-start justify-between border-b border-[#1E1E24] pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{slip.flag}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{slip.lotteryName}</h4>
                        <p className="text-[11px] text-[#888888]">โพย #{slip.id} • {new Date(slip.createdAt).toLocaleString('th-TH')}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1 ${
                        slip.status === 'PENDING'
                          ? 'bg-[#1A1D23] text-[#C5A059] border border-[#C5A059]/40'
                          : slip.status === 'SETTLED'
                          ? isWon
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                            : 'bg-[#1A1D23] text-[#888888] border border-[#2D3139]'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {slip.status === 'PENDING' && (
                        <>
                          <Clock className="w-3 h-3 text-[#C5A059]" />
                          <span>รอผลรางวัล</span>
                        </>
                      )}
                      {slip.status === 'SETTLED' &&
                        (isWon ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                            <span>ถูกรางวัล!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-[#888888]" />
                            <span>ไม่ถูกรางวัล</span>
                          </>
                        ))}
                      {slip.status === 'CANCELLED' && <span>ยกเลิกแล้ว</span>}
                    </span>
                  </div>

                  {/* Summary Rows */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#1A1D23] p-3 rounded-xl border border-[#2D3139]">
                    <div>
                      <span className="text-[#888888] text-[10px]">จำนวนรายการ:</span>
                      <div className="font-bold text-[#E0E0E0]">{slip.items.length} เลข</div>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px]">ยอดแทงรวม:</span>
                      <div className="font-bold text-[#C5A059]">฿{slip.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Winning Amount Callout if won */}
                  {slip.status === 'SETTLED' && isWon && (
                    <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 p-2.5 rounded-xl text-center">
                      <span className="text-xs text-[#22C55E] font-bold">
                        🎉 ชนะรางวัลรับเงินเข้ากระเป๋า: +฿{slip.totalWinAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#1E1E24] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedSlip(slip)}
                    className="text-xs font-bold text-[#C5A059] hover:underline cursor-pointer"
                  >
                    ดูรายละเอียดตัวเลขในโพย
                  </button>

                  {slip.status === 'PENDING' && (
                    <button
                      onClick={() => onCancelSlip(slip.id)}
                      className="bg-[#1A1D23] hover:bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ยกเลิกโพย</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slip Items Detail Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1115] border border-[#2D3139] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E1E24] pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <span>{selectedSlip.flag}</span>
                  <span>รายละเอียดโพย #{selectedSlip.id}</span>
                </h3>
                <p className="text-xs text-[#888888]">{selectedSlip.lotteryName}</p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-[#888888] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#888888]">รายการตัวเลขทั้งหมด:</div>
              <div className="space-y-1.5">
                {selectedSlip.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      item.status === 'WIN'
                        ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
                        : 'bg-[#0A0A0C] border-[#2D3139] text-[#E0E0E0]'
                    }`}
                  >
                    <div>
                      <span className="font-black tracking-wider text-[#C5A059] text-sm">{item.digit}</span>
                      <span className="text-[10px] text-[#888888] ml-2">({item.betType})</span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">{item.amount} ฿</div>
                      {item.status === 'WIN' ? (
                        <div className="text-[10px] font-bold text-[#22C55E]">
                          ถูกรางวัล +{item.winAmount.toLocaleString()} ฿
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#888888]">
                          {item.status === 'PENDING' ? 'รอผล' : 'ไม่ถูกรางวัล'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E1E24] flex justify-between items-center text-xs">
              <span className="text-[#888888]">ยอดรวมเดิมพัน:</span>
              <span className="font-bold text-[#C5A059] text-sm">฿{selectedSlip.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
