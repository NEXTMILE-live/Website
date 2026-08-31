import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useReveal } from '@/lib/animations';
import type { SiteContent } from '@/lib/content';

type Props = {
  onBack: () => void;
  onEnter: () => void;
  onRules: () => void;
  data: SiteContent['moreEntries'];
};

export default function GearPage({ onBack, onEnter, onRules, data }: Props) {
  const headerRef = useReveal<HTMLDivElement>();
  const introRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>();

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

      {/* Badge + Daily Entry CTA */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-20 sm:pt-32 pb-10 text-center">
        <div ref={headerRef} className="reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-500 uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            For the road ahead.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-500 text-charcoal tracking-tightest leading-[1.05]">
              {data.heading}
            </h1>
            <button
              onClick={onEnter}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-terracotta text-cream font-500 text-lg hover:bg-terracotta-dark transition-all shadow-lg active:scale-[0.97] flex-shrink-0"
            >
              GO
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Extra Entries section */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-6">
        <div ref={introRef} className="reveal reveal-delay-1 text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-500 text-charcoal tracking-tightest leading-[1.1] mb-3">
            {data.subheading}
          </h2>
          <p className="text-charcoal/55 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            {data.description}
          </p>
        </div>
      </div>

      {/* Free entry reminder */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-10">
        <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-teal/8 border border-teal/20">
          <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
          <p className="text-sm text-charcoal/70 text-center">
            {data.freeEntryNote}
          </p>
        </div>
      </div>

      {/* Product grid */}
      <div ref={gridRef} className="reveal max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {data.products.map((product) => (
            <div
              key={product.id}
              className="group bg-white/50 rounded-2xl border border-charcoal/8 overflow-hidden"
            >
              {/* Product image */}
              <div className="relative aspect-[4/3] bg-sand/30 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-charcoal/20 text-xs font-500 uppercase tracking-wider">
                    Product Image
                  </span>
                )}
              </div>

              {/* Product info */}
              <div className="p-5 sm:p-6 text-center">
                <h3 className="font-display text-lg sm:text-xl font-500 text-charcoal tracking-tight leading-tight mb-2">
                  {product.name}
                </h3>
                <p className="font-display text-2xl font-500 text-charcoal/80 mb-3">
                  {product.price}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta/10 text-terracotta text-sm font-600 tracking-wider">
                  {product.entries}
                </div>
                {product.productUrl && (
                  <div className="mt-4">
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-500 text-charcoal/60 hover:text-terracotta transition group/btn"
                    >
                      View Product
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclosure */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        <div className="border-t border-charcoal/10 pt-10 text-center">
          <p className="text-xs sm:text-sm text-charcoal/45 leading-relaxed max-w-xl mx-auto">
            No purchase necessary. Free entry is available to eligible participants. See{' '}
            <button
              onClick={onRules}
              className="text-terracotta hover:text-terracotta-dark underline underline-offset-2 transition font-500"
            >
              Official Rules
            </button>
            {' '}for complete entry details.
          </p>
        </div>
      </div>
    </div>
  );
}
