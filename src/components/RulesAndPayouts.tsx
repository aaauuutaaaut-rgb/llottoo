import React from 'react';
import { BookOpen, ShieldCheck, Zap } from 'lucide-react';

export const RulesAndPayouts: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A1D23] via-[#0F1115] to-[#1A1D23] p-6 rounded-2xl border border-[#C5A059] text-white space-y-2 shadow-xl">
        <div className="flex items-center space-x-2 font-bold text-sm text-[#C5A059]">
          <BookOpen className="w-5 h-5" />
          <span>กฎกติกาและอัตราการจ่ายเงินรางวัล (Rules & Payout Rates)</span>
        </div>
        <h2 className="text-2xl font-black text-[#C5A059]">กติกาการแทงหวยออนไลน์ NO SmiIee LOTTO</h2>
        <p className="text-xs font-semibold opacity-90 text-[#888888]">
          เรียนรู้รูปแบบการแทงและอัตราการจ่ายเงินรางวัลของหวยลาว หวยฮานอย หวยหุ้น และ US Powerball
        </p>
      </div>

      {/* Payout Matrix Table */}
      <div className="bg-[#0F1115] rounded-2xl border border-[#1E1E24] p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#C5A059]" />
          <span>ตารางอัตราจ่ายมาตรฐาน (บาทละ)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#E0E0E0]">
            <thead className="bg-[#1A1D23] text-[#C5A059] font-bold uppercase border-b border-[#2D3139]">
              <tr>
                <th className="p-3">ประเภทการแทง (Bet Type)</th>
                <th className="p-3">ตัวอย่างเลข</th>
                <th className="p-3 text-right">อัตราจ่าย (เท่า)</th>
                <th className="p-3 text-right">แทง 100 บาท ชนะได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E24]">
              <tr className="hover:bg-[#1A1D23]/50">
                <td className="p-3 font-bold text-white">3 ตัวบน (Top 3)</td>
                <td className="p-3 font-mono text-[#C5A059]">851</td>
                <td className="p-3 text-right font-bold text-[#C5A059]">900x</td>
                <td className="p-3 text-right font-bold text-[#22C55E]">90,000 ฿</td>
              </tr>
              <tr className="hover:bg-[#1A1D23]/50">
                <td className="p-3 font-bold text-white">3 ตัวโต๊ด (Tod 3)</td>
                <td className="p-3 font-mono text-[#C5A059]">158, 518, 815...</td>
                <td className="p-3 text-right font-bold text-[#C5A059]">130x</td>
                <td className="p-3 text-right font-bold text-[#22C55E]">13,000 ฿</td>
              </tr>
              <tr className="hover:bg-[#1A1D23]/50">
                <td className="p-3 font-bold text-white">2 ตัวบน (Top 2)</td>
                <td className="p-3 font-mono text-[#C5A059]">51</td>
                <td className="p-3 text-right font-bold text-[#C5A059]">92x</td>
                <td className="p-3 text-right font-bold text-[#22C55E]">9,200 ฿</td>
              </tr>
              <tr className="hover:bg-[#1A1D23]/50">
                <td className="p-3 font-bold text-white">2 ตัวล่าง (Bottom 2)</td>
                <td className="p-3 font-mono text-[#C5A059]">42</td>
                <td className="p-3 text-right font-bold text-[#C5A059]">92x</td>
                <td className="p-3 text-right font-bold text-[#22C55E]">9,200 ฿</td>
              </tr>
              <tr className="hover:bg-[#1A1D23]/50">
                <td className="p-3 font-bold text-white">วิ่งบน (Run Top)</td>
                <td className="p-3 font-mono text-[#C5A059]">5 (มีใน 851)</td>
                <td className="p-3 text-right font-bold text-[#C5A059]">3.2x</td>
                <td className="p-3 text-right font-bold text-[#22C55E]">320 ฿</td>
              </tr>
              <tr className="hover:bg-[#1A1D23]/50">
                <td className="p-3 font-bold text-white">วิ่งล่าง (Run Bottom)</td>
                <td className="p-3 font-mono text-[#C5A059]">2 (มีใน 42)</td>
                <td className="p-3 text-right font-bold text-[#C5A059]">4.2x</td>
                <td className="p-3 text-right font-bold text-[#22C55E]">420 ฿</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lottery Categories Rules Description Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-[#0F1115] border border-[#1E1E24] p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <span>🇱🇦 หวยลาว (Lao Lottery)</span>
          </h4>
          <p className="text-[#888888] leading-relaxed">
            อ้างอิงจากผลการออกรางวัลสลากพัฒนา สปป.ลาว ออกรางวัลสัปดาห์ละ 3 วัน (จันทร์, พุธ, ศุกร์) เวลาประมาณ 20:30 น.
            ใช้เลข 3 ตัวท้ายของรางวัลใหญ่เป็น 3 ตัวบน และใช้เลข 2 ตัวหน้าของ 4 ตัวท้ายเป็น 2 ตัวล่าง
          </p>
        </div>

        <div className="bg-[#0F1115] border border-[#1E1E24] p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <span>🇻🇳 หวยฮานอย (Hanoi Lottery)</span>
          </h4>
          <p className="text-[#888888] leading-relaxed">
            หวยจากประเทศเวียดนาม ออกรางวัลทุกวัน แบ่งเป็นรอบ ฮานอยพิเศษ (17:30 น.), ฮานอยปกติ (18:30 น.) และ ฮานอย VIP (19:30 น.)
            ใช้เลข 3 ตัวท้ายของรางวัล Dac Biet เป็น 3 ตัวบน และเลข 2 ตัวท้ายของรางวัล Giai Nhat เป็น 2 ตัวล่าง
          </p>
        </div>

        <div className="bg-[#0F1115] border border-[#1E1E24] p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <span>📈 หวยหุ้นต่างประเทศ (Stock Lotteries)</span>
          </h4>
          <p className="text-[#888888] leading-relaxed">
            อ้างอิงจากดัชนีปิดตลาดหุ้นต่างประเทศจริง เช่น Nikkei 225 (ญี่ปุ่น), Hang Seng (ฮ่องกง), และ Dow Jones (สหรัฐฯ)
            นำตัวเลขทศนิยมและจุดปิดตลาดมาคำนวณผลรางวัล ยุติธรรม โปร่งใส ตรวจสอบได้
          </p>
        </div>

        <div className="bg-[#0F1115] border border-[#1E1E24] p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <span>🇺🇸 US Powerball (สากล)</span>
          </h4>
          <p className="text-[#888888] leading-relaxed">
            ลอตเตอรี่ระดับโลกจากสหรัฐอเมริกา เลือก 5 เลขหลัก (1-69) และ 1 Powerball (1-26)
            มีระบบสุ่ม Quick Pick แบบโปรเฟสชันแนล ลุ้นรางวัลใหญ่สะสม
          </p>
        </div>
      </div>
    </div>
  );
};
