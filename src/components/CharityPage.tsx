import { useState } from 'react';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  X,
  ExternalLink,
  PawPrint,
  Baby,
  Home,
  Ribbon,
  Users,
  GraduationCap,
  Leaf,
  Stethoscope,
  Globe,
  HandHeart,
  Droplet,
  Sparkles,
  Loader2,
  Milestone,
  Info,
} from 'lucide-react';
import { useReveal } from '@/lib/animations';
import type { Charity, SiteContent } from '@/lib/content';

const ICON_MAP: Record<string, React.ReactNode> = {
  PawPrint: <PawPrint className="w-5 h-5" />,
  Baby: <Baby className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Ribbon: <Ribbon className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Stethoscope: <Stethoscope className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  HandHeart: <HandHeart className="w-5 h-5" />,
  Droplet: <Droplet className="w-5 h-5" />,
};

const DONATION_AMOUNTS = [10, 25, 50, 100];

export default function CharityPage({
  onBack,
  data,
}: {
  onBack: () => void;
  data: SiteContent['causes'];
}) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [amount, setAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [showNextMile, setShowNextMile] = useState(false);

  const headerRef = useReveal<HTMLDivElement>();
  const cardsRef = useReveal<HTMLDivElement>();

  const filtered = data.charities;
  const finalAmount = amount ?? (customAmount ? parseFloat(customAmount) : null);

  const handleDonate = () => {
    if (!selectedCharity || !finalAmount || finalAmount < 1) return;
    setRedirecting(true);
    window.open(selectedCharity.url, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      setRedirecting(false);
      setSelectedCharity(null);
    }, 1500);
  };

  const handleCustomDonate = () => {
    if (!customUrl || !finalAmount || finalAmount < 1) return;
    let url = customUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setRedirecting(true);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      setRedirecting(false);
      setShowCustom(false);
    }, 1500);
  };

  const closeModal = () => {
    setSelectedCharity(null);
    setAmount(25);
    setCustomAmount('');
  };

  const closeCustom = () => {
    setShowCustom(false);
    setCustomName('');
    setCustomUrl('');
    setAmount(25);
    setCustomAmount('');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-charcoal/10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition text-sm font-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="font-display text-lg font-500 tracking-tightest text-charcoal ml-auto">
            NEXT MILE
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <div ref={headerRef} className="reveal text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-500 uppercase tracking-wider mb-5">
            <HandHeart className="w-3.5 h-3.5" fill="currentColor" />
            {data.charityBadge}
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-500 text-charcoal tracking-tightest mb-3">
            {data.charityHeading}
          </h1>
          <p className="text-charcoal/60 leading-relaxed max-w-2xl mx-auto">
            {data.charityDescription}
          </p>
        </div>

        {/* Charity grid */}
        <div ref={cardsRef} className="reveal grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {filtered.map((charity) => (
            <button
              key={charity.id}
              onClick={() => {
                setSelectedCharity(charity);
                setAmount(25);
                setCustomAmount('');
              }}
              className="group text-left p-6 rounded-2xl border border-charcoal/10 bg-cream hover:border-terracotta/40 hover:shadow-lg hover:shadow-terracotta/5 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
                  {ICON_MAP[charity.iconKey] || <Heart className="w-5 h-5" />}
                </div>
                <ArrowRight className="w-5 h-5 text-charcoal/20 group-hover:text-terracotta group-hover:translate-x-0.5 transition flex-shrink-0" />
              </div>
              <h3 className="font-500 text-charcoal text-base leading-tight mb-1.5">{charity.name}</h3>
              <p className="text-sm text-charcoal/50 leading-relaxed flex-1">{charity.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-terracotta font-500 text-sm group-hover:gap-3 transition-all">
                {data.charityCtaText}
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          ))}

          {/* Custom charity card */}
          <button
            onClick={() => {
              setShowCustom(true);
              setAmount(25);
              setCustomAmount('');
            }}
            className="group text-left p-6 rounded-2xl border border-dashed border-charcoal/20 bg-cream/50 hover:border-terracotta/40 hover:bg-terracotta/5 transition-all flex flex-col items-center justify-center text-center min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-xl bg-sand text-charcoal/50 flex items-center justify-center mb-3 group-hover:bg-terracotta/10 group-hover:text-terracotta transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-500 text-charcoal/70 text-base mb-1">Your own charity</h3>
            <p className="text-sm text-charcoal/40">Have a cause in mind? Enter it directly.</p>
          </button>
        </div>

        {/* NEXT MILE direct support */}
        <div className="mt-6">
          <button
            onClick={() => { setShowNextMile(true); setAmount(25); setCustomAmount(''); }}
            className="group w-full text-left p-6 rounded-2xl bg-gradient-to-r from-teal to-teal-light text-cream hover:from-teal-dark hover:to-teal transition-all flex items-center justify-between shadow-lg shadow-teal/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cream/20 flex items-center justify-center flex-shrink-0">
                <Milestone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-500 leading-tight">Donate to NEXT MILE</h3>
                <p className="text-sm text-cream/70 mt-0.5">Support website hosting, operating expenses, and future vehicle giveaways.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-cream/50 group-hover:text-cream group-hover:translate-x-0.5 transition flex-shrink-0" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-charcoal/10 flex items-start gap-3 text-left">
          <Info className="w-4 h-4 text-charcoal/30 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal/45 leading-relaxed">
            {data.donationDisclaimer}
          </p>
        </div>
      </div>

      {/* Donation Modal — Pre-selected charity */}
      {selectedCharity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-cream rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-sand/60 transition z-10" aria-label="Close">
              <X className="w-5 h-5 text-charcoal/50" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
                  {ICON_MAP[selectedCharity.iconKey] || <Heart className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-display text-xl font-500 text-charcoal leading-tight">{selectedCharity.name}</h3>
                </div>
              </div>

              <p className="text-sm text-charcoal/60 mb-6 leading-relaxed">{selectedCharity.description}</p>

              <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-3">Choose an amount</label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {DONATION_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`py-3 rounded-xl font-500 text-lg transition ${
                      amount === amt
                        ? 'bg-terracotta text-cream'
                        : 'bg-sand/60 text-charcoal/70 hover:bg-sand'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 font-500">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                  className="w-full rounded-xl border border-charcoal/15 bg-cream pl-8 pr-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-transparent transition"
                />
              </div>

              <button
                onClick={handleDonate}
                disabled={!finalAmount || finalAmount < 1 || redirecting}
                className="w-full py-3.5 rounded-full bg-terracotta text-cream font-500 text-lg hover:bg-terracotta-dark transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Donate {finalAmount ? `$${finalAmount}` : ''} to {selectedCharity.name}
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-charcoal/40 text-center mt-4 leading-relaxed">
                You'll be redirected to {selectedCharity.name}'s official donation page. We never see or handle your payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal — NEXT MILE */}
      {showNextMile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setShowNextMile(false)} />
          <div className="relative bg-cream rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowNextMile(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-sand/60 transition z-10" aria-label="Close">
              <X className="w-5 h-5 text-charcoal/50" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-teal/15 text-teal flex items-center justify-center flex-shrink-0">
                  <Milestone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-500 text-charcoal leading-tight">NEXT MILE</h3>
                  <span className="text-xs text-charcoal/40 font-400">Operating Fund</span>
                </div>
              </div>

              <p className="text-sm text-charcoal/60 mb-6 leading-relaxed">
                Your donation helps cover website hosting, operating expenses, and future vehicle giveaways. NEXT MILE is not a registered nonprofit.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-teal/5 border border-teal/15">
                <p className="text-sm text-charcoal/60 leading-relaxed">
                  You choose your amount on the next page. Pay with card, Apple Pay, or Google Pay — all processed securely through Stripe.
                </p>
              </div>

              <button
                onClick={() => {
                  setRedirecting(true);
                  window.open('https://buy.stripe.com/test_7sYeVe2JC3l5b1j5hnbfO00', '_blank', 'noopener,noreferrer');
                  setTimeout(() => {
                    setRedirecting(false);
                    setShowNextMile(false);
                  }, 1500);
                }}
                disabled={redirecting}
                className="w-full py-3.5 rounded-full bg-teal text-cream font-500 text-lg hover:bg-teal-dark transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Donate to NEXT MILE
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-charcoal/40 text-center mt-4 leading-relaxed">
                You'll be redirected to Stripe's secure checkout. Donations are completely optional and have no impact on your eligibility, number of entries, or chances of winning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal — Custom charity */}
      {showCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={closeCustom} />
          <div className="relative bg-cream rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button onClick={closeCustom} className="absolute top-4 right-4 p-2 rounded-full hover:bg-sand/60 transition z-10" aria-label="Close">
              <X className="w-5 h-5 text-charcoal/50" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-sand text-charcoal/60 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-500 text-charcoal leading-tight">Your own charity</h3>
                  <span className="text-xs text-charcoal/40 font-400">Custom</span>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">Charity name</label>
                  <input
                    type="text"
                    placeholder="e.g., Local Food Bank of Austin"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">Donation page URL</label>
                  <input
                    type="url"
                    placeholder="https://www.example.org/donate"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-transparent transition"
                  />
                </div>
              </div>

              <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-3">Choose an amount</label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {DONATION_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`py-3 rounded-xl font-500 text-lg transition ${
                      amount === amt
                        ? 'bg-terracotta text-cream'
                        : 'bg-sand/60 text-charcoal/70 hover:bg-sand'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 font-500">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                  className="w-full rounded-xl border border-charcoal/15 bg-cream pl-8 pr-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-transparent transition"
                />
              </div>

              <button
                onClick={handleCustomDonate}
                disabled={!customUrl || !finalAmount || finalAmount < 1 || redirecting}
                className="w-full py-3.5 rounded-full bg-terracotta text-cream font-500 text-lg hover:bg-terracotta-dark transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    Donate {finalAmount ? `$${finalAmount}` : ''} to {customName || 'your charity'}
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-charcoal/40 text-center mt-4 leading-relaxed">
                You'll be redirected to the donation page you entered. We never see or handle your payment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
