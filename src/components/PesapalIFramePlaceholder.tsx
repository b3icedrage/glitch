import React, { useState } from 'react';
import {
  Lock,
  Globe,
  CreditCard,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  X,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import {
  PackagedPaymentRequest,
  PesapalPaymentStatus,
  queryPesapalPaymentStatus,
  PESAPAL_BENEFICIARY_CARD,
  processPayment
} from '../services/PaymentService';

interface PesapalIFramePlaceholderProps {
  packagedRequest: PackagedPaymentRequest;
  onPaymentSuccess: (status: PesapalPaymentStatus) => void;
  onClose: () => void;
}

export const PesapalIFramePlaceholder: React.FC<PesapalIFramePlaceholderProps> = ({
  packagedRequest,
  onPaymentSuccess,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'mpesa'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthChallenge, setShowAuthChallenge] = useState(false);
  const [authCode, setAuthCode] = useState('903521');
  const [submissionStage, setSubmissionStage] = useState<'idle' | 'authorizing' | 'clearing' | 'settled'>('idle');
  
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(
    `${packagedRequest.customer.firstName} ${packagedRequest.customer.lastName}`.toUpperCase()
  );
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('849');
  const [mpesaNumber, setMpesaNumber] = useState(packagedRequest.customer.phone || '+254 712 345 678');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User initiates payment: launches bank / M-Pesa 3D-Secure challenge
  const handleInitiatePayment = () => {
    setErrorMessage(null);
    setShowAuthChallenge(true);
  };

  // User cancelled or declined payment in challenge: NO MONEY PAID -> NO RECEIPT ISSUED
  const handleCancelPayment = () => {
    setShowAuthChallenge(false);
    setIsSubmitting(false);
    setSubmissionStage('idle');
    setErrorMessage(
      `Payment Cancelled by User: No money was debited or received on beneficiary card ${PESAPAL_BENEFICIARY_CARD.formatted}. Receipt generation and printing are strictly blocked.`
    );
  };

  // User genuinely authorizes and completes payment challenge
  const handleConfirmAuthorizePayment = async () => {
    if (!authCode.trim()) {
      setErrorMessage('Please enter the 6-digit bank authorization code');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStage('authorizing');
    setErrorMessage(null);

    try {
      // Stage 1: PesaPal clearing & issuing bank debit
      setSubmissionStage('clearing');

      // Stage 2: Execute processPayment - uses JWT auth, requests dummy backend, and awaits IPN SUCCESS status
      const paymentMethod = activeTab === 'card' ? 'Card (Visa/Mastercard)' : 'Mobile Money (M-Pesa)';
      const payerMasked =
        activeTab === 'card'
          ? '•••• •••• •••• 4242'
          : `M-Pesa (${mpesaNumber.slice(-4) || '9035'})`;

      const result = await processPayment({
        customer: packagedRequest.customer,
        order: packagedRequest.order,
        paymentMethod,
        payerAccountMasked: payerMasked,
        customMerchantRef: packagedRequest.merchantReference
      });

      const status: PesapalPaymentStatus = {
        orderTrackingId: result.orderTrackingId,
        merchantReference: result.merchantReference,
        status: 'COMPLETED',
        statusDescription: 'Transaction completed and funds settled to beneficiary account',
        amount: result.amount,
        currency: result.currency,
        paymentMethod: result.paymentMethod as any,
        payerAccountMasked: result.payerAccountMasked,
        beneficiaryCard: result.beneficiaryCard,
        isSettled: true,
        settlementAuthRef: result.settlementAuthRef,
        fundsReceivedTimestamp: result.fundsReceivedTimestamp,
        verificationHash: result.verificationHash
      };

      setSubmissionStage('settled');
      await new Promise((r) => setTimeout(r, 600));

      setShowAuthChallenge(false);
      onPaymentSuccess(status);
    } catch {
      setErrorMessage('PesaPal processing error: IPN did not receive SUCCESS status.');
      setIsSubmitting(false);
      setSubmissionStage('idle');
    }
  };

  return (
    <div className="rounded-2xl border-2 border-blue-500/70 bg-gradient-to-b from-[#0a152e] via-[#081022] to-[#050914] overflow-hidden shadow-2xl animate-in zoom-in-95 relative">
      {/* =========================================================================
          IFRAME CHROME & ADDRESS BAR
      ========================================================================= */}
      <div className="bg-[#050b18] px-3.5 py-2.5 border-b border-blue-500/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block shadow-sm" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold pl-1 border-l border-slate-800 ml-1">
            PesaPal Secure IFrame
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-md border border-blue-500/30 text-[10px] text-cyan-300 max-w-[280px] truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{packagedRequest.iframeUrl}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600/40 text-blue-300 border border-blue-500/40">
            256-BIT SSL
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close IFrame"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          INTERNAL IFRAME CONTENT VIEWPORT
      ========================================================================= */}
      <div className="p-4 space-y-3.5">
        
        {/* PesaPal Branded Header inside the IFrame */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  PesaPal Pay
                </h4>
                <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                  JWT Verified ✓
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Settles to Visa: <strong className="text-cyan-300">{PESAPAL_BENEFICIARY_CARD.formatted}</strong>
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Order Total</span>
            <span className="text-sm font-bold text-white">
              {packagedRequest.order.price} {packagedRequest.customer.currency}
            </span>
          </div>
        </div>

        {/* Order Details Chip */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white font-medium">
              +{packagedRequest.order.sparks.toLocaleString()} Sparks Pack
            </span>
            {packagedRequest.order.bonus && (
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {packagedRequest.order.bonus}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Ref: {packagedRequest.merchantReference}
          </span>
        </div>

        {/* Payment Tabs: Cards vs Mobile Money */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === 'card'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Debit / Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mpesa')}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === 'mpesa'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Money (M-Pesa)</span>
          </button>
        </div>

        {/* TAB 1: CARD CHECKOUT FORM */}
        {activeTab === 'card' && (
          <div className="space-y-2.5 p-3 rounded-xl bg-black/40 border border-slate-800 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                Card Number (Visa / Mastercard)
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                  Network
                </label>
                <div className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs text-center font-bold">
                  VISA
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                Cardholder Full Name
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        )}

        {/* TAB 2: MOBILE MONEY FORM */}
        {activeTab === 'mpesa' && (
          <div className="space-y-2.5 p-3 rounded-xl bg-black/40 border border-slate-800 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                M-Pesa / Mobile Money Registered Phone Number
              </label>
              <input
                type="tel"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                placeholder="+254 712 345 678"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              PesaPal will trigger an automated STK prompt to your handset. Enter your PIN to clear funds to destination card <strong>{PESAPAL_BENEFICIARY_CARD.formatted}</strong>.
            </p>
          </div>
        )}

        {/* Error notice if any (e.g. user cancelled or did not pay) */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-mono text-[11px] leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleInitiatePayment}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>
            Proceed to Payment & Bank Authorization ({packagedRequest.order.price})
          </span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct Settlement Rail
          </span>
          <span>Target: Visa •••• 9035</span>
        </div>
      </div>

      {/* =========================================================================
          REAL BANK 3D-SECURE & M-PESA AUTHORIZATION CHALLENGE OVERLAY
          CRITICAL: IF USER CANCELS OR DOES NOT PAY, NO RECEIPT IS ISSUED!
      ========================================================================= */}
      {showAuthChallenge && (
        <div className="absolute inset-0 z-50 bg-[#060a16]/98 backdrop-blur-md p-5 flex flex-col justify-between animate-in zoom-in-95">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs font-mono">
                    3D-Secure & Handset Authorization
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Verified by Visa & PesaPal Rail
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-600/30 text-blue-300 border border-blue-500/40">
                REQUIRED
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Charge Amount:</span>
                <span className="font-bold text-white">
                  {packagedRequest.order.price} {packagedRequest.customer.currency}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Beneficiary Card:</span>
                <span className="font-bold text-cyan-300">
                  Visa {PESAPAL_BENEFICIARY_CARD.formatted}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Method:</span>
                <span className="text-slate-200">
                  {activeTab === 'card' ? 'Visa Direct Rail' : 'M-Pesa STK Push'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                {activeTab === 'card'
                  ? 'Enter Bank SMS 6-Digit One-Time Security Passcode'
                  : 'Enter Handset M-Pesa Authorization PIN'}
              </label>
              <input
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="903521"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-blue-500/50 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <p className="text-[10px] text-slate-400">
                Simulated Bank SMS: Your authorization passcode for Visa 9035 is <strong className="text-cyan-300 font-mono">903521</strong>.
              </p>
            </div>

            {/* Warning that cancelling prevents any receipt */}
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 leading-tight">
              ⚠️ If you cancel or fail to authorize, no funds will be transferred and <strong>no receipt will be generated</strong>.
            </div>

            {/* Processing HUD while submitting */}
            {isSubmitting && (
              <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    {submissionStage === 'authorizing' && 'Issuing Bank Debiting Funds...'}
                    {submissionStage === 'clearing' && `Depositing to Visa ${PESAPAL_BENEFICIARY_CARD.formatted}...`}
                    {submissionStage === 'settled' && 'Confirmed Received! Unlocking Receipt...'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{
                      width:
                        submissionStage === 'authorizing'
                          ? '40%'
                          : submissionStage === 'clearing'
                          ? '80%'
                          : '100%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons: Explicit Confirm or Decline */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCancelPayment}
              className="w-1/3 py-2.5 rounded-xl border border-rose-500/40 hover:bg-rose-950/50 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel Payment
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmAuthorizePayment}
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize & Settle {packagedRequest.order.price}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
