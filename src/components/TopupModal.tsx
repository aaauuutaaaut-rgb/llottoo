import React, { useState } from 'react';
import { Wallet, CheckCircle2 } from 'lucide-react';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopup: (amount: number) => Promise<void>;
}

export const TopupModal: React.FC<TopupModalProps> = ({ isOpen, onClose, onTopup }) => {
  const [amount, setAmount] = useState<number>(10000);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExecute = async () => {
    await onTopup(amount);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1115] border border-[#1E1E24] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E1E24] pb-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Wallet className="w-5 h-5 text-[#C5A059]" />
            <span>เติมเครดิตเข้ากระเป๋าเงิน (Top-up Credit)</span>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {isDone ? (
          <div className="text-center py-6 space-y-2 text-[#22C55E]">
            <CheckCircle2 className="w-10 h-10 mx-auto" />
            <div className="font-bold text-sm">เติมเครดิตสำเร็จ +{amount.toLocaleString()} ฿</div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#888888]">
              เลือกหรือกรอกจำนวนเครดิตที่ต้องการเติมเข้ากระเป๋าเงินเพื่อเริ่มแทงหวย
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[5000, 10000, 50000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    amount === amt
                      ? 'bg-[#C5A059] text-black border-[#C5A059]'
                      : 'bg-[#0A0A0C] text-[#E0E0E0] border-[#2D3139] hover:border-[#C5A059]'
                  }`}
                >
                  +{amt.toLocaleString()} ฿
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#888888] font-semibold">หรือระบุจำนวนเอง (บาท):</label>
              <input
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#0A0A0C] border border-[#2D3139] rounded-xl px-3 py-2 text-sm font-bold text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              onClick={handleExecute}
              className="w-full bg-[#C5A059] hover:bg-[#b59049] text-black py-3 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
            >
              ยืนยันเติมเครดิต
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
