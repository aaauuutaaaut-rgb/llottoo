import React, { useState } from 'react';
import { BetItem } from '../types';
import { Shuffle, Plus, AlertCircle, Sparkles } from 'lucide-react';

interface PowerballBallSelectorProps {
  onAddTicket: (item: Omit<BetItem, 'id' | 'status' | 'winAmount'>) => void;
  onSetFeedback: (feedback: { type: 'success' | 'error'; message: string } | null) => void;
}

export const PowerballBallSelector: React.FC<PowerballBallSelectorProps> = ({
  onAddTicket,
  onSetFeedback
}) => {
  const [selectedMains, setSelectedMains] = useState<number[]>([]);
  const [selectedSpecial, setSelectedSpecial] = useState<number | null>(null);

  // Toggle White Ball (1 to 69)
  const toggleMainBall = (num: number) => {
    if (selectedMains.includes(num)) {
      setSelectedMains((prev) => prev.filter((n) => n !== num));
    } else {
      if (selectedMains.length >= 5) {
        onSetFeedback({
          type: 'error',
          message: 'คุณเลือกเลขหลักครบ 5 ตัวแล้ว! สามารถยกเลิกบางตัวเพื่อเปลี่ยนได้'
        });
        return;
      }
      setSelectedMains((prev) => [...prev, num].sort((a, b) => a - b));
    }
  };

  // Select Powerball Special (1 to 26)
  const selectSpecialBall = (num: number) => {
    setSelectedSpecial(num);
  };

  // Quick Pick Randomizer
  const handleQuickPick = () => {
    const mains: number[] = [];
    while (mains.length < 5) {
      const rand = Math.floor(1 + Math.random() * 69);
      if (!mains.includes(rand)) mains.push(rand);
    }
    mains.sort((a, b) => a - b);
    const special = Math.floor(1 + Math.random() * 26);

    setSelectedMains(mains);
    setSelectedSpecial(special);
  };

  // Add Ticket to Slip
  const handleAddPowerballTicket = () => {
    if (selectedMains.length !== 5) {
      onSetFeedback({
        type: 'error',
        message: 'กรุณาเลือกเลขหลัก (สีขาว) ให้ครบ 5 ตัว'
      });
      return;
    }
    if (!selectedSpecial) {
      onSetFeedback({
        type: 'error',
        message: 'กรุณาเลือกเลข Powerball (สีแดง) 1 ตัว'
      });
      return;
    }

    const formatted = `${selectedMains.map((n) => n.toString().padStart(2, '0')).join(', ')} + PB ${selectedSpecial.toString().padStart(2, '0')}`;

    onAddTicket({
      digit: formatted,
      betType: 'powerball',
      amount: 100, // 100 THB per ticket
      payoutRate: 10000
    });

    // Reset selection
    setSelectedMains([]);
    setSelectedSpecial(null);
    onSetFeedback({
      type: 'success',
      message: `เพิ่มใบ Powerball [${formatted}] เข้าโพยเรียบร้อยแล้ว!`
    });
  };

  return (
    <div className="bg-[#0A0A0C] p-5 rounded-2xl border border-[#2D3139] space-y-6">
      {/* Header & Quick Pick Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E24] pb-4">
        <div>
          <h3 className="font-bold text-[#C5A059] text-base flex items-center space-x-2">
            <span>🇺🇸 US Powerball Click-to-Pick Ball Selector</span>
          </h3>
          <p className="text-xs text-[#888888]">
            คลิกเลือกเลขหลัก 5 ตัว (สีขาว) และ Powerball 1 ตัว (สีแดง)
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickPick}
          className="bg-[#C5A059] hover:bg-[#B58F48] text-black px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Shuffle className="w-4 h-4" />
          <span>🎲 สุ่มชุดเลข Quick Pick</span>
        </button>
      </div>

      {/* Selected Balls Preview Bar */}
      <div className="bg-[#1A1D23] p-4 rounded-xl border border-[#C5A059] space-y-2 text-center">
        <div className="text-[11px] text-[#888888] uppercase font-semibold tracking-wider">
          ชุดตัวเลขที่เลือกปัจจุบัน:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {selectedMains.map((num) => (
            <span
              key={num}
              className="w-9 h-9 rounded-full bg-white text-black font-black text-sm flex items-center justify-center shadow-lg border-2 border-[#C5A059] animate-fade-in"
            >
              {num.toString().padStart(2, '0')}
            </span>
          ))}
          {Array.from({ length: 5 - selectedMains.length }).map((_, i) => (
            <span
              key={i}
              className="w-9 h-9 rounded-full bg-[#0A0A0C] text-[#666666] border border-dashed border-[#2D3139] text-xs font-bold flex items-center justify-center"
            >
              ?
            </span>
          ))}

          <span className="text-[#C5A059] font-black text-lg px-1">+</span>

          {selectedSpecial ? (
            <span className="w-9 h-9 rounded-full bg-rose-600 text-white font-black text-sm flex items-center justify-center shadow-lg border-2 border-rose-400 animate-fade-in">
              {selectedSpecial.toString().padStart(2, '0')}
            </span>
          ) : (
            <span className="w-9 h-9 rounded-full bg-rose-950/40 text-rose-500/50 border border-dashed border-rose-500/30 text-xs font-bold flex items-center justify-center">
              PB
            </span>
          )}
        </div>
      </div>

      {/* White Balls Matrix (1 to 69) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#E0E0E0] flex justify-between">
          <span>1. เลือกเลขหลัก 5 ตัว (1-69):</span>
          <span className="text-[#C5A059]">{selectedMains.length} / 5</span>
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 bg-[#1A1D23] rounded-xl border border-[#2D3139]">
          {Array.from({ length: 69 }).map((_, i) => {
            const num = i + 1;
            const isSelected = selectedMains.includes(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => toggleMainBall(num)}
                className={`w-8 h-8 rounded-full font-bold text-xs transition cursor-pointer select-none flex items-center justify-center ${
                  isSelected
                    ? 'bg-white text-black font-black shadow-lg scale-110 border-2 border-[#C5A059]'
                    : 'bg-[#0A0A0C] text-[#E0E0E0] hover:bg-[#2D3139] border border-[#2D3139]'
                }`}
              >
                {num.toString().padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Red Powerball Matrix (1 to 26) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#E0E0E0] flex justify-between">
          <span>2. เลือกเลข Powerball Special 1 ตัว (1-26):</span>
          <span className="text-rose-400">{selectedSpecial ? 'เลือกแล้ว (1/1)' : '0 / 1'}</span>
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-2 bg-[#1A1D23] rounded-xl border border-[#2D3139]">
          {Array.from({ length: 26 }).map((_, i) => {
            const num = i + 1;
            const isSelected = selectedSpecial === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => selectSpecialBall(num)}
                className={`w-8 h-8 rounded-full font-bold text-xs transition cursor-pointer select-none flex items-center justify-center ${
                  isSelected
                    ? 'bg-rose-600 text-white font-black shadow-lg scale-110 border-2 border-rose-300'
                    : 'bg-[#0A0A0C] text-rose-300 hover:bg-rose-950/40 border border-rose-900/30'
                }`}
              >
                {num.toString().padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Powerball Ticket Button */}
      <button
        type="button"
        onClick={handleAddPowerballTicket}
        disabled={selectedMains.length !== 5 || !selectedSpecial}
        className={`w-full py-3.5 rounded-xl font-black text-xs transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
          selectedMains.length === 5 && selectedSpecial
            ? 'bg-[#C5A059] hover:bg-[#B58F48] text-black shadow-md'
            : 'bg-[#1A1D23] text-[#666666] border border-[#2D3139] cursor-not-allowed'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span>+ เพิ่มใบ Powerball นี้เข้าโพย (100 ฿)</span>
      </button>
    </div>
  );
};
