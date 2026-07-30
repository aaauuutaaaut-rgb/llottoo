import React, { useState } from 'react';
import { LotteryResult } from '../types';
import { Trophy, Calendar, Search } from 'lucide-react';

interface ResultsBoardProps {
  results: LotteryResult[];
}

export const ResultsBoard: React.FC<ResultsBoardProps> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredResults = results.filter(
    (r) => r.lotteryName.toLowerCase().includes(searchTerm.toLowerCase()) || r.roundDate.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F1115] p-4 rounded-2xl border border-[#1E1E24] shadow-md">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <Trophy className="w-5 h-5 text-[#C5A059]" />
          <span>ผลการออกรางวัลหวยต่างประเทศ (Draw Results)</span>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อหวย / วันที่..."
            className="w-full bg-[#0A0A0C] border border-[#2D3139] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E0E0E0] focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredResults.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#888888] text-xs border-2 border-dashed border-[#2D3139] rounded-2xl bg-[#0F1115] space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-[#666666]" />
            <div>ยังไม่มีประวัติการออกรางวัลในระบบ</div>
          </div>
        ) : (
          filteredResults.map((result, idx) => (
            <div
              key={idx}
              className="bg-[#0A0A0C] rounded-2xl border border-[#2D3139] p-5 space-y-4 hover:border-[#C5A059] transition shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1E1E24] pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{result.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-base">{result.lotteryName}</h4>
                    <p className="text-xs text-[#888888]">งวดประจำวันที่: {result.roundDate}</p>
                  </div>
                </div>

                <span className="text-[10px] bg-[#1A1D23] text-[#C5A059] border border-[#2D3139] px-2 py-1 rounded-lg">
                  {new Date(result.drawnAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </span>
              </div>

              {/* Numbers Showcase Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-[#1A1D23] p-3 rounded-xl border border-[#2D3139]">
                  <div className="text-[10px] text-[#888888] font-semibold mb-1">ผลรางวัลเต็ม 6 หลัก</div>
                  <div className="font-black text-[#E0E0E0] tracking-widest text-lg">{result.full6Digits}</div>
                </div>

                <div className="bg-[#1A1D23] p-3 rounded-xl border border-[#C5A059]">
                  <div className="text-[10px] text-[#C5A059] font-semibold mb-1">3 ตัวบน</div>
                  <div className="font-black text-[#C5A059] tracking-widest text-xl">{result.top3}</div>
                </div>

                <div className="bg-[#1A1D23] p-3 rounded-xl border border-[#2D3139] col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#E0E0E0] font-semibold mb-1">2 ตัวล่าง</div>
                  <div className="font-black text-[#C5A059] tracking-widest text-xl">{result.bottom2}</div>
                </div>
              </div>

              {/* Powerball Extra numbers if available */}
              {result.powerballMain && (
                <div className="bg-[#1A1D23] p-3 rounded-xl border border-[#C5A059] text-center space-y-1">
                  <div className="text-[10px] text-[#C5A059] font-semibold">US Powerball Numbers</div>
                  <div className="flex items-center justify-center space-x-1.5 font-bold text-xs text-white">
                    {result.powerballMain.map((num, nIdx) => (
                      <span
                        key={nIdx}
                        className="w-7 h-7 rounded-full bg-[#0A0A0C] border border-[#2D3139] text-[#C5A059] flex items-center justify-center"
                      >
                        {num.toString().padStart(2, '0')}
                      </span>
                    ))}
                    <span className="text-[#C5A059] font-bold px-1">+</span>
                    <span className="w-7 h-7 rounded-full bg-[#C5A059] text-black flex items-center justify-center font-black">
                      {result.powerballSpecial?.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
