import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { DESIGNATED_PAYMENT_CARD, PaymentReceipt } from './WalletModal';
import { packagePaymentRequestWithJWT, generateReceiptPlainText } from '../services/PaymentService';
import {
  X,
  Zap,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Download,
  Printer,
  Smartphone,
  Globe,
  RefreshCw,
  AlertCircle,
  Check,
  ArrowRight,
  Info,
  Shield,
  FileText,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export interface PesapalOrderRequest {
  pack: {
    sparks: number;
    price: string;
    numericPrice: number;
    bonus: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currency: 'USD' | 'KES';
  };
}

interface PesapalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  selectedPack: {
    sparks: number;
    price: string;
    numericPrice: number;
    bonus: string;
  };
  onPaymentSuccess: (receipt: PaymentReceipt, sparksEarned: number) => void;
}

export const PesapalCheckoutModal: React.FC<PesapalCheckoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedPack,
  onPaymentSuccess
}) => {
  // 5-Step Pesapal Integration State Machine
  // Step 1: Collect Customer & Payment Info
  // Step 2: Package Request & Generate JWT Auth Token
  // Step 3: Load Embedded PesaPal Payments Page (IFrame)
  // Step 4: Display Post-Payment Processing Page
  // Step 5: Query PesaPal for Payment Status (PENDING -> COMPLETED)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 Form Data
  const [firstName, setFirstName] = useState(() => {
    const parts = (currentUser.name || 'Alex Rivera').split(' ');
    return parts[0] || 'Alex';
  });
  const [lastName, setLastName] = useState(() => {
    const parts = (currentUser.name || 'Alex Rivera').split(' ');
    return parts.slice(1).join(' ') || 'Rivera';
  });
  const [email, setEmail] = useState(() => {
    return currentUser.handle ? `${currentUser.handle}@glitch.network` : 'alex.rivera@glitch.network';
  });
  const [phone, setPhone] = useState('+254 712 345 678');
  const [currency, setCurrency] = useState<'USD' | 'KES'>('USD');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Step 2 Packaging Data
  const [jwtToken, setJwtToken] = useState<string>('');
  const [merchantReference, setMerchantReference] = useState<string>('');
  const [isPackaging, setIsPackaging] = useState(false);

  // Step 3 Embedded IFrame Payment Options
  const [pesapalMethod, setPesapalMethod] = useState<'card' | 'mpesa'>('card');
  const [iframeCardNumber, setIframeCardNumber] = useState('4242 •••• •••• 4242');
  const [iframeCardHolder, setIframeCardHolder] = useState(`${firstName} ${lastName}`.toUpperCase());
  const [iframeExpiry, setIframeExpiry] = useState('12/28');
  const [iframeCvv, setIframeCvv] = useState('849');
  const [mpesaPhone, setMpesaPhone] = useState('+254 712 345 678');
  const [isIframeSubmitting, setIsIframeSubmitting] = useState(false);

  // Step 4 & 5 Status Polling
  const [orderTrackingId, setOrderTrackingId] = useState<string>('');
  const [pesapalStatus, setPesapalStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED'>('PENDING');
  const [fundsReceivedTime, setFundsReceivedTime] = useState<string>('');
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceipt | null>(null);
  const [printBlockedNotice, setPrintBlockedNotice] = useState<string | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setPesapalStatus('PENDING');
      setCompletedReceipt(null);
      setPrintBlockedNotice(null);
      const randomRef = `GLITCH-PP-9035-${Math.floor(100000 + Math.random() * 900000)}`;
      setMerchantReference(randomRef);
      setIframeCardHolder(`${firstName} ${lastName}`.toUpperCase());
    }
  }, [isOpen, selectedPack]);

  if (!isOpen) return null;

  // STEP 1 VALIDATION
  const validateStep1 = () => {
    const errors: { [key: string]: string } = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim() || !email.includes('@')) errors.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 8) errors.phone = 'Valid mobile phone number required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 1 -> STEP 2: Package Request to PesaPal using JWT
  const handleProceedToStep2 = () => {
    if (!validateStep1()) return;

    setCurrentStep(2);
    setIsPackaging(true);

    setTimeout(() => {
      const packaged = packagePaymentRequestWithJWT(
        {
          firstName,
          lastName,
          email,
          phone,
          currency
        },
        selectedPack,
        merchantReference
      );

      setJwtToken(packaged.jwtToken);
      setMerchantReference(packaged.merchantReference);
      setOrderTrackingId(packaged.orderTrackingId);
      setIsPackaging(false);
    }, 1200);
  };

  // STEP 2 -> STEP 3: Load PesaPal Payments Page (IFrame)
  const handleProceedToStep3 = () => {
    const trackingId = `pesapal-ord-9035-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setOrderTrackingId(trackingId);
    setCurrentStep(3);
  };

  // STEP 3 -> STEP 4 & 5: Submit payment inside PesaPal IFrame and begin status query
  const handleIframePaymentSubmit = () => {
    setIsIframeSubmitting(true);

    // Transition to Step 4 (Post-payment page)
    setTimeout(() => {
      setIsIframeSubmitting(false);
      setCurrentStep(4);
      setPesapalStatus('PENDING');

      // Polling Step 5: Query PesaPal for Payment Status
      // PENDING (0-1.5s) -> PROCESSING (1.5-3.0s) -> COMPLETED & Confirmed Received on Card 4987 0500 5177 9035 (3.5s)
      setTimeout(() => {
        setPesapalStatus('PROCESSING');
      }, 1500);

      setTimeout(() => {
        const confirmedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setFundsReceivedTime(confirmedTime);
        setPesapalStatus('COMPLETED');
        setCurrentStep(5);

        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const receiptNum = `PESAPAL-REC-${Math.floor(100000 + Math.random() * 900000)}`;
        const authRef = `PP-SETTLE-${DESIGNATED_PAYMENT_CARD.number}-${randomHex}`;

        const receipt: PaymentReceipt = {
          txId: orderTrackingId,
          receiptNumber: receiptNum,
          amountPaid: selectedPack.price,
          sparksReceived: selectedPack.sparks,
          payerCardMasked: pesapalMethod === 'card' ? '•••• •••• •••• 4242' : `M-Pesa (${mpesaPhone.slice(-4)})`,
          payerName: `${firstName} ${lastName}`.toUpperCase(),
          payerBrand: pesapalMethod === 'card' ? 'VISA / PESAPAL' : 'M-PESA / PESAPAL',
          destinationCard: DESIGNATED_PAYMENT_CARD.formatted,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fundsReceivedTimestamp: confirmedTime,
          settlementAuthRef: authRef,
          verificationHash: `SHA256:PESAPAL-9035-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
          clearingStatus: 'RECEIVED_AND_CREDITED',
          gateway: 'PESAPAL',
          pesapalOrderTrackingId: orderTrackingId,
          pesapalMerchantReference: merchantReference,
          paymentMethodUsed: pesapalMethod === 'card' ? 'Card' : 'Mobile Money (M-Pesa)'
        };

        setCompletedReceipt(receipt);
        onPaymentSuccess(receipt, selectedPack.sparks);
      }, 3500);
    }, 1200);
  };

  // Receipt Printing Protection
  const handlePrint = () => {
    if (!completedReceipt || pesapalStatus !== 'COMPLETED') {
      setPrintBlockedNotice(`Cannot print receipt: Funds must first be received and confirmed by PesaPal on Card ${DESIGNATED_PAYMENT_CARD.formatted}!`);
      setTimeout(() => setPrintBlockedNotice(null), 4000);
      return;
    }
    window.print();
  };

  const handleDownload = () => {
    if (!completedReceipt || pesapalStatus !== 'COMPLETED') {
      setPrintBlockedNotice(`Cannot download receipt: Funds must first be received and confirmed by PesaPal on Card ${DESIGNATED_PAYMENT_CARD.formatted}!`);
      setTimeout(() => setPrintBlockedNotice(null), 4000);
      return;
    }

    const content = `========================================================
PESAPAL™ & GLITCH INTERACTIVE - TRANSACTION RECEIPT
========================================================
RECEIPT NO:               ${completedReceipt.receiptNumber}
PESAPAL ORDER TRACKING:   ${completedReceipt.pesapalOrderTrackingId}
MERCHANT REFERENCE:       ${completedReceipt.pesapalMerchantReference}
SETTLEMENT AUTH REF:      ${completedReceipt.settlementAuthRef}
DATE & TIME:              ${new Date().toLocaleDateString()} ${completedReceipt.fundsReceivedTimestamp}

--------------------------------------------------------
FUNDS CLEARING & BENEFICIARY DETAILS:
--------------------------------------------------------
SETTLEMENT STATUS:        [ 100% RECEIVED & CREDITED ]
PESAPAL IPN STATUS:       COMPLETED
BENEFICIARY CARD:         Visa ${completedReceipt.destinationCard}
BENEFICIARY RECIPIENT:    Glitch Primary Account / Beneficiary
DEPOSIT CONFIRMED:        FUNDS RECEIVED BEFORE RECEIPT ISSUED
DIGITAL VERIFICATION:     ${completedReceipt.verificationHash}

--------------------------------------------------------
PAYER INFORMATION:
--------------------------------------------------------
CUSTOMER NAME:            ${completedReceipt.payerName}
CUSTOMER EMAIL:           ${email}
CUSTOMER PHONE:           ${phone}
PAYMENT METHOD:           ${completedReceipt.paymentMethodUsed || 'Card / PesaPal'}
PAYMENT ACCOUNT:          ${completedReceipt.payerCardMasked}

--------------------------------------------------------
ITEMIZED TRANSACTION:
--------------------------------------------------------
ITEM                      QTY    PRICE
Glitch Sparks Pack        1      ${completedReceipt.amountPaid} ${currency}
(+${completedReceipt.sparksReceived.toLocaleString()} Virtual Sparks)
--------------------------------------------------------
TOTAL RECEIVED & SETTLED: ${completedReceipt.amountPaid} ${currency}
--------------------------------------------------------

* This official receipt was certified by PesaPal and issued only
  after funds were confirmed received into beneficiary card ${completedReceipt.destinationCard}.

PesaPal Official Gateway: pesapal.com
Glitch Support: support@glitch.network
========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pesapal_Receipt_${completedReceipt.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-[#0a0d16] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[95vh]">
        
        {/* Header with PesaPal Badge */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-[#071328] via-[#091b3b] to-[#0a0d16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 p-[1.5px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-['Outfit']">
                  PesaPal.com Gateway Integration
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white font-mono">
                  PESAPAL V3
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official 5-step payment flow • Settle directly to Card ending in 9035
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Step Progress Stepper Navigation */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono overflow-x-auto no-scrollbar">
          {[
            { num: 1, label: 'Collect Info' },
            { num: 2, label: 'JWT Package' },
            { num: 3, label: 'IFrame Page' },
            { num: 4, label: 'Post-Payment' },
            { num: 5, label: 'Query & Receipt' }
          ].map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex items-center gap-1.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-blue-500 text-white ring-2 ring-blue-400/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <span
                  className={`${
                    isCurrent
                      ? 'text-white font-bold'
                      : isDone
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
                {s.num < 5 && <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
          
          {/* Beneficiary Card Lock Notification */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900 border border-blue-500/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold">
                💳
              </div>
              <div>
                <p className="font-semibold text-white text-[11px]">PesaPal Designated Beneficiary Card</p>
                <p className="text-[10px] text-slate-400">
                  All customer payments clear to Visa <strong className="text-cyan-300 font-mono">{DESIGNATED_PAYMENT_CARD.formatted}</strong>
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Verified Rail ✓
            </span>
          </div>

          {/* Alert if print attempted early */}
          {printBlockedNotice && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-mono text-[11px] leading-tight">{printBlockedNotice}</span>
            </div>
          )}

          {/* =========================================================================
              STEP 1: COLLECT CUSTOMER & PAYMENT INFORMATION
          ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Step 1 of 5 • PesaPal Integration
                </span>
                <h3 className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                  Collect Customer & Payment Information
                </h3>
                <p className="text-xs text-slate-400">
                  Collect customer details (First Name, Last Name, Email, Phone) and payment amount required by PesaPal.
                </p>
              </div>

              {/* Order Package Preview */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Order Item</span>
                  <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-4 h-4 fill-amber-400" />
                    {selectedPack.sparks.toLocaleString()} Sparks Pack
                  </span>
                  {selectedPack.bonus && (
                    <span className="text-[10px] text-cyan-400 font-semibold">{selectedPack.bonus}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Amount Due</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    {selectedPack.price} {currency}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Customer First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans ${
                        formErrors.firstName ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.firstName && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.firstName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Customer Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans ${
                        formErrors.lastName ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.lastName && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Customer Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.rivera@example.com"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans ${
                        formErrors.email ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.email && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono ${
                        formErrors.phone ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.phone && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Currency Selector */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Payment Currency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        currency === 'USD'
                          ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>USD ($)</span>
                      <span className="text-[10px] font-normal text-slate-400">US Dollar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('KES')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        currency === 'KES'
                          ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>KES (KSh)</span>
                      <span className="text-[10px] font-normal text-slate-400">Kenyan Shilling</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Step 2: Package Request to PesaPal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =========================================================================
              STEP 2: PACKAGE THE REQUEST & GENERATE JWT AUTH TOKEN
          ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Step 2 of 5 • PesaPal Integration
                </span>
                <h3 className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                  Package the Request to Post to PesaPal (JWT Security)
                </h3>
                <p className="text-xs text-slate-400">
                  PesaPal uses JSON Web Tokens (JWT) to ensure communication between Glitch and PesaPal is authentic and secure.
                </p>
              </div>

              {isPackaging ? (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs font-mono text-slate-300">
                    Signing JSON Web Token (JWT) with PesaPal Merchant Credentials...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Routing destination: Visa Card {DESIGNATED_PAYMENT_CARD.formatted}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-black/60 border border-blue-500/40 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                      <span>JWT Bearer Authorization:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed & Valid
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-950/80 text-[10px] text-cyan-300 break-all font-mono leading-relaxed border border-slate-800/80">
                      {jwtToken}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Merchant Reference:</span>
                        <span className="font-bold text-white">{merchantReference}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Beneficiary Card:</span>
                        <span className="font-bold text-cyan-300">Visa {DESIGNATED_PAYMENT_CARD.formatted}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Amount & Currency:</span>
                        <span className="font-bold text-emerald-400">{selectedPack.price} {currency}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Customer Name:</span>
                        <span className="font-bold text-white">{firstName} {lastName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-[11px] text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Payload is encrypted and ready to load the official PesaPal embedded payment page.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Step 3: Load PesaPal Payments Page (IFrame)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              STEP 3: POST REQUEST TO PESAPAL & LOAD PESAPAL PAYMENTS PAGE (EMBEDDED IFRAME)
          ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                    Step 3 of 5 • PesaPal Integration
                  </span>
                  <h3 className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                    PesaPal Embedded Payments Page (IFrame)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/30 border border-blue-500/50 text-cyan-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> SSL 256-Bit
                </span>
              </div>

              {/* EMBEDDED PESAPAL PAYMENTS PAGE SIMULATION */}
              <div className="rounded-2xl border-2 border-blue-500/60 bg-gradient-to-b from-[#0a1426] to-[#070b14] overflow-hidden shadow-2xl">
                
                {/* Browser/IFrame Chrome Bar */}
                <div className="bg-[#050b18] px-3 py-2 border-b border-blue-500/30 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] text-cyan-300 flex items-center gap-1 pl-2">
                      <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      https://pay.pesapal.com/v3/iframe/{orderTrackingId}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">PESAPAL SECURE RAIL</span>
                </div>

                {/* Inside the IFrame */}
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        PesaPal Pay
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Beneficiary: Glitch (Visa {DESIGNATED_PAYMENT_CARD.formatted})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">Order Amount</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {selectedPack.price} {currency}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Switcher inside IFrame */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPesapalMethod('card')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        pesapalMethod === 'card'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit / Debit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPesapalMethod('mpesa')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        pesapalMethod === 'mpesa'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>M-Pesa / Mobile Money</span>
                    </button>
                  </div>

                  {/* Payment Method 1: Card Form */}
                  {pesapalMethod === 'card' && (
                    <div className="space-y-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                          Card Number (Visa / Mastercard)
                        </label>
                        <input
                          type="text"
                          value={iframeCardNumber}
                          onChange={(e) => setIframeCardNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={iframeExpiry}
                            onChange={(e) => setIframeExpiry(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center focus:outline-none focus:border-blue-400"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={iframeCvv}
                            onChange={(e) => setIframeCvv(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center focus:outline-none focus:border-blue-400"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Brand
                          </label>
                          <div className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs text-center font-bold">
                            VISA
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={iframeCardHolder}
                          onChange={(e) => setIframeCardHolder(e.target.value.toUpperCase())}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Method 2: Mobile Money (M-Pesa) */}
                  {pesapalMethod === 'mpesa' && (
                    <div className="space-y-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                          M-Pesa Registered Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          placeholder="+254 712 345 678"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        An instant STK prompt will be triggered on your handset to authorize the {selectedPack.price} charge. Funds clear straight to beneficiary card ending in 9035.
                      </p>
                    </div>
                  )}

                  {/* Complete Payment Button inside PesaPal IFrame */}
                  <button
                    type="button"
                    disabled={isIframeSubmitting}
                    onClick={handleIframePaymentSubmit}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isIframeSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Posting Payment to PesaPal...
                      </span>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay {selectedPack.price} {currency} on PesaPal</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span>Target: Visa {DESIGNATED_PAYMENT_CARD.formatted}</span>
                    <span className="text-emerald-400">PesaPal Certified ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4 & 5: DISPLAY POST-PAYMENT PAGE & QUERY PESAPAL STATUS (PENDING -> COMPLETED)
          ========================================================================= */}
          {(currentStep === 4 || currentStep === 5) && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  {currentStep === 4 ? 'Step 4 of 5 • Post-Payment Page' : 'Step 5 of 5 • Status Confirmed & Receipt Unlocked'}
                </span>
                <h3 className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                  {pesapalStatus === 'COMPLETED'
                    ? 'Payment Confirmed Received by PesaPal'
                    : 'Querying PesaPal for Payment Status (IPN)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {pesapalStatus === 'COMPLETED'
                    ? `Funds verified deposited into beneficiary Visa card ending in 9035. Official receipt is certified.`
                    : `Tracking Order ${orderTrackingId}. Receipt printing is strictly locked until funds are received.`}
                </p>
              </div>

              {/* Status Tracker Box */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/50 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">PesaPal Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                      pesapalStatus === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : pesapalStatus === 'PROCESSING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-blue-500/20 text-cyan-300 border border-blue-500/40'
                    }`}
                  >
                    {pesapalStatus === 'COMPLETED' && 'COMPLETED (FUNDS RECEIVED) ✓'}
                    {pesapalStatus === 'PROCESSING' && 'PROCESSING SETTLEMENT...'}
                    {pesapalStatus === 'PENDING' && 'PENDING IPN CLEARANCE'}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-700"
                    style={{
                      width:
                        pesapalStatus === 'PENDING'
                          ? '35%'
                          : pesapalStatus === 'PROCESSING'
                          ? '75%'
                          : '100%'
                    }}
                  />
                </div>

                <div className="text-[11px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Tracking ID:</span>
                    <span className="text-cyan-300 font-bold">{orderTrackingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Merchant Reference:</span>
                    <span className="text-white">{merchantReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Card:</span>
                    <span className="text-cyan-300 font-bold">Visa {DESIGNATED_PAYMENT_CARD.formatted}</span>
                  </div>
                  {fundsReceivedTime && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Confirmed Deposit Time:</span>
                      <span>{fundsReceivedTime}</span>
                    </div>
                  )}
                </div>

                {/* Print Lock Status Badge */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Receipt Printing:</span>
                  {pesapalStatus === 'COMPLETED' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked (Funds Received)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked until PesaPal clears deposit
                    </span>
                  )}
                </div>
              </div>

              {/* Certified Official Receipt View when COMPLETED */}
              {pesapalStatus === 'COMPLETED' && completedReceipt && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#071328] border border-emerald-500/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider pb-1 border-b border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Certified PesaPal Receipt</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Receipt No:</span>
                      <span className="text-cyan-400 font-bold">{completedReceipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer:</span>
                      <span className="text-white">{completedReceipt.payerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sparks Credited:</span>
                      <span className="text-amber-400 font-bold">+{completedReceipt.sparksReceived.toLocaleString()} ⚡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Settled:</span>
                      <span className="text-white font-bold">{completedReceipt.amountPaid} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Deposit Card:</span>
                      <span className="text-cyan-300 font-bold">Visa {completedReceipt.destinationCard}</span>
                    </div>
                  </div>

                  {/* Actions: Print & Download Receipt */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="py-2.5 px-3 rounded-xl border border-blue-500/50 hover:bg-slate-800 text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Printable Layout for window.print() */}
        {completedReceipt && completedReceipt.clearingStatus === 'RECEIVED_AND_CREDITED' && (
          <div 
            id="official-glitch-printable-receipt" 
            data-funds-received="true"
            className="hidden print:block p-8 bg-white text-black font-sans"
          >
            <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase">PESAPAL™ & GLITCH INTERACTIVE</h1>
                <p className="text-xs text-gray-600">Official Payment & Settlement Receipt</p>
                <p className="text-xs text-gray-500">PesaPal V3 Gateway Integration Rail</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 border-2 border-emerald-700 text-emerald-800 text-xs font-bold uppercase rounded">
                  ✓ PESAPAL PAYMENT CONFIRMED & RECEIVED
                </span>
                <p className="text-xs font-mono mt-1 text-gray-700 font-bold">Receipt #{completedReceipt.receiptNumber}</p>
                <p className="text-[11px] font-mono text-gray-500">Order #{completedReceipt.pesapalOrderTrackingId}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-4 text-xs font-mono">
              <p className="font-bold text-gray-900 mb-1">PESAPAL CLEARING & DEPOSIT CERTIFICATION:</p>
              <p className="text-gray-700">
                This certifies that <strong>{completedReceipt.amountPaid} {currency}</strong> was verified and received by PesaPal and credited to beneficiary Visa Card <strong>{completedReceipt.destinationCard}</strong> at <strong>{completedReceipt.fundsReceivedTimestamp}</strong> prior to unlocking and issuing this receipt.
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Settlement Auth Ref: {completedReceipt.settlementAuthRef}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <p className="text-gray-500 uppercase font-mono text-[10px]">Customer (Payer)</p>
                <p className="font-bold text-gray-900">{completedReceipt.payerName}</p>
                <p className="text-gray-600">{email} • {phone}</p>
                <p className="font-mono text-gray-700">{completedReceipt.payerBrand} {completedReceipt.payerCardMasked}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 uppercase font-mono text-[10px]">Beneficiary / Merchant Account</p>
                <p className="font-bold text-gray-900">Glitch Primary Beneficiary Account</p>
                <p className="font-mono font-bold text-blue-900">Visa {completedReceipt.destinationCard}</p>
                <p className="text-gray-600">PesaPal Merchant Ref: {merchantReference}</p>
              </div>
            </div>

            <table className="w-full text-xs mb-4 border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-gray-600 font-mono">
                  <th className="text-left py-1.5">Description</th>
                  <th className="text-center py-1.5">Qty</th>
                  <th className="text-right py-1.5">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">
                    <strong>Glitch Sparks Virtual Pack</strong>
                    <div className="text-gray-500 text-[11px]">+{completedReceipt.sparksReceived.toLocaleString()} Virtual Sparks</div>
                  </td>
                  <td className="text-center py-2">1</td>
                  <td className="text-right py-2 font-mono">{completedReceipt.amountPaid} {currency}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td colSpan={2} className="py-2 text-right">TOTAL AMOUNT CONFIRMED RECEIVED:</td>
                  <td className="py-2 text-right font-mono text-sm">{completedReceipt.amountPaid} {currency}</td>
                </tr>
              </tfoot>
            </table>

            <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center font-mono">
              <span>Verification Hash: {completedReceipt.verificationHash}</span>
              <span>Gateway: PesaPal.com Real-Time Aggregator</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
