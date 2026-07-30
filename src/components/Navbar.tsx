import React, { useState, useEffect } from 'react';
import { UserWallet } from '../types';
import { Wallet, ShieldCheck, Globe, Trophy, FileText, BarChart3, PlusCircle, RefreshCw } from 'lucide-react';

interface NavbarProps {
  wallet: UserWallet;
  activeView: 'PLAYER' | 'ADMIN';
  setActiveView: (view: 'PLAYER' | 'ADMIN') => void;
  playerTab: 'LOTTERIES' | 'MY_SLIPS' | 'RESULTS' | 'RULES';
  setPlayerTab: (tab: 'LOTTERIES' | 'MY_SLIPS' | 'RESULTS' | 'RULES') => void;
  onOpenTopup: () => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  activeView,
  setActiveView,
  playerTab,
  setPlayerTab,
  onOpenTopup,
  onRefreshData
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('th-TH', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#0F1115] border-b border-[#1E1E24] text-[#E0E0E0] sticky top-0 z-40 shadow-2xl">
      {/* Top Banner Notice */}
      <div className="bg-[#1A1D23] border-b border-[#2D3139] text-[#C5A059] px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-[#C5A059] text-black px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            OFFICIAL SITE
          </span>
          <span className="text-xs text-[#E0E0E0]">NO SmiIee LOTTO — เว็บแทงหวยออนไลน์ อัตราจ่ายสูง บริหารจัดการระบบครบวงจร</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <span className="text-[#888888]">🕒 เวลาไทย: <span className="text-[#E0E0E0]">{timeStr}</span> น.</span>
          <button
            onClick={onRefreshData}
            className="flex items-center space-x-1 text-[#C5A059] hover:underline cursor-pointer opacity-90 hover:opacity-100"
          >
            <RefreshCw className="w-3 h-3" />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo Brand */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('PLAYER')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1D23] to-[#0A0A0C] border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-black shadow-lg text-xl">
              🎯
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-[#C5A059] tracking-wider uppercase">NO SmiIee LOTTO</h1>
                <span className="text-[10px] bg-[#1A1D23] border border-[#2D3139] text-[#C5A059] px-1.5 py-0.5 rounded font-bold">
                  PRO
                </span>
              </div>
              <p className="text-xs text-[#888888]">ระบบแทงหวยออนไลน์ & ระบบจัดการหลังบ้าน</p>
            </div>
          </div>

          {/* Mode Toggle Button for Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setActiveView(activeView === 'PLAYER' ? 'ADMIN' : 'PLAYER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                activeView === 'ADMIN'
                  ? 'bg-[#C5A059] text-black shadow-lg font-bold'
                  : 'bg-[#1A1D23] text-[#E0E0E0] border border-[#2D3139]'
              }`}
            >
              {activeView === 'ADMIN' ? (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>ไปหน้าผู้เล่น</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>เข้าหลังบ้าน Admin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Player Navigation Tabs (When in Player Mode) */}
        {activeView === 'PLAYER' && (
          <nav className="flex items-center bg-[#0A0A0C] p-1 rounded-xl border border-[#1E1E24] text-xs w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setPlayerTab('LOTTERIES')}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                playerTab === 'LOTTERIES'
                  ? 'bg-[#C5A059] text-black font-bold shadow'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>ตลาดหวยต่างประเทศ</span>
            </button>

            <button
              onClick={() => setPlayerTab('MY_SLIPS')}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                playerTab === 'MY_SLIPS'
                  ? 'bg-[#C5A059] text-black font-bold shadow'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>โพยหวยของฉัน</span>
            </button>

            <button
              onClick={() => setPlayerTab('RESULTS')}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                playerTab === 'RESULTS'
                  ? 'bg-[#C5A059] text-black font-bold shadow'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>ตรวจผลรางวัล</span>
            </button>

            <button
              onClick={() => setPlayerTab('RULES')}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                playerTab === 'RULES'
                  ? 'bg-[#C5A059] text-black font-bold shadow'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#1A1D23]/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>กติกา & อัตราจ่าย</span>
            </button>
          </nav>
        )}

        {/* Right Action Bar: Wallet Balance & Admin Switcher */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {/* Wallet Balance Widget */}
          <div className="bg-[#0A0A0C] border border-[#2D3139] rounded-xl px-3 py-1.5 flex items-center space-x-3 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-[#1A1D23] text-[#C5A059] border border-[#2D3139] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#888888] uppercase font-semibold">ยอดเงินคงเหลือ (THB)</div>
              <div className="text-sm font-black text-[#C5A059] tracking-wide">
                ฿{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <button
              onClick={onOpenTopup}
              className="bg-[#C5A059] hover:bg-[#B58F48] text-black p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1"
              title="เติมเครดิตด่วน"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">เติมเงิน</span>
            </button>
          </div>

          {/* Desktop Admin Mode Toggle */}
          <button
            onClick={() => setActiveView(activeView === 'PLAYER' ? 'ADMIN' : 'PLAYER')}
            className={`hidden md:flex px-3.5 py-2 rounded-xl text-xs font-bold items-center space-x-2 transition border cursor-pointer ${
              activeView === 'ADMIN'
                ? 'bg-[#C5A059] text-black border-[#C5A059] shadow-lg font-bold'
                : 'bg-[#1A1D23] text-[#E0E0E0] border-[#2D3139] hover:border-[#C5A059]'
            }`}
          >
            {activeView === 'ADMIN' ? (
              <>
                <Globe className="w-4 h-4 text-black" />
                <span>กลับสู่หน้าผู้เล่น</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>เข้าสู่หลังบ้าน Admin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
