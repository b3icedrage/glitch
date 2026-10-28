import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign,
  Lock,
  ExternalLink,
  Receipt,
  Sparkles
} from 'lucide-react';

export const DESIGNATED_PAYMENT_CARD = {
  number: '4987050051779035',
  formatted: '4987 0500 5177 9035',
  masked: '•••• •••• •••• 9035',
  network: 'Visa',
  type: 'Direct Settlement Rail & Payout Destination',
  holder: 'Glitch Primary Account / Beneficiary'
};

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddSparks: (amount: number) => void;
  onPayout: (amount: number) => void;
}

interface TransactionRecord {
  id: string;
  type: 'purchase' | 'payout' | 'tip_received' | 'tip_sent';
  title: string;
  subtitle: string;
  amount: string;
  cardDestination?: string;
  timestamp: string;
  isPositive: boolean;
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
  
  // Checkout modal state
  const [selectedPackForCheckout, setSelectedPackForCheckout] = useState<{
    sparks: number;
    price: string;
    bonus: string;
  } | null>(null);

  // Completed Payment Receipt modal state
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<{
    txId: string;
    amountPaid: string;
    sparksReceived: number;
    destinationCard: string;
    timestamp: string;
  } | null>(null);

  // Dynamic Transaction History
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx_init_1',
      type: 'purchase',
      title: 'Sparks Pack Payment',
      subtitle: `Money settled to Visa ${DESIGNATED_PAYMENT_CARD.formatted}`,
      amount: '+1,200 ⚡ ($9.99)',
      cardDestination: DESIGNATED_PAYMENT_CARD.formatted,
      timestamp: 'Today, 2:15 PM',
      isPositive: true
    },
    {
      id: 'tx_init_2',
      type: 'tip_received',
      title: 'Super-Sparks from @kaivex',
      subtitle: 'Live stream tip',
      amount: '+500 ⚡',
      timestamp: 'Yesterday',
      isPositive: true
    },
    {
      id: 'tx_init_3',
      type: 'tip_sent',
      title: 'Tipped @elenadance',
      subtitle: 'Battle stage spark tip',
      amount: '-100 ⚡',
      timestamp: '2 days ago',
      isPositive: false
    }
  ]);

  if (!isOpen) return null;

  const handleInitiateCheckout = (pack: { sparks: number; price: string; bonus: string }) => {
    setSelectedPackForCheckout(pack);
  };

  const handleConfirmPayment = () => {
    if (!selectedPackForCheckout) return;
    setIsProcessing(true);

    const pack = selectedPackForCheckout;
    const txId = `GLITCH-TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setTimeout(() => {
      onAddSparks(pack.sparks);
      setIsProcessing(false);
      
      const newTx: TransactionRecord = {
        id: txId,
        type: 'purchase',
        title: 'Sparks Pack Payment',
        subtitle: `Money routed to Visa Card ${DESIGNATED_PAYMENT_CARD.formatted}`,
        amount: `+${pack.sparks.toLocaleString()} ⚡ (${pack.price})`,
        cardDestination: DESIGNATED_PAYMENT_CARD.formatted,
        timestamp: 'Just now',
        isPositive: true
      };

      setTransactions(prev => [newTx, ...prev]);

      // Set receipt
      setLastPaymentReceipt({
        txId,
        amountPaid: pack.price,
        sparksReceived: pack.sparks,
        destinationCard: DESIGNATED_PAYMENT_CARD.formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setSelectedPackForCheckout(null);
      setSuccessMessage(`Payment settled! ${pack.price} sent directly to card ${DESIGNATED_PAYMENT_CARD.formatted} ⚡`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 900);
  };

  const handleWithdraw = () => {
    if (creatorEarnings <= 0) return;
    setIsProcessing(true);

    const amount = creatorEarnings;
    const txId = `PAYOUT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setTimeout(() => {
      onPayout(amount);
      setCreatorEarnings(0);
      setIsProcessing(false);

      const payoutTx: TransactionRecord = {
        id: txId,
        type: 'payout',
        title: 'Creator Earnings Withdrawal',
        subtitle: `Deposited directly to Visa Card ${DESIGNATED_PAYMENT_CARD.formatted}`,
        amount: `-$${amount.toFixed(2)} USD`,
        cardDestination: DESIGNATED_PAYMENT_CARD.formatted,
        timestamp: 'Just now',
        isPositive: false
      };

      setTransactions(prev => [payoutTx, ...prev]);
      setSuccessMessage(`Payout of $${amount.toFixed(2)} sent directly to card ${DESIGNATED_PAYMENT_CARD.formatted}! 💳`);
      setTimeout(() => setSuccessMessage(null), 4500);
    }, 900);
  };

  const packs = [
    { sparks: 500, price: '$4.99', popular: false, bonus: '' },
    { sparks: 1200, price: '$9.99', popular: true, bonus: '+20% Bonus' },
    { sparks: 3000, price: '$24.99', popular: false, bonus: '+35% Bonus' },
    { sparks: 7500, price: '$59.99', popular: false, bonus: '+50% Bonus' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0d0f17] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0e121d] to-[#0d0f17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 p-[1.5px] shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                Glitch Sparks Wallet & Payments
              </h2>
              <p className="text-xs text-slate-400">Direct card settlement & creator earnings</p>
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
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Current Balance Display Card */}
        <div className="p-5 pb-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/50 border border-cyan-500/30 p-5 shadow-lg">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Zap className="w-36 h-36 text-cyan-400" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
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
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Creator Earnings
                </span>
                <div className="text-2xl font-bold text-emerald-400 font-['Outfit'] mt-1">
                  ${creatorEarnings.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Configured Destination Card Badge */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Destination Card:</span>
                <span className="font-mono font-bold text-cyan-300 tracking-wider">
                  {DESIGNATED_PAYMENT_CARD.formatted}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-medium border border-cyan-500/30">
                Active Rail
              </span>
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
              Activity History ({transactions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4 max-h-[320px] overflow-y-auto no-scrollbar pb-3">
            
            {/* TAB 1: GET SPARKS */}
            {activeTab === 'balance' && (
              <div className="space-y-3">
                
                {/* Designated Destination Card Notification */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
                      💳
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">Payment Destination Configured</p>
                      <p className="text-[11px] text-slate-400">
                        Money paid routes to Visa card <span className="text-cyan-300 font-mono font-medium">{DESIGNATED_PAYMENT_CARD.formatted}</span>
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {packs.map((pack, idx) => (
                    <div
                      key={idx}
                      className={`relative p-3.5 rounded-xl border bg-slate-900/70 hover:bg-slate-800/90 transition-all flex flex-col justify-between ${
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
                          <span>{pack.sparks.toLocaleString()} Sparks</span>
                        </div>
                        {pack.bonus && (
                          <span className="text-[10px] text-cyan-400 font-medium">
                            {pack.bonus}
                          </span>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1">
                          Settles to •••• 9035
                        </p>
                      </div>

                      <button
                        disabled={isProcessing}
                        onClick={() => handleInitiateCheckout(pack)}
                        className="mt-3 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {pack.price}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CREATOR PAYOUT */}
            {activeTab === 'payout' && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Direct Card Payout</h3>
                    <p className="text-xs text-slate-400">
                      Withdraw your creator earnings and tips straight to your card.
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>

                {/* Card Display Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#070b14] to-[#0d1424] border border-cyan-500/40 shadow-inner space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Connected Receiving Card
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white font-mono">
                      VISA
                    </span>
                  </div>

                  <div className="text-base font-mono font-bold text-white tracking-widest flex items-center gap-2">
                    <span>{DESIGNATED_PAYMENT_CARD.formatted}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Routing: Visa Direct Instant Settlement</span>
                    <span className="text-emerald-400 font-semibold">Active & Verified ✓</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-slate-400">Transfer Time:</span>
                  <span className="text-slate-200 font-medium">Instant to card (0% fee)</span>
                </div>

                <button
                  disabled={creatorEarnings <= 0 || isProcessing}
                  onClick={handleWithdraw}
                  className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    creatorEarnings > 0
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer font-bold'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {isProcessing 
                      ? `Transferring to card ${DESIGNATED_PAYMENT_CARD.formatted}...`
                      : `Withdraw $${creatorEarnings.toFixed(2)} to Card ${DESIGNATED_PAYMENT_CARD.formatted}`
                    }
                  </span>
                </button>
              </div>
            )}

            {/* TAB 3: ACTIVITY HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-2 text-xs">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                        tx.type === 'purchase'
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : tx.type === 'payout'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : tx.isPositive
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'purchase' && <CreditCard className="w-4 h-4" />}
                        {tx.type === 'payout' && <DollarSign className="w-4 h-4" />}
                        {tx.type === 'tip_received' && <ArrowDownLeft className="w-4 h-4" />}
                        {tx.type === 'tip_sent' && <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{tx.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{tx.subtitle}</p>
                        {tx.cardDestination && (
                          <p className="text-[10px] font-mono text-cyan-300">
                            Card: {tx.cardDestination}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold block ${
                        tx.isPositive ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {tx.amount}
                      </span>
                      <span className="text-[10px] text-slate-500">{tx.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* CHECKOUT MODAL OVERLAY (when user clicks Pay) */}
        {selectedPackForCheckout && (
          <div className="absolute inset-0 z-50 bg-[#090b12]/95 backdrop-blur-md p-6 flex flex-col justify-between animate-in fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Secure Payment Checkout</h3>
                </div>
                <button
                  disabled={isProcessing}
                  onClick={() => setSelectedPackForCheckout(null)}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Item:</span>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{selectedPackForCheckout.sparks.toLocaleString()} Glitch Sparks</span>
                  </div>
                  {selectedPackForCheckout.bonus && (
                    <span className="text-[10px] text-cyan-400 font-medium">
                      {selectedPackForCheckout.bonus}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Due:</span>
                  <div className="text-xl font-extrabold text-cyan-400 font-['Outfit'] mt-0.5">
                    {selectedPackForCheckout.price}
                  </div>
                </div>
              </div>

              {/* Destination Card Details (Where the money goes) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1220] to-[#090e18] border-2 border-cyan-500/50 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Money Destination (Receiving Card)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white font-mono">
                    VISA DIRECT
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-cyan-500/30">
                  <div className="text-xs text-slate-400">Payment recipient card number:</div>
                  <div className="text-base font-mono font-bold text-cyan-300 tracking-wider mt-0.5">
                    {DESIGNATED_PAYMENT_CARD.formatted}
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The <span className="font-semibold text-white">{selectedPackForCheckout.price}</span> payment will be immediately routed and settled to Visa card <span className="font-mono text-cyan-300 font-semibold">{DESIGNATED_PAYMENT_CARD.formatted}</span>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant 256-bit encrypted settlement to card destination</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                disabled={isProcessing}
                onClick={() => setSelectedPackForCheckout(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Routing to card {DESIGNATED_PAYMENT_CARD.number}...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {selectedPackForCheckout.price} Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT RECEIPT MODAL OVERLAY */}
        {lastPaymentReceipt && (
          <div className="absolute inset-0 z-50 bg-[#090b12]/95 backdrop-blur-md p-6 flex flex-col justify-between animate-in zoom-in-95">
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-['Outfit']">Payment Complete & Settled!</h3>
                <p className="text-xs text-slate-400 mt-0.5">Funds deposited directly to specified card</p>
              </div>

              {/* Receipt Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>Transaction ID:</span>
                  <span className="text-white font-bold">{lastPaymentReceipt.txId}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-400 font-bold text-sm">{lastPaymentReceipt.amountPaid} USD</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Sparks Received:</span>
                  <span className="text-amber-400 font-bold">+{lastPaymentReceipt.sparksReceived.toLocaleString()} ⚡</span>
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Receiving Card (Money Sent To):</span>
                  <span className="text-cyan-300 font-bold text-sm tracking-wider">
                    Visa {lastPaymentReceipt.destinationCard}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Settlement Status:</span>
                  <span className="text-emerald-400 font-semibold">Instant Settled ✓</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setLastPaymentReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
