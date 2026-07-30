import React, { useState } from 'react';
import { BetType, BetItem } from '../types';
import {
  Grid,
  Calculator,
  Layers,
  Sparkles,
  Delete,
  RotateCcw,
  Plus,
  Check,
  Zap,
  Filter
} from 'lucide-react';

interface NumberKeypadProps {
  betType: BetType;
  payoutRate: number;
  globalAmount: number;
  onAddItems: (items: Omit<BetItem, 'id' | 'status' | 'winAmount'>[]) => void;
  onSetFeedback: (feedback: { type: 'success' | 'error'; message: string } | null) => void;
}

type InputMode = 'keypad' | 'columns' | 'presets' | 'grid2d';

export const NumberKeypad: React.FC<NumberKeypadProps> = ({
  betType,
  payoutRate,
  globalAmount,
  onAddItems,
  onSetFeedback
}) => {
  const [activeMode, setActiveMode] = useState<InputMode>('keypad');

  // MODE 1: Keypad State
  const [digits, setDigits] = useState<string>('');

  // MODE 2: Column Selector State (For 3D / 2D)
  const [hundreds, setHundreds] = useState<number[]>([]);
  const [tens, setTens] = useState<number[]>([]);
  const [ones, setOnes] = useState<number[]>([]);

  // MODE 4: Grid 00-99 Selected Numbers
  const [selectedGrid2D, setSelectedGrid2D] = useState<string[]>([]);

  // Required length for keypad input
  const getRequiredLength = (): number => {
    if (betType === 'top2' || betType === 'bottom2') return 2;
    if (betType === 'runTop' || betType === 'runBottom') return 1;
    return 3; // top3, tod3
  };

  const reqLen = getRequiredLength();

  // Handle Keypad Press (0-9) - Auto add to slip when required length is reached
  const handleKeypadPress = (numStr: string) => {
    const currentDigits = digits.length >= reqLen ? '' : digits;
    const newDigits = currentDigits + numStr;

    if (newDigits.length === reqLen) {
      // Auto add to slip immediately!
      onAddItems([
        {
          digit: newDigits,
          betType: betType,
          amount: globalAmount,
          payoutRate: payoutRate
        }
      ]);
      setDigits('');
      onSetFeedback({
        type: 'success',
        message: `⚡ เด้งเข้าโพยแล้ว! เพิ่มเลข ${newDigits} (${betType}) เรียบร้อย`
      });
    } else {
      setDigits(newDigits);
    }
  };

  const handleKeypadBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setDigits('');
  };

  // Add Keypad Digit to Slip
  const handleAddKeypadDigit = () => {
    if (!digits) return;
    if (digits.length !== reqLen) {
      onSetFeedback({
        type: 'error',
        message: `กรุณากดเลือกตัวเลขให้ครบ ${reqLen} หลัก`
      });
      return;
    }

    onAddItems([
      {
        digit: digits,
        betType: betType,
        amount: globalAmount,
        payoutRate: payoutRate
      }
    ]);

    setDigits('');
    onSetFeedback({
      type: 'success',
      message: `เพิ่มเลข ${digits} (${betType}) เข้าโพยแล้ว`
    });
  };

  // Quick Reverse (กลับเลข) for Keypad Digits
  const handleKeypadReverse = () => {
    if (!digits) return;
    if (digits.length === 2) {
      const orig = digits;
      const rev = digits.split('').reverse().join('');
      const list = [orig];
      if (orig !== rev) list.push(rev);

      onAddItems(
        list.map((d) => ({
          digit: d,
          betType,
          amount: globalAmount,
          payoutRate
        }))
      );
      setDigits('');
      onSetFeedback({
        type: 'success',
        message: `เพิ่มเลขกลับ (${list.join(', ')}) เรียบร้อยแล้ว`
      });
    } else if (digits.length === 3) {
      const set3 = new Set<string>();
      const chars = digits.split('');
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
      onAddItems(
        arr.map((d) => ({
          digit: d,
          betType,
          amount: globalAmount,
          payoutRate
        }))
      );
      setDigits('');
      onSetFeedback({
        type: 'success',
        message: `เพิ่มเลขกลับ 3 ตัว (${arr.join(', ')}) เรียบร้อยแล้ว`
      });
    }
  };

  // 19 Doors Generator from single digit
  const handle19DoorsKeypad = () => {
    if (!digits || digits.length !== 1) {
      onSetFeedback({
        type: 'error',
        message: 'กรุณากดตัวเลข 1 หลักเพื่อสร้าง 19 ประตู'
      });
      return;
    }
    const d = digits;
    const list: string[] = [];
    for (let i = 0; i <= 9; i++) {
      list.push(`${d}${i}`);
      if (i.toString() !== d) {
        list.push(`${i}${d}`);
      }
    }

    const items: Omit<BetItem, 'id' | 'status' | 'winAmount'>[] = [];
    list.forEach((num) => {
      items.push({ digit: num, betType: 'top2', amount: globalAmount, payoutRate: payoutRate });
      items.push({ digit: num, betType: 'bottom2', amount: globalAmount, payoutRate: payoutRate });
    });

    onAddItems(items);
    setDigits('');
    onSetFeedback({
      type: 'success',
      message: `เพิ่ม 19 ประตูเลข (${d}) รวม ${items.length} รายการสำเร็จ`
    });
  };

  // --- MODE 2: Column Selection Helpers ---
  const toggleColumnNum = (
    colSetter: React.Dispatch<React.SetStateAction<number[]>>,
    num: number
  ) => {
    colSetter((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const handleClearColumns = () => {
    setHundreds([]);
    setTens([]);
    setOnes([]);
  };

  // Generate combinations from Columns
  const handleAddColumnsToSlip = () => {
    const is3D = betType === 'top3' || betType === 'tod3';
    const is2D = betType === 'top2' || betType === 'bottom2';

    if (is3D) {
      if (hundreds.length === 0 || tens.length === 0 || ones.length === 0) {
        onSetFeedback({
          type: 'error',
          message: 'กรุณาเลือกตัวเลขให้ครบทั้ง 3 หลัก (หลักร้อย, หลักสิบ, หลักหน่วย)'
        });
        return;
      }
      const combos: string[] = [];
      hundreds.forEach((h) => {
        tens.forEach((t) => {
          ones.forEach((o) => {
            combos.push(`${h}${t}${o}`);
          });
        });
      });

      onAddItems(
        combos.map((d) => ({
          digit: d,
          betType,
          amount: globalAmount,
          payoutRate
        }))
      );
      handleClearColumns();
      onSetFeedback({
        type: 'success',
        message: `เพิ่มเลขจากคอลัมน์รวม ${combos.length} รายการเรียบร้อยแล้ว`
      });
    } else if (is2D) {
      if (tens.length === 0 || ones.length === 0) {
        onSetFeedback({
          type: 'error',
          message: 'กรุณาเลือกตัวเลขให้ครบทั้ง 2 หลัก (หลักสิบ, หลักหน่วย)'
        });
        return;
      }
      const combos: string[] = [];
      tens.forEach((t) => {
        ones.forEach((o) => {
          combos.push(`${t}${o}`);
        });
      });

      onAddItems(
        combos.map((d) => ({
          digit: d,
          betType,
          amount: globalAmount,
          payoutRate
        }))
      );
      handleClearColumns();
      onSetFeedback({
        type: 'success',
        message: `เพิ่มเลขจากคอลัมน์รวม ${combos.length} รายการเรียบร้อยแล้ว`
      });
    }
  };

  // --- MODE 3: Preset Generators ---
  const handleAddPreset = (type: string) => {
    let list: string[] = [];
    let targetBetType = betType;

    if (type === 'doubles2d') {
      targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';
      list = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    } else if (type === 'triples3d') {
      targetBetType = betType === 'tod3' ? 'tod3' : 'top3';
      list = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];
    } else if (type === 'siblings2d') {
      targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';
      list = ['01', '12', '23', '34', '45', '56', '67', '78', '89', '90', '10', '21', '32', '43', '54', '65', '76', '87', '98', '09'];
    } else if (type === 'low2d') {
      targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';
      for (let i = 0; i <= 49; i++) list.push(i.toString().padStart(2, '0'));
    } else if (type === 'high2d') {
      targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';
      for (let i = 50; i <= 99; i++) list.push(i.toString().padStart(2, '0'));
    } else if (type === 'even2d') {
      targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';
      for (let i = 0; i <= 98; i += 2) list.push(i.toString().padStart(2, '0'));
    } else if (type === 'odd2d') {
      targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';
      for (let i = 1; i <= 99; i += 2) list.push(i.toString().padStart(2, '0'));
    }

    if (list.length > 0) {
      onAddItems(
        list.map((d) => ({
          digit: d,
          betType: targetBetType,
          amount: globalAmount,
          payoutRate
        }))
      );
      onSetFeedback({
        type: 'success',
        message: `เพิ่มชุดเลขสำเร็จรูป (${list.length} รายการ) เรียบร้อยแล้ว`
      });
    }
  };

  // --- MODE 4: Grid 00-99 Selection Helpers ---
  const toggleGrid2DNumber = (numStr: string) => {
    setSelectedGrid2D((prev) =>
      prev.includes(numStr) ? prev.filter((n) => n !== numStr) : [...prev, numStr]
    );
  };

  const handleSelectAllGrid2D = () => {
    const all: string[] = [];
    for (let i = 0; i <= 99; i++) all.push(i.toString().padStart(2, '0'));
    setSelectedGrid2D(all);
  };

  const handleClearGrid2D = () => {
    setSelectedGrid2D([]);
  };

  const handleSelectDoublesGrid2D = () => {
    setSelectedGrid2D(['00', '11', '22', '33', '44', '55', '66', '77', '88', '99']);
  };

  const handleAddGrid2DToSlip = () => {
    if (selectedGrid2D.length === 0) return;
    const targetBetType = betType === 'bottom2' ? 'bottom2' : 'top2';

    onAddItems(
      selectedGrid2D.map((d) => ({
        digit: d,
        betType: targetBetType,
        amount: globalAmount,
        payoutRate
      }))
    );

    setSelectedGrid2D([]);
    onSetFeedback({
      type: 'success',
      message: `เพิ่มตัวเลขจากตาราง 2 ตัว รวม ${selectedGrid2D.length} รายการสำเร็จ`
    });
  };

  return (
    <div className="space-y-4">
      {/* Selector Mode Navigation Tabs */}
      <div className="bg-[#0A0A0C] p-1 rounded-xl border border-[#2D3139] grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveMode('keypad')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeMode === 'keypad'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>1. คีย์แพด (0-9)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('columns')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeMode === 'columns'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. เลือกตามหลัก</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('presets')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeMode === 'presets'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>3. ชุดเลขด่วน</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('grid2d')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeMode === 'grid2d'
              ? 'bg-[#C5A059] text-black shadow-md'
              : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>4. ตาราง 00-99</span>
        </button>
      </div>

      {/* MODE 1: ON-SCREEN DIGITAL KEYPAD */}
      {activeMode === 'keypad' && (
        <div className="bg-[#0A0A0C] p-4 rounded-xl border border-[#2D3139] space-y-4">
          {/* Digits Display Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span>ตัวเลขที่เลือก (ต้องการ {reqLen} หลัก):</span>
              <span className="text-[#C5A059] font-bold flex items-center space-x-1">
                <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] px-1.5 py-0.5 rounded font-normal">
                  ⚡ เด้งเข้าโพยอัตโนมัติเมื่อกดครบ
                </span>
                <span>{digits.length} / {reqLen}</span>
              </span>
            </div>

            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-xl p-3 flex items-center justify-center space-x-3 h-14 shadow-inner">
              {Array.from({ length: reqLen }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black transition border ${
                    digits[idx]
                      ? 'bg-[#0A0A0C] border-[#C5A059] text-[#C5A059] shadow-md scale-105'
                      : 'bg-[#0A0A0C]/50 border-[#2D3139] text-[#666666]'
                  }`}
                >
                  {digits[idx] || '_'}
                </div>
              ))}
            </div>
          </div>

          {/* Keypad Buttons Grid 3x4 */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((numStr) => (
              <button
                key={numStr}
                type="button"
                onClick={() => handleKeypadPress(numStr)}
                className="bg-[#1A1D23] hover:bg-[#2D3139] active:bg-[#C5A059] active:text-black text-white font-black text-xl py-3 rounded-xl border border-[#2D3139] transition cursor-pointer shadow-sm flex items-center justify-center select-none"
              >
                {numStr}
              </button>
            ))}

            <button
              type="button"
              onClick={handleKeypadClear}
              className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 font-bold text-xs py-3 rounded-xl border border-rose-500/30 transition cursor-pointer flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              ล้าง
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] active:bg-[#C5A059] active:text-black text-white font-black text-xl py-3 rounded-xl border border-[#2D3139] transition cursor-pointer shadow-sm flex items-center justify-center select-none"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#888888] hover:text-white font-bold text-xs py-3 rounded-xl border border-[#2D3139] transition cursor-pointer flex items-center justify-center"
            >
              <Delete className="w-4 h-4 mr-1" />
              ลบ
            </button>
          </div>

          {/* Action Button: Add Number to Slip */}
          <button
            type="button"
            onClick={handleAddKeypadDigit}
            disabled={digits.length !== reqLen}
            className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
              digits.length === reqLen
                ? 'bg-[#C5A059] hover:bg-[#B58F48] text-black font-extrabold'
                : 'bg-[#1A1D23] text-[#666666] border border-[#2D3139] cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มเลข {digits || ''} ใส่โพย</span>
          </button>

          {/* Quick Transformations */}
          <div className="pt-2 border-t border-[#1E1E24] grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleKeypadReverse}
              disabled={!digits || (digits.length !== 2 && digits.length !== 3)}
              className="bg-[#1A1D23] hover:bg-[#2D3139] disabled:opacity-40 text-[#E0E0E0] border border-[#2D3139] py-2 rounded-lg font-bold transition cursor-pointer"
            >
              🔄 กลับเลข ({digits || ''})
            </button>

            <button
              type="button"
              onClick={handle19DoorsKeypad}
              disabled={!digits || digits.length !== 1}
              className="bg-[#1A1D23] hover:bg-[#2D3139] disabled:opacity-40 text-[#C5A059] border border-[#2D3139] py-2 rounded-lg font-bold transition cursor-pointer"
            >
              🚪 19 ประตู (เลข {digits || '_'})
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: COLUMN SELECTION (หลักร้อย, หลักสิบ, หลักหน่วย) */}
      {activeMode === 'columns' && (
        <div className="bg-[#0A0A0C] p-4 rounded-xl border border-[#2D3139] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#E0E0E0] font-semibold">
              แตะเลือกตัวเลขในแต่ละหลักเพื่อสร้างชุดเลขรวม:
            </span>
            <button
              type="button"
              onClick={handleClearColumns}
              className="text-[#888888] hover:text-rose-400 font-bold underline cursor-pointer"
            >
              ล้างหลักทั้งหมด
            </button>
          </div>

          <div
            className={`grid gap-3 ${
              betType === 'top3' || betType === 'tod3' ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {/* Column Hundreds (For 3D) */}
            {(betType === 'top3' || betType === 'tod3') && (
              <div className="space-y-2 bg-[#1A1D23] p-2.5 rounded-xl border border-[#2D3139]">
                <div className="text-[11px] font-bold text-[#C5A059] text-center border-b border-[#2D3139] pb-1">
                  หลักร้อย ({hundreds.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => toggleColumnNum(setHundreds, num)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        hundreds.includes(num)
                          ? 'bg-[#C5A059] text-black border-[#C5A059]'
                          : 'bg-[#0A0A0C] text-[#E0E0E0] border-[#2D3139] hover:border-[#C5A059]/50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Column Tens */}
            <div className="space-y-2 bg-[#1A1D23] p-2.5 rounded-xl border border-[#2D3139]">
              <div className="text-[11px] font-bold text-[#C5A059] text-center border-b border-[#2D3139] pb-1">
                หลักสิบ ({tens.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleColumnNum(setTens, num)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      tens.includes(num)
                        ? 'bg-[#C5A059] text-black border-[#C5A059]'
                        : 'bg-[#0A0A0C] text-[#E0E0E0] border-[#2D3139] hover:border-[#C5A059]/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Ones */}
            <div className="space-y-2 bg-[#1A1D23] p-2.5 rounded-xl border border-[#2D3139]">
              <div className="text-[11px] font-bold text-[#C5A059] text-center border-b border-[#2D3139] pb-1">
                หลักหน่วย ({ones.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleColumnNum(setOnes, num)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      ones.includes(num)
                        ? 'bg-[#C5A059] text-black border-[#C5A059]'
                        : 'bg-[#0A0A0C] text-[#E0E0E0] border-[#2D3139] hover:border-[#C5A059]/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddColumnsToSlip}
            className="w-full bg-[#C5A059] hover:bg-[#B58F48] text-black py-3 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>สร้างและเพิ่มเลขจากคอลัมน์เข้าโพย</span>
          </button>
        </div>
      )}

      {/* MODE 3: QUICK PRESET PATTERNS */}
      {activeMode === 'presets' && (
        <div className="bg-[#0A0A0C] p-4 rounded-xl border border-[#2D3139] space-y-3">
          <div className="text-xs font-semibold text-[#E0E0E0]">
            กดปุ่มสร้างชุดตัวเลขยอดนิยมแบบอัตโนมัติ:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleAddPreset('doubles2d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer"
            >
              <div className="text-[#C5A059] font-black">เลขเบิ้ล 2 ตัว</div>
              <div className="text-[10px] text-[#888888] font-normal">00, 11, 22 ... 99 (10 ชุด)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset('triples3d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer"
            >
              <div className="text-[#C5A059] font-black">เลขตอง 3 ตัว</div>
              <div className="text-[10px] text-[#888888] font-normal">000, 111, 222 ... 999 (10 ชุด)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset('siblings2d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer"
            >
              <div className="text-white font-black">เลขพี่น้อง (Siblings)</div>
              <div className="text-[10px] text-[#888888] font-normal">01, 12, 23, 34 ... (20 ชุด)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset('even2d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer"
            >
              <div className="text-white font-black">ชุดเลขคู่ (Even)</div>
              <div className="text-[10px] text-[#888888] font-normal">00, 02, 04 ... 98 (50 ชุด)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset('odd2d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer"
            >
              <div className="text-white font-black">ชุดเลขคี่ (Odd)</div>
              <div className="text-[10px] text-[#888888] font-normal">01, 03, 05 ... 99 (50 ชุด)</div>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset('low2d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer"
            >
              <div className="text-white font-black">ชุดเลขต่ำ (00-49)</div>
              <div className="text-[10px] text-[#888888] font-normal">50 รายการ</div>
            </button>

            <button
              type="button"
              onClick={() => handleAddPreset('high2d')}
              className="bg-[#1A1D23] hover:bg-[#2D3139] p-3 rounded-xl border border-[#2D3139] text-[#E0E0E0] hover:text-white text-left transition cursor-pointer col-span-2 sm:col-span-1"
            >
              <div className="text-white font-black">ชุดเลขสูง (50-99)</div>
              <div className="text-[10px] text-[#888888] font-normal">50 รายการ</div>
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: DIRECT 00-99 MATRIX GRID */}
      {activeMode === 'grid2d' && (
        <div className="bg-[#0A0A0C] p-4 rounded-xl border border-[#2D3139] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#E0E0E0] font-semibold flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>แตะเลือกเลข 00-99 ({selectedGrid2D.length} เลือกอยู่):</span>
            </span>

            <div className="flex items-center space-x-1 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAllGrid2D}
                className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#E0E0E0] px-2 py-1 rounded border border-[#2D3139] cursor-pointer"
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={handleSelectDoublesGrid2D}
                className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#C5A059] px-2 py-1 rounded border border-[#2D3139] cursor-pointer"
              >
                เฉพาะเลขเบิ้ล
              </button>
              <button
                type="button"
                onClick={handleClearGrid2D}
                className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 px-2 py-1 rounded border border-rose-500/30 cursor-pointer"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* 10x10 Grid */}
          <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto p-1 bg-[#1A1D23] rounded-xl border border-[#2D3139]">
            {Array.from({ length: 100 }).map((_, i) => {
              const numStr = i.toString().padStart(2, '0');
              const isSelected = selectedGrid2D.includes(numStr);
              return (
                <button
                  key={numStr}
                  type="button"
                  onClick={() => toggleGrid2DNumber(numStr)}
                  className={`py-2 text-[11px] font-mono font-bold rounded transition cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#C5A059] text-black font-black scale-105 shadow-md z-10'
                      : 'bg-[#0A0A0C] text-[#E0E0E0] hover:bg-[#2D3139] hover:text-white border border-[#2D3139]/50'
                  }`}
                >
                  {numStr}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddGrid2DToSlip}
            disabled={selectedGrid2D.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
              selectedGrid2D.length > 0
                ? 'bg-[#C5A059] hover:bg-[#B58F48] text-black font-extrabold'
                : 'bg-[#1A1D23] text-[#666666] border border-[#2D3139] cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>เพิ่มเลขที่เลือก ({selectedGrid2D.length} ตัว) ใส่โพย</span>
          </button>
        </div>
      )}
    </div>
  );
};
