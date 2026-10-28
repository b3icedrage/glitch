import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Sparkles, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddSparks: (amount: number) => void;
  onPayout: (amount: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddSparks,
  onPayout
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'payout' | 'history'>('balance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState(489.20);

  if (!isOpen) return null;

  const handlePurchase = (sparks: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      onAddSparks(sparks);
      setIsProcessing(false);
      setSuccessMessage(`Successfully added +${sparks.toLocaleString()} Glitch Sparks to your wallet! ⚡`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 600);
  };

  const handleWithdraw = () => {
    if (creatorEarnings <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      onPayout(creatorEarnings);
      setCreatorEarnings(0);
      setIsProcessing(false);
      setSuccessMessage(`Initiated instant payout of $${creatorEarnings.toFixed(2)} to your connected account! 🏦`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 800);
  };

  const packs = [
    { sparks: 500, price: '$4.99', popular: false, bonus: '' },
    { sparks: 1200, price: '$9.99', popular: true, bonus: '+20% Bonus' },
    { sparks: 3000, price: '$24.99', popular: false, bonus: '+35% Bonus' },
    { sparks: 7500, price: '$59.99', popular: false, bonus: '+50% Bonus' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-[#0d0f17] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#0d0f17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-400 p-[1.5px]">
              <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                Glitch Sparks Wallet
              </h2>
              <p className="text-xs text-slate-400">Virtual tipping currency & creator earnings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Balance Display Card */}
        <div className="p-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 p-5 shadow-lg">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Zap className="w-36 h-36 text-cyan-400" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  Available Sparks Balance
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
                    {(currentUser.walletSparks ?? 2850).toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-amber-400 flex items-center gap-0.5">
                    <Zap className="w-4 h-4 fill-amber-400" /> Sparks
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Creator Earnings
                </span>
                <div className="text-xl font-bold text-emerald-400 font-['Outfit'] mt-1">
                  ${creatorEarnings.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('balance')}
              className={`pb-2.5 px-4 border-b-2 transition-colors ${
                activeTab === 'balance'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Get Sparks
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className={`pb-2.5 px-4 border-b-2 transition-colors ${
                activeTab === 'payout'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Creator Payout
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 px-4 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Activity History
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {activeTab === 'balance' && (
              <div className="grid grid-cols-2 gap-3">
                {packs.map((pack, idx) => (
                  <div
                    key={idx}
                    className={`relative p-3.5 rounded-xl border bg-slate-900/60 hover:bg-slate-800/80 transition-all flex flex-col justify-between ${
                      pack.popular
                        ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                        <Zap className="w-4 h-4 fill-amber-400" />
                        <span>{pack.sparks.toLocaleString()}</span>
                      </div>
                      {pack.bonus && (
                        <span className="text-[10px] text-cyan-400 font-medium">
                          {pack.bonus}
                        </span>
                      )}
                    </div>

                    <button
                      disabled={isProcessing}
                      onClick={() => handlePurchase(pack.sparks)}
                      className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{pack.price}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payout' && (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Direct Creator Payout</h3>
                    <p className="text-xs text-slate-400">Withdraw tips, super-sparks and cinema memberships.</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="p-3 rounded-lg bg-[#090a0f] border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Connected Account</span>
                  <span className="text-xs font-mono text-cyan-300">•••• 4821 (Stripe Connect)</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Transfer Time:</span>
                  <span className="text-slate-200">Instant (0% platform fee)</span>
                </div>

                <button
                  disabled={creatorEarnings <= 0 || isProcessing}
                  onClick={handleWithdraw}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    creatorEarnings > 0
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  <span>Withdraw ${creatorEarnings.toFixed(2)} USD</span>
                </button>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Super-Sparks from @kaivex</p>
                      <p className="text-[10px] text-slate-400">Live stream tip</p>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">+500 ⚡</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Tipped @elenadance</p>
                      <p className="text-[10px] text-slate-400">Battle stage spark tip</p>
                    </div>
                  </div>
                  <span className="font-mono text-rose-400 font-bold">-100 ⚡</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Purchased Sparks Pack</p>
                      <p className="text-[10px] text-slate-400">Card payment</p>
                    </div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">+1,200 ⚡</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
