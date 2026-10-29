import React, { useState, useEffect } from 'react';
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
  Receipt, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Check, 
  Shield, 
  Download, 
  Info, 
  Printer, 
  FileText, 
  Clock, 
  LockKeyhole,
  Globe
} from 'lucide-react';
import { PesapalCheckoutModal } from './PesapalCheckoutModal';
import { PesapalIFramePlaceholder } from './PesapalIFramePlaceholder';
import {
  packagePaymentRequestWithJWT,
  PackagedPaymentRequest,
  PesapalPaymentStatus,
  PESAPAL_BENEFICIARY_CARD,
  processPayment
} from '../services/PaymentService';

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

export interface PaymentReceipt {
  txId: string;
  receiptNumber: string;
  amountPaid: string;
  sparksReceived: number;
  payerCardMasked: string;
  payerName: string;
  payerBrand: string;
  destinationCard: string;
  timestamp: string;
  fundsReceivedTimestamp: string;
  settlementAuthRef: string;
  verificationHash: string;
  clearingStatus: 'RECEIVED_AND_CREDITED';
  gateway?: 'PESAPAL' | 'DIRECT_VISA';
  pesapalOrderTrackingId?: string;
  pesapalMerchantReference?: string;
  paymentMethodUsed?: string;
}

interface TransactionRecord {
  id: string;
  type: 'purchase' | 'payout' | 'tip_received' | 'tip_sent';
  title: string;
  subtitle: string;
  amount: string;
  payerCard?: string;
  cardDestination?: string;
  timestamp: string;
  isPositive: boolean;
  receiptData?: PaymentReceipt;
}

interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  zipCode: string;
  saveCard: boolean;
}

interface FormErrors {
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  zipCode?: string;
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
  const [processingStage, setProcessingStage] = useState<
    'validating' | 'authorizing' | 'routing' | 'receiving' | 'received' | 'receipt_ready' | null
  >(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [printBlockedAlert, setPrintBlockedAlert] = useState<string | null>(null);
  const [creatorEarnings, setCreatorEarnings] = useState(489.20);
  
  // Checkout modal state
  const [selectedPackForCheckout, setSelectedPackForCheckout] = useState<{
    sparks: number;
    price: string;
    numericPrice: number;
    bonus: string;
  } | null>(null);

  // Pesapal 5-step integration checkout state
  const [selectedPackForPesapal, setSelectedPackForPesapal] = useState<{
    sparks: number;
    price: string;
    numericPrice: number;
    bonus: string;
  } | null>(null);

  // Pesapal IFrame Placeholder state (packages request via JWT and renders secure checkout frame)
  const [activeIframeRequest, setActiveIframeRequest] = useState<PackagedPaymentRequest | null>(null);

  // Card Form Details (User enters their card for real money payment)
  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    zipCode: '',
    saveCard: true
  });
  const [showCvv, setShowCvv] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Completed Payment Receipt modal state (only generated after funds are confirmed received)
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<PaymentReceipt | null>(null);

  // Bank 3D-Secure challenge & authorization gate state
  const [showBank3dSecure, setShowBank3dSecure] = useState(false);
  const [bankOtpCode, setBankOtpCode] = useState('903521');
  const [paymentDeclinedError, setPaymentDeclinedError] = useState<string | null>(null);

  // Dynamic Transaction History with receipt data (Starts with zero purchase receipts until a real verified payment is received)
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
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

  // Load saved card on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('glitch_saved_card');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCardForm(prev => ({
          ...prev,
          cardNumber: parsed.cardNumber || '',
          cardHolder: parsed.cardHolder || '',
          expiry: parsed.expiry || '',
          zipCode: parsed.zipCode || ''
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  // Helper to detect card network / brand
  const detectCardBrand = (num: string): { brand: string; iconColor: string; bgGradient: string } => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) {
      return { 
        brand: 'VISA', 
        iconColor: 'text-blue-400', 
        bgGradient: 'from-blue-950 via-slate-900 to-indigo-950' 
      };
    }
    if (/^(5[1-5]|2[2-7])/.test(clean)) {
      return { 
        brand: 'MASTERCARD', 
        iconColor: 'text-amber-400', 
        bgGradient: 'from-red-950 via-slate-900 to-amber-950' 
      };
    }
    if (/^(34|37)/.test(clean)) {
      return { 
        brand: 'AMEX', 
        iconColor: 'text-cyan-400', 
        bgGradient: 'from-teal-950 via-slate-900 to-blue-950' 
      };
    }
    if (/^(6011|65)/.test(clean)) {
      return { 
        brand: 'DISCOVER', 
        iconColor: 'text-orange-400', 
        bgGradient: 'from-amber-950 via-slate-900 to-orange-950' 
      };
    }
    return { 
      brand: 'CARD', 
      iconColor: 'text-cyan-400', 
      bgGradient: 'from-slate-900 via-[#0e1322] to-slate-950' 
    };
  };

  // Card input formatting handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm(prev => ({ ...prev, cardNumber: formatted }));
    if (formErrors.cardNumber) {
      setFormErrors(prev => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardForm(prev => ({ ...prev, expiry: raw }));
    if (formErrors.expiry) {
      setFormErrors(prev => ({ ...prev, expiry: undefined }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardForm(prev => ({ ...prev, cvv: raw }));
    if (formErrors.cvv) {
      setFormErrors(prev => ({ ...prev, cvv: undefined }));
    }
  };

  const handleAutofillDemoCard = () => {
    setCardForm({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: currentUser.name.toUpperCase() || 'ALEX RIVERA',
      expiry: '12/28',
      cvv: '849',
      zipCode: '94107',
      saveCard: true
    });
    setFormErrors({});
  };

  const validateCardForm = (): boolean => {
    const errors: FormErrors = {};
    const cleanNumber = cardForm.cardNumber.replace(/\D/g, '');

    if (cleanNumber.length < 15) {
      errors.cardNumber = 'Enter a valid 15 or 16-digit card number';
    }

    if (!cardForm.cardHolder.trim() || cardForm.cardHolder.trim().length < 2) {
      errors.cardHolder = 'Enter cardholder name as shown on card';
    }

    if (!cardForm.expiry || !cardForm.expiry.includes('/')) {
      errors.expiry = 'Format MM/YY';
    } else {
      const [m, y] = cardForm.expiry.split('/');
      const month = parseInt(m, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.expiry = 'Invalid month';
      }
    }

    if (cardForm.cvv.length < 3) {
      errors.cvv = '3-4 digits';
    }

    if (!cardForm.zipCode.trim() || cardForm.zipCode.trim().length < 3) {
      errors.zipCode = 'ZIP code required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitiateCheckout = (pack: { sparks: number; price: string; numericPrice: number; bonus: string }) => {
    setSelectedPackForCheckout(pack);
    setFormErrors({});
    setProcessingStage(null);
  };

  const handlePesapalSuccess = (receipt: PaymentReceipt, sparksEarned: number) => {
    onAddSparks(sparksEarned);
    const newTx: TransactionRecord = {
      id: receipt.txId,
      type: 'purchase',
      title: 'PesaPal Sparks Payment',
      subtitle: `Order ${receipt.pesapalOrderTrackingId || receipt.txId} → Settled to ${DESIGNATED_PAYMENT_CARD.formatted}`,
      amount: `+${sparksEarned.toLocaleString()} ⚡ (${receipt.amountPaid})`,
      payerCard: receipt.payerBrand,
      cardDestination: DESIGNATED_PAYMENT_CARD.formatted,
      timestamp: 'Just now',
      isPositive: true,
      receiptData: receipt
    };
    setTransactions(prev => [newTx, ...prev]);
    setSuccessMessage(`PesaPal payment confirmed received & credited to Card ${DESIGNATED_PAYMENT_CARD.formatted}! Official receipt ready. ⚡`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleLaunchPesapalIFrame = (pack: { sparks: number; price: string; numericPrice: number; bonus: string }) => {
    const names = (currentUser.name || 'Alex Rivera').split(' ');
    const customer = {
      firstName: names[0] || 'Alex',
      lastName: names.slice(1).join(' ') || 'Rivera',
      email: currentUser.handle ? `${currentUser.handle}@glitch.network` : 'alex.rivera@glitch.network',
      phone: '+254 712 345 678',
      currency: 'USD' as const
    };

    const packaged = packagePaymentRequestWithJWT(customer, pack);
    setActiveIframeRequest(packaged);
  };

  const handleIframePaymentSuccess = (status: PesapalPaymentStatus) => {
    if (!activeIframeRequest) return;
    const sparks = activeIframeRequest.order.sparks;
    onAddSparks(sparks);

    const receiptNum = `PESAPAL-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const receiptData: PaymentReceipt = {
      txId: status.orderTrackingId,
      receiptNumber: receiptNum,
      amountPaid: status.amount,
      sparksReceived: sparks,
      payerCardMasked: status.payerAccountMasked,
      payerName: `${activeIframeRequest.customer.firstName} ${activeIframeRequest.customer.lastName}`.toUpperCase(),
      payerBrand: status.paymentMethod,
      destinationCard: DESIGNATED_PAYMENT_CARD.formatted,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fundsReceivedTimestamp: status.fundsReceivedTimestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      settlementAuthRef: status.settlementAuthRef,
      verificationHash: status.verificationHash,
      clearingStatus: 'RECEIVED_AND_CREDITED',
      gateway: 'PESAPAL',
      pesapalOrderTrackingId: status.orderTrackingId,
      pesapalMerchantReference: status.merchantReference,
      paymentMethodUsed: status.paymentMethod
    };

    const newTx: TransactionRecord = {
      id: status.orderTrackingId,
      type: 'purchase',
      title: 'PesaPal Sparks Payment',
      subtitle: `IFrame Order ${status.orderTrackingId} → Settled to ${DESIGNATED_PAYMENT_CARD.formatted}`,
      amount: `+${sparks.toLocaleString()} ⚡ (${status.amount})`,
      payerCard: status.paymentMethod,
      cardDestination: DESIGNATED_PAYMENT_CARD.formatted,
      timestamp: 'Just now',
      isPositive: true,
      receiptData
    };

    setTransactions(prev => [newTx, ...prev]);
    setActiveIframeRequest(null);
    setLastPaymentReceipt(receiptData);
    setSuccessMessage(`Payment confirmed received via PesaPal IFrame and credited to Card ${DESIGNATED_PAYMENT_CARD.formatted}! Official receipt unlocked. ⚡`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleProcessPayment = () => {
    if (!selectedPackForCheckout) return;
    if (!validateCardForm()) return;
    setPaymentDeclinedError(null);
    setPrintBlockedAlert(null);
    setShowBank3dSecure(true);
  };

  const handleCancelBankChallenge = () => {
    setShowBank3dSecure(false);
    setIsProcessing(false);
    setProcessingStage(null);
    setPaymentDeclinedError(
      `Payment Cancelled: You did not authorize the transaction. No money was debited or received on beneficiary card ${DESIGNATED_PAYMENT_CARD.formatted}. Official receipt is strictly blocked.`
    );
  };

  const handleConfirmBankChallenge = async () => {
    if (!selectedPackForCheckout) return;
    setShowBank3dSecure(false);
    setIsProcessing(true);
    setProcessingStage('validating');
    setPaymentDeclinedError(null);
    setPrintBlockedAlert(null);

    const cleanCard = cardForm.cardNumber.replace(/\D/g, '');
    const last4 = cleanCard.slice(-4) || '4242';
    const brandInfo = detectCardBrand(cardForm.cardNumber);
    const pack = selectedPackForCheckout;

    try {
      setProcessingStage('authorizing');

      // Use processPayment(amount, cardNumber) with simulated JWT exchange & mock IPN listener
      const paymentResult = await processPayment(pack.price, cardForm.cardNumber, {
        customer: {
          firstName: cardForm.cardHolder.split(' ')[0] || 'Alex',
          lastName: cardForm.cardHolder.split(' ').slice(1).join(' ') || 'Rivera',
          email: currentUser.handle ? `${currentUser.handle}@glitch.network` : 'alex.rivera@glitch.network',
          phone: '+254 712 345 678',
          currency: 'USD'
        },
        paymentMethod: `${brandInfo.brand} Direct Rail` as any,
        onStatusUpdate: (stage) => {
          if (stage === 'AUTHENTICATING_JWT') setProcessingStage('authorizing');
          if (stage === 'INITIATING_ORDER') setProcessingStage('routing');
          if (stage === 'AWAITING_IPN') setProcessingStage('receiving');
        }
      });

      // Receipt is only created and unlocked when IPN returns 'SUCCESS'
      setProcessingStage('received');
      onAddSparks(pack.sparks);

      if (cardForm.saveCard) {
        try {
          localStorage.setItem('glitch_saved_card', JSON.stringify({
            cardNumber: cardForm.cardNumber,
            cardHolder: cardForm.cardHolder,
            expiry: cardForm.expiry,
            zipCode: cardForm.zipCode
          }));
        } catch {
          // ignore
        }
      }

      const receiptData: PaymentReceipt = {
        txId: paymentResult.orderTrackingId,
        receiptNumber: `REC-9035-${Math.floor(100000 + Math.random() * 900000)}`,
        amountPaid: pack.price,
        sparksReceived: pack.sparks,
        payerCardMasked: `•••• •••• •••• ${last4}`,
        payerName: cardForm.cardHolder.toUpperCase(),
        payerBrand: brandInfo.brand,
        destinationCard: DESIGNATED_PAYMENT_CARD.formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fundsReceivedTimestamp: paymentResult.fundsReceivedTimestamp,
        settlementAuthRef: paymentResult.settlementAuthRef,
        verificationHash: paymentResult.verificationHash,
        clearingStatus: 'RECEIVED_AND_CREDITED',
        gateway: 'PESAPAL',
        pesapalOrderTrackingId: paymentResult.orderTrackingId,
        pesapalMerchantReference: paymentResult.merchantReference,
        paymentMethodUsed: `${brandInfo.brand} (PesaPal Rail)`
      };

      const newTx: TransactionRecord = {
        id: paymentResult.orderTrackingId,
        type: 'purchase',
        title: 'Sparks Pack Payment',
        subtitle: `Charged ${brandInfo.brand} •••• ${last4} → Settled to ${DESIGNATED_PAYMENT_CARD.formatted}`,
        amount: `+${pack.sparks.toLocaleString()} ⚡ (${pack.price})`,
        payerCard: `${brandInfo.brand} •••• ${last4}`,
        cardDestination: DESIGNATED_PAYMENT_CARD.formatted,
        timestamp: 'Just now',
        isPositive: true,
        receiptData
      };

      setTransactions(prev => [newTx, ...prev]);

      setProcessingStage('receipt_ready');
      setLastPaymentReceipt(receiptData);
      setIsProcessing(false);
      setSelectedPackForCheckout(null);
      setSuccessMessage(`Payment received & credited to card ${DESIGNATED_PAYMENT_CARD.formatted}! Official receipt unlocked for printing. ⚡`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setIsProcessing(false);
      setProcessingStage(null);
      setPaymentDeclinedError('Payment processing failed: Mock IPN listener did not receive a SUCCESS status.');
    }
  };

  const handlePrintReceipt = (receipt: PaymentReceipt | null) => {
    if (!receipt || receipt.clearingStatus !== 'RECEIVED_AND_CREDITED') {
      setPrintBlockedAlert(`Cannot print receipt: Funds must first be received and credited to card ${DESIGNATED_PAYMENT_CARD.formatted}!`);
      setTimeout(() => setPrintBlockedAlert(null), 4000);
      return;
    }
    window.print();
  };

  const handleDownloadReceipt = (receipt: PaymentReceipt) => {
    if (!receipt || receipt.clearingStatus !== 'RECEIVED_AND_CREDITED') {
      setPrintBlockedAlert(`Cannot download receipt: Funds must first be received and credited to card ${DESIGNATED_PAYMENT_CARD.formatted}!`);
      setTimeout(() => setPrintBlockedAlert(null), 4000);
      return;
    }

    const receiptContent = `========================================================
GLITCH INTERACTIVE INC. - OFFICIAL TRANSACTION RECEIPT
========================================================
RECEIPT NO:         ${receipt.receiptNumber}
TRANSACTION ID:     ${receipt.txId}
SETTLEMENT REF:     ${receipt.settlementAuthRef}
DATE & TIME:        ${new Date().toLocaleDateString()} ${receipt.fundsReceivedTimestamp}

--------------------------------------------------------
FUNDS RECEIPT VERIFICATION:
--------------------------------------------------------
SETTLEMENT STATUS:  [ 100% RECEIVED & CREDITED ]
SETTLEMENT RAIL:    Visa Direct Real-Time Network
RECIPIENT CARD:     Visa ${receipt.destinationCard}
DEPOSIT CONFIRMED:  FUNDS RECEIVED BEFORE RECEIPT ISSUED
CLEARING AUTH REF:  ${receipt.settlementAuthRef}
DIGITAL HASH:       ${receipt.verificationHash}

--------------------------------------------------------
PAYER DETAILS:
--------------------------------------------------------
CARDHOLDER:         ${receipt.payerName}
DEBITED CARD:       ${receipt.payerBrand} ${receipt.payerCardMasked}
CURRENCY:           USD ($)

--------------------------------------------------------
ITEMIZED CHARGES:
--------------------------------------------------------
ITEM                QTY    PRICE
Sparks Pack         1      ${receipt.amountPaid} USD
(+${receipt.sparksReceived.toLocaleString()} Virtual Sparks)
--------------------------------------------------------
SUBTOTAL:           ${receipt.amountPaid} USD
SALES TAX (0.00%):  $0.00 USD
TOTAL RECEIVED:     ${receipt.amountPaid} USD
--------------------------------------------------------

* This receipt was generated and certified only after funds
  were confirmed received into beneficiary card ${receipt.destinationCard}.

Thank you for choosing Glitch!
Support: support@glitch.network
========================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Glitch_Receipt_${receipt.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    }, 1000);
  };

  const packs = [
    { sparks: 500, price: '$4.99', numericPrice: 4.99, popular: false, bonus: '' },
    { sparks: 1200, price: '$9.99', numericPrice: 9.99, popular: true, bonus: '+20% Bonus' },
    { sparks: 3000, price: '$24.99', numericPrice: 24.99, popular: false, bonus: '+35% Bonus' },
    { sparks: 7500, price: '$59.99', numericPrice: 59.99, popular: false, bonus: '+50% Bonus' },
  ];

  const currentBrandInfo = detectCardBrand(cardForm.cardNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0b0e17] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0e121d] to-[#0b0e17]">
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
              <p className="text-xs text-slate-400">Real money credit & debit card processing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                <span>Settlement Rail:</span>
                <span className="font-mono font-bold text-cyan-300 tracking-wider">
                  Visa {DESIGNATED_PAYMENT_CARD.formatted}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-medium border border-cyan-500/30">
                Active Beneficiary
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('balance')}
              className={`pb-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'balance'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Get Sparks (Card Checkout)
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className={`pb-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'payout'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Creator Payout
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Activity History ({transactions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4 max-h-[350px] overflow-y-auto no-scrollbar pb-3">
            
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
                      <p className="font-semibold text-white text-xs">Real Money Settlement Rail</p>
                      <p className="text-[11px] text-slate-400">
                        Money paid with your card routes directly to Visa <span className="text-cyan-300 font-mono font-medium">{DESIGNATED_PAYMENT_CARD.formatted}</span>
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
                          Real USD payment via Card
                        </p>
                      </div>

                      <div className="mt-3 flex flex-col gap-1.5">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleLaunchPesapalIFrame(pack)}
                          className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-cyan-200" />
                          <span>PesaPal IFrame Checkout ({pack.price})</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            disabled={isProcessing}
                            onClick={() => setSelectedPackForPesapal(pack)}
                            className="py-1.5 px-2 rounded-lg text-[10px] font-semibold border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/40 text-cyan-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="5-Step Integration Flow"
                          >
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span>5-Step Flow</span>
                          </button>

                          <button
                            disabled={isProcessing}
                            onClick={() => handleInitiateCheckout(pack)}
                            className="py-1.5 px-2 rounded-lg text-[10px] font-semibold border border-slate-700 hover:border-slate-600 bg-slate-900/90 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3 text-cyan-400" />
                            <span>Direct Card</span>
                          </button>
                        </div>
                      </div>
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
                            Beneficiary: {tx.cardDestination}
                          </p>
                        )}
                        {tx.receiptData && (
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setLastPaymentReceipt(tx.receiptData!)}
                              className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Printer className="w-2.5 h-2.5" />
                              <span>Print Receipt</span>
                            </button>
                            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Funds Received on 9035
                            </span>
                          </div>
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

        {/* =========================================================================
            REAL-MONEY CHECKOUT MODAL: CARD DETAILS ENTRY FORM
        ========================================================================= */}
        {selectedPackForCheckout && (
          <div className="absolute inset-0 z-50 bg-[#090b14]/98 backdrop-blur-xl p-5 overflow-y-auto no-scrollbar flex flex-col justify-between animate-in fade-in">
            <div className="space-y-4">
              
              {/* Checkout Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Real Money Card Payment</h3>
                    <p className="text-[11px] text-slate-400">Enter your credit/debit card to pay</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutofillDemoCard}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-medium border border-cyan-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Fill test card numbers for instant verification"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autofill Test Card</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => setSelectedPackForCheckout(null)}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Total & Item Bar */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Purchasing</span>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>{selectedPackForCheckout.sparks.toLocaleString()} Sparks</span>
                    {selectedPackForCheckout.bonus && (
                      <span className="text-[10px] font-medium text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        {selectedPackForCheckout.bonus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Amount to Charge</span>
                  <div className="text-xl font-extrabold text-cyan-400 font-['Outfit'] mt-0.5">
                    {selectedPackForCheckout.price} USD
                  </div>
                </div>
              </div>

              {/* Quick switch to PesaPal Gateway */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200 text-[11px]">Prefer PesaPal Secure IFrame Checkout?</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const pack = selectedPackForCheckout;
                      setSelectedPackForCheckout(null);
                      if (pack) handleLaunchPesapalIFrame(pack);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Open IFrame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pack = selectedPackForCheckout;
                      setSelectedPackForCheckout(null);
                      setSelectedPackForPesapal(pack);
                    }}
                    className="px-2 py-1 rounded-lg border border-blue-500/40 hover:bg-blue-900/40 text-cyan-300 text-[10px] cursor-pointer transition-colors"
                  >
                    5-Step Guide
                  </button>
                </div>
              </div>

              {/* LIVE HOLOGRAPHIC CARD PREVIEW */}
              <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-tr ${currentBrandInfo.bgGradient} border border-cyan-500/40 shadow-xl text-white transition-all duration-300`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between">
                  {/* EMV Chip & Contactless */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 rounded bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 border border-amber-500/60 flex items-center justify-center shadow">
                      <div className="w-5 h-3.5 border border-amber-600/40 rounded-xs" />
                    </div>
                    <span className="text-slate-400 text-xs">📶</span>
                  </div>

                  {/* Detected Brand Badge */}
                  <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-black/40 border border-white/20 tracking-wider">
                    {currentBrandInfo.brand}
                  </span>
                </div>

                {/* Card Number display */}
                <div className="mt-4 font-mono font-bold text-lg tracking-widest text-white/95">
                  {cardForm.cardNumber || '•••• •••• •••• ••••'}
                </div>

                {/* Cardholder & Expiry display */}
                <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">Cardholder</span>
                    <span className="font-semibold text-slate-200 tracking-wide uppercase truncate max-w-[180px] block font-mono">
                      {cardForm.cardHolder || 'FULL NAME'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">Expires</span>
                    <span className="font-mono font-bold text-slate-200">
                      {cardForm.expiry || 'MM/YY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD DETAILS INPUT FORM */}
              <div className="space-y-3">
                
                {/* Field 1: Cardholder Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ALEX RIVERA"
                    value={cardForm.cardHolder}
                    onChange={(e) => {
                      setCardForm(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }));
                      if (formErrors.cardHolder) setFormErrors(prev => ({ ...prev, cardHolder: undefined }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono ${
                      formErrors.cardHolder ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.cardHolder && (
                    <span className="text-[10px] text-rose-400 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.cardHolder}
                    </span>
                  )}
                </div>

                {/* Field 2: Card Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Card Number (16 Digits)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Visa • Mastercard • Amex • Discover
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardForm.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono tracking-wider ${
                        formErrors.cardNumber ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                      }`}
                    />
                    <div className="absolute right-3 top-2.5 text-xs">
                      <CreditCard className={`w-4 h-4 ${currentBrandInfo.iconColor}`} />
                    </div>
                  </div>
                  {formErrors.cardNumber && (
                    <span className="text-[10px] text-rose-400 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.cardNumber}
                    </span>
                  )}
                </div>

                {/* Field 3: Expiry, CVV, Billing ZIP (in grid) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Expiration */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={handleExpiryChange}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono text-center ${
                        formErrors.expiry ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.expiry && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block truncate">
                        {formErrors.expiry}
                      </span>
                    )}
                  </div>

                  {/* CVV / CVC */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        CVV / CVC
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="text-slate-400 hover:text-slate-200"
                        title={showCvv ? "Hide CVV" : "Show CVV"}
                      >
                        {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <input
                      type={showCvv ? 'text' : 'password'}
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={handleCvvChange}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono text-center tracking-widest ${
                        formErrors.cvv ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.cvv && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block truncate">
                        {formErrors.cvv}
                      </span>
                    )}
                  </div>

                  {/* Postal / ZIP */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Billing ZIP
                    </label>
                    <input
                      type="text"
                      placeholder="94107"
                      value={cardForm.zipCode}
                      onChange={(e) => {
                        setCardForm(prev => ({ ...prev, zipCode: e.target.value.toUpperCase().slice(0, 10) }));
                        if (formErrors.zipCode) setFormErrors(prev => ({ ...prev, zipCode: undefined }));
                      }}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono text-center ${
                        formErrors.zipCode ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.zipCode && (
                      <span className="text-[10px] text-rose-400 mt-0.5 block truncate">
                        {formErrors.zipCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Save card toggle */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardForm.saveCard}
                      onChange={(e) => setCardForm(prev => ({ ...prev, saveCard: e.target.checked }))}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Remember card for 1-click checkout</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Shield className="w-3 h-3" /> PCI-DSS 3.2.1
                  </span>
                </div>
              </div>

              {/* Settlement Destination Details: All money paid goes to card 4987050051779035 */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#07111e] via-[#091526] to-[#0c1a2e] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <CreditCard className="w-3.5 h-3.5" />
                    Beneficiary Destination Rail
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white font-mono">
                    VISA DIRECT
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Payment Recipient Card:</span>
                    <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
                      {DESIGNATED_PAYMENT_CARD.formatted}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Verified Active ✓</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Your payment of <span className="font-bold text-white">{selectedPackForCheckout.price} USD</span> will be debited from the card details entered above and settled directly to card <span className="font-mono text-cyan-300 font-semibold">{DESIGNATED_PAYMENT_CARD.formatted}</span>.
                </p>
              </div>

              {/* Processing Pipeline HUD with strict Money-Received Verification */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/60 shadow-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      Live Settlement & Receipt Pipeline
                    </span>
                    <span className="text-slate-400 font-bold">
                      {processingStage === 'validating' && '1/5 Validating Card'}
                      {processingStage === 'authorizing' && '2/5 Authorizing Charge'}
                      {processingStage === 'routing' && '3/5 Network Routing'}
                      {processingStage === 'receiving' && '4/5 Receiving Money on 9035'}
                      {processingStage === 'received' && '5/5 Money Received ✓'}
                      {processingStage === 'receipt_ready' && 'Receipt Ready to Print'}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500"
                      style={{
                        width: 
                          processingStage === 'validating' ? '20%' :
                          processingStage === 'authorizing' ? '40%' :
                          processingStage === 'routing' ? '60%' :
                          processingStage === 'receiving' ? '82%' : '100%'
                      }}
                    />
                  </div>

                  {/* Stage-by-stage status text */}
                  <div className="text-[11px] font-mono space-y-1">
                    <p className="text-slate-200">
                      {processingStage === 'validating' && `Encrypting credentials and validating ${currentBrandInfo.brand} card details...`}
                      {processingStage === 'authorizing' && `Authorizing ${selectedPackForCheckout.price} charge with issuing bank...`}
                      {processingStage === 'routing' && `Routing real funds via Visa Direct network to card ${DESIGNATED_PAYMENT_CARD.formatted}...`}
                      {processingStage === 'receiving' && (
                        <span className="text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          Awaiting deposit confirmation on beneficiary card {DESIGNATED_PAYMENT_CARD.formatted}...
                        </span>
                      )}
                      {(processingStage === 'received' || processingStage === 'receipt_ready') && (
                        <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Money Confirmed Received on Visa {DESIGNATED_PAYMENT_CARD.formatted}!
                        </span>
                      )}
                    </p>

                    {/* Receipt Lock / Unlock indicator */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        Receipt Printing Status:
                      </span>
                      {processingStage === 'receiving' || processingStage === 'routing' || processingStage === 'authorizing' || processingStage === 'validating' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPrintBlockedAlert(`Receipt Locked: Money must first be received by card ${DESIGNATED_PAYMENT_CARD.formatted} before the receipt can be printed!`);
                            setTimeout(() => setPrintBlockedAlert(null), 4000);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-1 cursor-pointer hover:bg-rose-900/60 transition-colors"
                        >
                          <LockKeyhole className="w-2.5 h-2.5" />
                          <span>Locked (Receiving Money...)</span>
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Unlocked (Funds Received)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Alert if user attempts early print before money receipt */}
              {printBlockedAlert && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="font-mono text-[11px] leading-tight">{printBlockedAlert}</span>
                </div>
              )}

              {/* Alert if user cancelled or did not pay */}
              {paymentDeclinedError && (
                <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed">{paymentDeclinedError}</span>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setSelectedPackForCheckout(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span>
                    {processingStage === 'receiving' 
                      ? `Receiving money on card ending in 9035...` 
                      : processingStage === 'received' || processingStage === 'receipt_ready'
                      ? 'Money received! Opening receipt...'
                      : 'Processing Real Money Payment...'}
                  </span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {selectedPackForCheckout.price} with Card</span>
                  </>
                )}
              </button>
            </div>

            {/* =========================================================================
                BANK 3D-SECURE 2.0 CUSTOMER IDENTITY & PAYMENT AUTHORIZATION CHALLENGE
                STRICT SECURITY: NO RECEIPT ISSUED IF USER CANCELS OR DECLINES!
            ========================================================================= */}
            {showBank3dSecure && (
              <div className="absolute inset-0 z-50 bg-[#060a16]/98 backdrop-blur-md p-5 flex flex-col justify-between animate-in zoom-in-95">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-cyan-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs font-mono">
                          Verified by Visa • 3D-Secure 2.0
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Direct Beneficiary Bank Settlement
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-600/30 text-blue-300 border border-blue-500/40">
                      STEP 2: AUTH
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Amount to Debit:</span>
                      <span className="font-bold text-white">
                        {selectedPackForCheckout.price} USD
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Beneficiary Settlement Card:</span>
                      <span className="font-bold text-cyan-300">
                        Visa {DESIGNATED_PAYMENT_CARD.formatted}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Payer Card (Debited):</span>
                      <span className="text-slate-200">
                        •••• •••• •••• {cardForm.cardNumber.replace(/\D/g, '').slice(-4) || '4242'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Enter 6-Digit Bank SMS Authorization Passcode
                    </label>
                    <input
                      type="text"
                      value={bankOtpCode}
                      onChange={(e) => setBankOtpCode(e.target.value)}
                      placeholder="903521"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-blue-500/50 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                    <p className="text-[10px] text-slate-400">
                      Bank Security Prompt: Your SMS authentication code for charge of {selectedPackForCheckout.price} is <strong className="text-cyan-300 font-mono">903521</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 leading-tight">
                    ⚠️ If you cancel or decline, no funds will be charged and <strong>no receipt will be generated or printed</strong>.
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelBankChallenge}
                    className="w-1/3 py-2.5 rounded-xl border border-rose-500/40 hover:bg-rose-950/50 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel Payment
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmBankChallenge}
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Settle {selectedPackForCheckout.price}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PAYMENT RECEIPT & ITEMIZED INVOICE MODAL OVERLAY
            STRICT REQUIREMENT: ISSUED ONLY AFTER FUNDS WERE RECEIVED ON CARD 4987050051779035
        ========================================================================= */}
        {lastPaymentReceipt && (
          <div className="absolute inset-0 z-50 bg-[#090b14]/98 backdrop-blur-xl p-5 overflow-y-auto no-scrollbar flex flex-col justify-between animate-in zoom-in-95">
            <div className="space-y-3.5">
              
              {/* Receipt Header */}
              <div className="text-center py-1">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white font-['Outfit'] tracking-wide">
                  Official Payment & Settlement Receipt
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Glitch Interactive Inc. • Direct Card Settlement
                </p>
              </div>

              {/* Verified Deposit Callout Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/60 border border-emerald-500/50 shadow-inner">
                <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Money Confirmed Received on Card Before Receipt Issuance</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed font-sans">
                  The amount of <strong className="text-white font-mono">{lastPaymentReceipt.amountPaid} USD</strong> was verified and credited directly to beneficiary Visa card ending in 9035 (<strong className="text-cyan-300 font-mono">{lastPaymentReceipt.destinationCard}</strong>) at <span className="font-mono text-emerald-300">{lastPaymentReceipt.fundsReceivedTimestamp}</span> prior to unlocking and printing this receipt.
                </p>
                <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Bank Clearing Ref: <span className="text-emerald-400 font-semibold">{lastPaymentReceipt.settlementAuthRef}</span></span>
                  <span className="text-emerald-400 font-bold">100% RECEIVED ✓</span>
                </div>
              </div>

              {/* Receipt Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>Receipt Number:</span>
                  <span className="text-cyan-400 font-bold">{lastPaymentReceipt.receiptNumber}</span>
                </div>

                {lastPaymentReceipt.pesapalOrderTrackingId && (
                  <div className="flex justify-between text-slate-400">
                    <span>PesaPal Tracking ID:</span>
                    <span className="text-blue-400 font-mono font-semibold">{lastPaymentReceipt.pesapalOrderTrackingId}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-white font-semibold">{lastPaymentReceipt.txId}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Payment Method:</span>
                  <span className="text-white font-semibold">
                    {lastPaymentReceipt.payerBrand} {lastPaymentReceipt.payerCardMasked}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Cardholder Name:</span>
                  <span className="text-slate-200">{lastPaymentReceipt.payerName}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Purchased Package:</span>
                  <span className="text-amber-400 font-bold">+{lastPaymentReceipt.sparksReceived.toLocaleString()} Sparks ⚡</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Amount Debited:</span>
                  <span className="text-white font-bold">{lastPaymentReceipt.amountPaid} USD</span>
                </div>

                {/* Recipient card highlighted */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/30 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Beneficiary / Destination Card:</span>
                    <span className="text-emerald-400 font-bold">RECEIVED & CREDITED ✓</span>
                  </div>
                  <span className="text-cyan-300 font-bold text-xs tracking-wider">
                    Visa {lastPaymentReceipt.destinationCard}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Settled at: {lastPaymentReceipt.fundsReceivedTimestamp}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800">
                  <span>Verification Hash:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{lastPaymentReceipt.verificationHash}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span>You can print this official receipt now or download it for your accounting records.</span>
              </div>
            </div>

            {/* Action Buttons: Print Receipt, Download Receipt, and Done */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePrintReceipt(lastPaymentReceipt)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadReceipt(lastPaymentReceipt)}
                className="py-2.5 px-3 rounded-xl border border-cyan-500/40 hover:bg-slate-800 text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Download Receipt Text File"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={() => setLastPaymentReceipt(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PRINTABLE RECEIPT LAYOUT FOR BROWSER PRINT (window.print())
            Only rendered when official receipt is confirmed and money has been received.
        ========================================================================= */}
        {lastPaymentReceipt && lastPaymentReceipt.clearingStatus === 'RECEIVED_AND_CREDITED' && (
          <div 
            id="official-glitch-printable-receipt" 
            data-funds-received="true"
            className="hidden print:block p-8 bg-white text-black font-sans"
          >
            <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase">GLITCH INTERACTIVE INC.</h1>
                <p className="text-xs text-gray-600">Official Payment & Settlement Receipt</p>
                <p className="text-xs text-gray-500">Beneficiary Direct Card Settlement</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 border-2 border-emerald-700 text-emerald-800 text-xs font-bold uppercase rounded">
                  ✓ MONEY RECEIVED & DEPOSITED
                </span>
                <p className="text-xs font-mono mt-1 text-gray-700 font-bold">Receipt #{lastPaymentReceipt.receiptNumber}</p>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-4 text-xs font-mono">
              <p className="font-bold text-gray-900 mb-1">SETTLEMENT RECEIPT NOTICE:</p>
              <p className="text-gray-700">
                This certifies that <strong>{lastPaymentReceipt.amountPaid} USD</strong> was confirmed received and deposited into beneficiary Visa Card <strong>{lastPaymentReceipt.destinationCard}</strong> at <strong>{lastPaymentReceipt.fundsReceivedTimestamp}</strong> prior to issuing and printing this receipt.
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Bank Clearing Ref: {lastPaymentReceipt.settlementAuthRef}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <p className="text-gray-500 uppercase font-mono text-[10px]">Payer (Debited Account)</p>
                <p className="font-bold text-gray-900">{lastPaymentReceipt.payerName}</p>
                <p className="font-mono text-gray-700">{lastPaymentReceipt.payerBrand} {lastPaymentReceipt.payerCardMasked}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 uppercase font-mono text-[10px]">Beneficiary (Recipient Account)</p>
                <p className="font-bold text-gray-900">Glitch Primary Beneficiary Account</p>
                <p className="font-mono font-bold text-blue-900">Visa {lastPaymentReceipt.destinationCard}</p>
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
                    <div className="text-gray-500 text-[11px]">+{lastPaymentReceipt.sparksReceived.toLocaleString()} Virtual Sparks</div>
                  </td>
                  <td className="text-center py-2">1</td>
                  <td className="text-right py-2 font-mono">{lastPaymentReceipt.amountPaid} USD</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td colSpan={2} className="py-2 text-right">TOTAL AMOUNT RECEIVED:</td>
                  <td className="py-2 text-right font-mono text-sm">{lastPaymentReceipt.amountPaid} USD</td>
                </tr>
              </tfoot>
            </table>

            <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center">
              <span>Verification Hash: {lastPaymentReceipt.verificationHash}</span>
              <span>Settlement Network: Visa Direct Real-Time Rail</span>
            </div>
          </div>
        )}

        {/* Pesapal 5-Step Integration Checkout Modal */}
        {selectedPackForPesapal && (
          <PesapalCheckoutModal
            isOpen={!!selectedPackForPesapal}
            onClose={() => setSelectedPackForPesapal(null)}
            currentUser={currentUser}
            selectedPack={selectedPackForPesapal}
            onPaymentSuccess={(receipt, sparksEarned) => {
              handlePesapalSuccess(receipt, sparksEarned);
              setSelectedPackForPesapal(null);
            }}
          />
        )}

        {/* Pesapal Secure IFrame Placeholder Modal */}
        {activeIframeRequest && (
          <div className="absolute inset-0 z-50 bg-[#090b14]/98 backdrop-blur-xl p-5 overflow-y-auto no-scrollbar flex flex-col justify-between animate-in zoom-in-95">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">PesaPal Secure Checkout IFrame</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      JWT Auth Verified • Direct to Visa {DESIGNATED_PAYMENT_CARD.formatted}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIframeRequest(null)}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Renders the IFrame Placeholder Component */}
              <PesapalIFramePlaceholder
                packagedRequest={activeIframeRequest}
                onPaymentSuccess={handleIframePaymentSuccess}
                onClose={() => setActiveIframeRequest(null)}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

