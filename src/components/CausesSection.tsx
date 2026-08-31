import {
  Heart,
  HandHeart,
  ArrowRight,
  Car,
  Milestone,
  Info,
} from 'lucide-react';
import { useReveal } from '@/lib/animations';
import type { SiteContent } from '@/lib/content';

type Props = {
  data: SiteContent['causes'];
  donateCarData: SiteContent['donateCar'];
  onDonateCar: () => void;
  onCharity: () => void;
};

export default function CausesSection({ data, donateCarData, onDonateCar, onCharity }: Props) {
  const headerRef = useReveal<HTMLDivElement>();
  const cardsRef = useReveal<HTMLDivElement>();

  return (
    <section id="causes" className="relative py-28 sm:py-40 scroll-mt-20 overflow-hidden">
      {/* Subtle background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/6146693/pexels-photo-6146693.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/95 via-cream/90 to-cream/95" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div ref={headerRef} className="reveal text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-500 uppercase tracking-wider mb-5">
            <Heart className="w-3.5 h-3.5" fill="currentColor" />
            {data.badgeText}
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-400 text-charcoal tracking-tight mb-4">
            Help someone else reach their <span className="text-terracotta/70">NEXT MILE</span>
          </h2>
          <p className="text-lg text-charcoal/60 max-w-2xl mx-auto font-400 leading-relaxed">
            {data.subheading}
          </p>
        </div>

        {/* Two pathway cards */}
        <div ref={cardsRef} className="reveal grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Car donation card */}
          <button
            onClick={onDonateCar}
            className="group text-left p-7 rounded-2xl border border-charcoal/10 bg-cream hover:border-teal/40 hover:shadow-lg hover:shadow-teal/5 transition-all flex flex-col"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-[11px] font-500 uppercase tracking-wider mb-4 self-start">
              <Car className="w-3 h-3" fill="currentColor" />
              {donateCarData.badgeText}
            </div>
            <h3 className="font-display text-2xl font-500 text-charcoal tracking-tight mb-3">
              {donateCarData.heading}
            </h3>
            <p className="text-sm text-charcoal/55 leading-relaxed flex-1">
              {donateCarData.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-teal font-500 text-sm group-hover:gap-3 transition-all">
              {donateCarData.ctaText}
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          {/* Charity card */}
          <button
            onClick={onCharity}
            className="group text-left p-7 rounded-2xl border border-charcoal/10 bg-cream hover:border-terracotta/40 hover:shadow-lg hover:shadow-terracotta/5 transition-all flex flex-col"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-[11px] font-500 uppercase tracking-wider mb-4 self-start">
              <HandHeart className="w-3 h-3" fill="currentColor" />
              {data.charityBadge}
            </div>
            <h3 className="font-display text-2xl font-500 text-charcoal tracking-tight mb-3">
              {data.charityHeading}
            </h3>
            <p className="text-sm text-charcoal/55 leading-relaxed flex-1">
              {data.charityDescription}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-terracotta font-500 text-sm group-hover:gap-3 transition-all">
              {data.charityCtaText}
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* NEXT MILE direct support — links to charity page */}
        <div className="mt-6">
          <button
            onClick={onCharity}
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
    </section>
  );
}
