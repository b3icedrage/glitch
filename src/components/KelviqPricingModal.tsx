import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  CreditCard,
  Tag,
  AlertCircle,
  Clock,
  Flame
} from 'lucide-react';

interface KelviqPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
}

export const KelviqPricingModal: React.FC<KelviqPricingModalProps> = ({
  isOpen,
  onClose,
  isPro = false,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState<boolean>(false);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/kelviq/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargePeriod: billingPeriod }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to initialize checkout session');
      }

      // Redirect user to live Kelviq production checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Could not start checkout session');
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/kelviq/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok || !data.portalUrl) {
        throw new Error(data.error || 'Customer billing portal is not available yet.');
      }

      window.location.href = data.portalUrl;
    } catch (err: any) {
      console.error('Portal error:', err);
      setErrorMsg(err.message || 'No active billing account found. Subscribe first.');
      setPortalLoading(false);
    }
  };

  const copyDiscountCode = () => {
    navigator.clipboard.writeText('LAUNCH20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-xl bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Kelviq Production Billing
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    Active Subscriber
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Official live billing catalog & entitlements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Billing Period Selector */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setBillingPeriod('MONTHLY')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  billingPeriod === 'MONTHLY'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly ($9/mo)
              </button>
              <button
                onClick={() => setBillingPeriod('YEARLY')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'YEARLY'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Yearly ($90/yr)</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                  billingPeriod === 'YEARLY' ? 'bg-slate-950 text-cyan-300' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  2 Mos Free
                </span>
              </button>
            </div>
          </div>

          {/* Plan Card */}
          <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 space-y-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Single All-Access Tier
                </span>
                <h3 className="text-2xl font-black text-white">Pro Pass</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Full unrestricted access to combat, AI autopilot, and campaign modes.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-white">
                  {billingPeriod === 'MONTHLY' ? '$9' : '$90'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {billingPeriod === 'MONTHLY' ? 'per month' : 'per year (saves $18)'}
                </div>
              </div>
            </div>

            {/* Launch Promo Callout */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-mono">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>Launch Promo: <strong>20% off</strong> first 3 months</span>
              </div>
              <button
                onClick={copyDiscountCode}
                className="px-2.5 py-1 bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-600/40 rounded text-cyan-200 font-mono text-[11px] transition-colors"
              >
                {copiedCode ? 'Copied code!' : 'Copy LAUNCH20'}
              </button>
            </div>

            {/* Features list */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span>
                  <strong className="text-white">Special Grade AI Combat:</strong> Unlock Sukuna / Gojo Special Grade difficulty & Domain Expansions.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span>
                  <strong className="text-white">Unlimited Story Campaign:</strong> Unrestricted access to all battle stages and cursed dojo.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span>
                  <strong className="text-white">500 AI Compute Credits/mo:</strong> Auto-resets monthly (METER feature) for AI simulation.
                </span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Connecting to Kelviq Live Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Kelviq Production Checkout ({billingPeriod === 'MONTHLY' ? '$9/mo' : '$90/yr'})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {portalLoading ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Opening Customer Portal...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Manage Existing Subscription (Kelviq Customer Portal)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>Environment: Production (Live Billing)</span>
          <span>Powered by Kelviq</span>
        </div>

      </div>
    </div>
  );
};
