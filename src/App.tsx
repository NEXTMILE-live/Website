import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Menu, X, LayoutDashboard, CarFront } from 'lucide-react';
import EntryForm from '@/components/EntryForm';
import CausesSection from '@/components/CausesSection';
import DonateCarPage from '@/components/DonateCarPage';
import CharityPage from '@/components/CharityPage';
import AboutPage from '@/components/AboutPage';
import GearPage from '@/components/GearPage';
import OfficialRulesPage from '@/components/OfficialRulesPage';
import AdminDashboard from '@/components/AdminDashboard';
import { useReveal, useParallax, useScrollProgress } from '@/lib/animations';
import { useSiteContent } from '@/lib/useContent';

type View = 'home' | 'enter' | 'car' | 'rules' | 'donate-car' | 'charity' | 'about' | 'gear';

const VALID_VIEWS = new Set<View>(['home', 'enter', 'car', 'rules', 'donate-car', 'charity', 'about', 'gear']);

function viewFromHash(): View {
  const h = window.location.hash.replace('#', '') as View;
  return VALID_VIEWS.has(h) ? h : 'home';
}

export default function App() {
  const [view, setViewState] = useState<View>(viewFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const { content } = useSiteContent();

  const setView = useCallback((v: View) => {
    setViewState(v);
    window.location.hash = v === 'home' ? '' : v;
  }, []);

  useEffect(() => {
    const onHash = () => setViewState(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (view !== 'home') window.scrollTo(0, 0);
  }, [view]);

  const scrollToEntry = () => {
    setView('enter');
    setMenuOpen(false);
  };

  const viewCar = () => setView('car');
  const viewRules = () => {
    setView('rules');
    setMenuOpen(false);
  };
  const viewDonateCar = () => {
    setView('donate-car');
    setMenuOpen(false);
  };
  const viewCharity = () => {
    setView('charity');
    setMenuOpen(false);
  };
  const scrollToBeyond = () => {
    if (view !== 'home') setView('home');
    setMenuOpen(false);
    requestAnimationFrame(() => {
      document.getElementById('causes')?.scrollIntoView({ behavior: 'smooth' });
    });
  };
  const viewAbout = () => {
    setView('about');
    setMenuOpen(false);
  };
  const viewGear = () => {
    setView('gear');
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans antialiased overflow-x-clip">
      {adminMode ? (
        <AdminDashboard onExit={() => setAdminMode(false)} />
      ) : view === 'enter' ? (
        <>
          <EntryPage onBack={() => setView('home')} onGear={viewGear} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : view === 'car' ? (
        <>
          <CarPage onBack={() => setView('home')} onEnter={() => setView('enter')} data={content.car} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : view === 'rules' ? (
        <>
          <OfficialRulesPage onBack={() => setView('home')} lastUpdated={content.rules.lastUpdated} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : view === 'donate-car' ? (
        <>
          <DonateCarPage onBack={() => setView('home')} data={content.donateCar} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : view === 'charity' ? (
        <>
          <CharityPage onBack={() => setView('home')} data={content.causes} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : view === 'about' ? (
        <>
          <AboutPage onBack={() => setView('home')} onEnter={scrollToEntry} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : view === 'gear' ? (
        <>
          <GearPage onBack={() => setView('home')} onEnter={scrollToEntry} onRules={viewRules} data={content.moreEntries} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      ) : (
        <>
          <Nav scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onEnter={scrollToEntry} onAdmin={() => setAdminMode(true)} onRules={viewRules} onBeyond={scrollToBeyond} onAbout={viewAbout} onGear={viewGear} logoUrl={content.branding.logoUrl} brandName={content.branding.brandName} navData={content.nav} />

          <HeroScroll onEnter={scrollToEntry} onViewCar={viewCar} heroData={content.hero} mtdData={content.moreThanDriving} />
          <HowItWorks data={content.howItWorks} onRules={viewRules} />
          <CausesSection data={content.causes} donateCarData={content.donateCar} onDonateCar={viewDonateCar} onCharity={viewCharity} />
          <ClosingSection onViewCar={viewCar} data={content.closing} />
          <SiteFooter onAdmin={() => setAdminMode(true)} onRules={viewRules} onGear={viewGear} onAbout={viewAbout} onBeyond={scrollToBeyond} data={content.branding} navData={content.nav} />
        </>
      )}
    </div>
  );
}

/* ───────────────────── Entry Page (full-page form) ───────────────────── */
function EntryPage({ onBack, onGear }: { onBack: () => void; onGear: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-charcoal/10">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
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
      <div className="flex-1 flex items-center justify-center py-12 sm:py-20 px-5">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl sm:text-5xl font-500 text-charcoal tracking-tightest mb-2">
              ENTER THE GIVEAWAY
            </h1>
            <p className="text-charcoal/50 text-sm">
              YOUR FREE DAILY ENTRY — ENTER ONCE EVERY 24 HOURS.
            </p>
          </div>
          <div className="bg-white/60 rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8">
            <EntryForm onClose={onBack} inline onGear={onGear} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Nav ───────────────────── */
function Nav({
  scrolled,
  menuOpen,
  setMenuOpen,
  onEnter,
  onAdmin,
  onRules,
  onBeyond,
  onAbout,
  onGear,
  logoUrl,
  brandName,
  navData,
}: {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  onEnter: () => void;
  onAdmin: () => void;
  onRules: () => void;
  onBeyond: () => void;
  onAbout: () => void;
  onGear: () => void;
  logoUrl: string;
  brandName: string;
  navData: import('@/lib/content').SiteContent['nav'];
}) {
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-cream/85 backdrop-blur-md py-3 shadow-sm'
          : 'bg-charcoal/35 backdrop-blur-sm py-4'
      }`
    }
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className={`relative flex items-center justify-center w-8 h-8 rounded-lg font-display text-sm font-600 tracking-tightest transition-all duration-500 ${
            scrolled
              ? 'bg-charcoal text-cream'
              : 'bg-cream/15 text-cream border border-cream/25 backdrop-blur-sm'
          } group-hover:scale-105 group-hover:shadow-md`}>
            NM
          </span>
        </a>

        <div className={`hidden md:flex items-center gap-8 text-sm font-400 transition-colors duration-500 ${
          scrolled ? 'text-charcoal/60' : 'text-cream/70'
        }`}>
          <button onClick={onAbout} className={`hover:opacity-100 transition ${scrolled ? 'hover:text-charcoal' : 'hover:text-cream'}`}>{navData.aboutLabel}</button>
          <a href="#how" className={`hover:opacity-100 transition ${scrolled ? 'hover:text-charcoal' : 'hover:text-cream'}`}>{navData.howItWorksLabel}</a>
          <button onClick={onGear} className={`hover:opacity-100 transition ${scrolled ? 'hover:text-charcoal' : 'hover:text-cream'}`}>{navData.moreEntriesLabel}</button>
          <button onClick={onBeyond} className={`hover:opacity-100 transition ${scrolled ? 'hover:text-charcoal' : 'hover:text-cream'}`}>{navData.beyondLabel}</button>
          <button onClick={onRules} className={`hover:opacity-100 transition ${scrolled ? 'hover:text-charcoal' : 'hover:text-cream'}`}>{navData.rulesLabel}</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAdmin}
            className={`hidden sm:inline-flex p-2 rounded-full transition ${
              scrolled
                ? 'text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5'
                : 'text-cream/40 hover:text-cream hover:bg-cream/10'
            }`}
            aria-label="Admin"
            title="Admin"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button
            onClick={onEnter}
            className="hidden sm:inline-flex px-5 py-2 rounded-full bg-terracotta text-cream text-sm font-500 hover:bg-terracotta-dark transition-all active:scale-[0.97]"
          >
            {navData.enterButton}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-1 transition-colors duration-500 ${
              scrolled ? 'text-charcoal' : 'text-cream'
            }`}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-cream/95 backdrop-blur-md border-t border-charcoal/10 px-5 py-4 space-y-3">
          {([
            [navData.aboutLabel, '', onAbout],
            [navData.howItWorksLabel, '#how', undefined],
            [navData.moreEntriesLabel, '', onGear],
            [navData.beyondLabel, '', onBeyond],
          ] as [string, string, (() => void) | undefined][]).map(([label, href, onClick], i) => (
            href ? (
              <a
                key={i}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block text-charcoal/70 font-400 hover:text-charcoal transition"
              >
                {label}
              </a>
            ) : (
              <button
                key={i}
                onClick={() => { onClick?.(); setMenuOpen(false); }}
                className="block text-charcoal/70 font-400 hover:text-charcoal transition text-left w-full"
              >
                {label}
              </button>
            )
          ))}
          <button
            onClick={onRules}
            className="block text-charcoal/70 font-400 hover:text-charcoal transition text-left w-full"
          >
            {navData.rulesLabel}
          </button>
          <button
            onClick={() => { onEnter(); setMenuOpen(false); }}
            className="w-full mt-2 py-2.5 rounded-full bg-terracotta text-cream font-500"
          >
            {navData.enterButton}
          </button>
        </div>
      )}
    </nav>
  );
}

/* ───────────────────── Hero Scroll (merged hero + word transitions) ───────────────────── */
function HeroScroll({
  onEnter,
  onViewCar,
  heroData,
  mtdData,
}: {
  onEnter: () => void;
  onViewCar: () => void;
  heroData: import('@/lib/content').SiteContent['hero'];
  mtdData: import('@/lib/content').SiteContent['moreThanDriving'];
}) {
  const { ref, progress } = useScrollProgress<HTMLElement>();

  // Layout: compressed single-screen hero + brief word/closing transition
  //   0.00–0.45: Hero screen (static)
  //   0.45–0.80: Word transitions (sticky)
  //   0.80–1.00: Closing line + View button

  // Word transition sub-phases — widened so each word lingers
  const wtStart = 0.08;
  const wtEnd = 0.92;
  const wtProgress = Math.max(0, Math.min(1, (progress - wtStart) / (wtEnd - wtStart)));

  const fadeIn = Math.max(0, Math.min(1, wtProgress / 0.08));

  const cycleStart = 0.05;
  const cycleEnd = 1.0;
  const cycleProgress = Math.max(0, Math.min(1, (wtProgress - cycleStart) / (cycleEnd - cycleStart)));
  const cycleWords = mtdData.cyclingWords;
  const cycleIndex = Math.min(
    cycleWords.length - 1,
    Math.floor(cycleProgress * cycleWords.length * 0.999)
  );

  const showTransitions = wtProgress >= 0.02;
  const showClosing = progress >= 0.92;

  return (
    <section
      id="top"
      ref={ref}
      className="relative scroll-mt-20 overflow-hidden"
      style={{ minHeight: '140vh' }}
    >
      {/* Single background image covering the ENTIRE section */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroData.heroImage}
          alt="A dark highway at night illuminated by streetlights"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/55 to-charcoal/80" />
      </div>

      {/* Screen 1: Hero — compressed, pushed down from top */}
      <div className="relative h-[50vh] min-h-[340px] flex items-center justify-center z-10 pt-[18vh]">
        <div className="text-center px-5">
          <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-600 text-cream tracking-tightest leading-[0.95] animate-fade-up">
            {heroData.headline}
          </h1>
          <p className="font-display text-xl sm:text-2xl font-400 text-cream/40 italic mt-2 animate-fade-up blur-[1px]">
            {heroData.subheadline}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={onEnter}
              className="px-8 py-4 rounded-full bg-terracotta text-cream font-500 text-base sm:text-lg hover:bg-terracotta-dark transition-all shadow-xl active:scale-[0.97] flex items-center gap-2"
            >
              {heroData.ctaText}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-cream/60 text-sm font-400">{heroData.note}</p>
          </div>
        </div>
      </div>

      {/* Screen 2: Word transitions — sticky, centered */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden z-10">
        <div
          className="max-w-5xl mx-auto px-5 sm:px-8 text-center w-full transition-all duration-700"
          style={{
            opacity: showTransitions ? fadeIn : 0,
            transform: `translateY(${showTransitions ? 0 : 30}px)`,
          }}
        >
          {/* "IT'S" stays static — same font as the cycling words */}
          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-600 text-cream tracking-tightest leading-[1.05]">
            {mtdData.staticPrefix}
          </h2>

          {/* Cycling word — centered below "IT'S" */}
          <div className="relative mt-6 sm:mt-8" style={{ height: '1.4em' }}>
            {cycleWords.map((word, i) => {
              const active = i === cycleIndex;
              return (
                <span
                  key={word}
                  className="absolute inset-x-0 font-display text-5xl sm:text-7xl lg:text-8xl font-600 tracking-tightest transition-all duration-500 ease-out text-terracotta"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: `translateY(${active ? 0 : (i < cycleIndex ? -1.4 : 1.4)}em) scale(${active ? 1 : 0.9})`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Screen 3: Closing line + View button — static, at the bottom */}
      <div className="relative h-[30vh] min-h-[240px] flex items-center justify-center z-10">
        <div className="text-center px-5 transition-all duration-700" style={{ opacity: showClosing ? 1 : 0 }}>
          <p className="font-display text-3xl sm:text-5xl lg:text-6xl font-500 text-cream tracking-tightest leading-[1.15] mb-8">
            {mtdData.closingLine}
          </p>
          <button
            onClick={onViewCar}
            className="group inline-flex items-center gap-2 border border-cream/40 rounded-full px-8 py-3.5 text-cream font-500 hover:bg-cream/10 hover:border-cream/70 transition-all"
          >
            {mtdData.viewCarText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Car Page (campaign closed) ───────────────────── */
function CarPage({ onBack }: { onBack: () => void; onEnter: () => void; data: import('@/lib/content').SiteContent['car'] }) {
  const primarySpecs = [
    { label: 'Year', value: '—' },
    { label: 'Make / Model', value: '—' },
    { label: 'Mileage', value: '—' },
  ];

  const detailSpecs = [
    { label: 'Condition', value: '—' },
    { label: 'Drivetrain', value: '—' },
    { label: 'Transmission', value: '—' },
    { label: 'Title', value: '—' },
  ];

  const placeholderFeatures = ['—', '—', '—'];

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

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-14">
        {/* Closed banner */}
        <div className="mb-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-charcoal/5 text-charcoal/50 text-xs font-500 uppercase tracking-wider mb-4">
            Campaign Closed for Now
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-500 text-charcoal tracking-tightest mb-2">
            No vehicle currently selected
          </h1>
        </div>

        {/* Placeholder photo area */}
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-4 bg-sand/40 flex items-center justify-center">
          <div className="text-center">
            <CarFront className="w-16 h-16 text-charcoal/15 mx-auto mb-3" />
            <p className="text-charcoal/30 text-sm font-400">No photos available</p>
          </div>
        </div>

        {/* Primary specs */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-10">
          {primarySpecs.map((spec) => (
            <div key={spec.label} className="flex flex-col">
              <span className="text-charcoal/30 text-xs font-400 uppercase tracking-wider mb-1">
                {spec.label}
              </span>
              <span className="text-charcoal/40 font-400 text-sm sm:text-base">
                {spec.value}
              </span>
            </div>
          ))}
        </div>

        {/* Features placeholder */}
        <div className="mb-10">
          <span className="text-charcoal/30 text-xs font-400 uppercase tracking-wider mb-3 block">
            Features
          </span>
          <div className="flex flex-wrap gap-2">
            {placeholderFeatures.map((feat, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-sand/40 text-charcoal/30 text-xs font-400"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Vehicle details */}
        <div className="border-t border-charcoal/10 pt-8 mb-10">
          <h3 className="font-display text-sm font-500 text-charcoal/40 uppercase tracking-wider mb-6">
            Vehicle Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
            {detailSpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col">
                <span className="text-charcoal/30 text-xs font-400 uppercase tracking-wider mb-1">
                  {spec.label}
                </span>
                <span className="text-charcoal/40 font-400 text-sm sm:text-base">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div className="border-t border-charcoal/10 pt-10 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-500 text-charcoal tracking-tightest mb-2">
            Coming Soon
          </h2>
          <p className="text-charcoal/50 font-400 text-sm sm:text-base">
            The next giveaway vehicle will be revealed here.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── How It Works ───────────────────── */
function HowItWorks({ data, onRules }: { data: import('@/lib/content').SiteContent['howItWorks']; onRules: () => void }) {
  const headerRef = useReveal<HTMLDivElement>();
  const stepRefs = data.steps.map(() => useReveal<HTMLDivElement>());

  return (
    <section id="how" className="py-28 sm:py-40 bg-sand/50 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div ref={headerRef} className="reveal text-center mb-20">
          <h2 className="font-display text-3xl sm:text-5xl font-400 text-charcoal tracking-tight">
            {data.heading}
          </h2>
        </div>

        <div className="space-y-16 sm:space-y-20">
          {data.steps.map((step, i) => (
            <div
              key={i}
              ref={stepRefs[i]}
              className={`reveal reveal-delay-${Math.min(i + 1, 3)} flex items-start gap-6 sm:gap-10`}
            >
              <span className="font-display text-5xl sm:text-7xl font-300 text-terracotta/40 leading-none flex-shrink-0">
                {step.num}
              </span>
              <div className="pt-2">
                <h3 className="font-display text-xl sm:text-2xl font-500 text-charcoal mb-2">
                  {step.title}
                </h3>
                <p className="text-charcoal/60 font-400 text-base sm:text-lg leading-relaxed max-w-md">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-charcoal/50 text-sm">
            See{' '}
            <button onClick={onRules} className="text-terracotta hover:text-terracotta-dark underline underline-offset-2 transition font-500">
              Official Rules
            </button>
            {' '}for complete details.
          </p>
        </div>
      </div>
    </section>
  );
}



/* ───────────────────── Closing Section ───────────────────── */
function ClosingSection({ onViewCar, data }: { onViewCar: () => void; data: import('@/lib/content').SiteContent['closing'] }) {
  const { ref, progress } = useParallax<HTMLElement>();
  const textRef = useReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="relative h-[70vh] min-h-[420px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ transform: `scale(1.1) translateY(${progress * 30}px)` }}
      >
        <img
          src={data.closingImage}
          alt="A car silhouette driving toward a golden sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/40 to-charcoal/70" />
      </div>

      <div ref={textRef} className="reveal relative z-10 text-center px-5">
        <h2 className="font-display text-4xl sm:text-6xl font-400 text-cream tracking-tight leading-[1.1] mb-2">
          {data.headline}
        </h2>
        <p className="font-display text-base sm:text-lg font-300 text-cream/40 italic mb-8 blur-[1px]">
          {data.subheadline}
        </p>
        <button
          onClick={onViewCar}
          className="px-8 py-4 rounded-full bg-terracotta text-cream font-500 text-lg hover:bg-terracotta-dark transition-all shadow-xl active:scale-[0.97] inline-flex items-center gap-2"
        >
          {data.ctaText}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

/* ───────────────────── Site Footer (every page) ───────────────────── */
type SiteFooterProps = {
  onAdmin: () => void;
  onRules: () => void;
  onGear: () => void;
  onAbout: () => void;
  onBeyond: () => void;
  data: import('@/lib/content').SiteContent['branding'];
  navData: import('@/lib/content').SiteContent['nav'];
};

function SiteFooter({ onAdmin, onRules, onGear, onAbout, onBeyond, data, navData }: SiteFooterProps) {
  return (
    <footer className="bg-charcoal text-cream/60 py-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <span className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cream/10 text-cream font-display text-sm font-600 tracking-tightest flex-shrink-0">
            NM
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-400">
            <button onClick={onAbout} className="hover:text-cream transition">{navData.aboutLabel}</button>
            <button onClick={onGear} className="hover:text-cream transition">{navData.moreEntriesLabel}</button>
            <button onClick={onBeyond} className="hover:text-cream transition">{navData.beyondLabel}</button>
            <button onClick={onRules} className="hover:text-cream transition">{navData.rulesLabel}</button>
            <button onClick={onAdmin} className="text-cream/30 hover:text-cream/60 transition inline-flex items-center gap-1.5" aria-label="Admin login">
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-6 text-center max-w-2xl mx-auto">
          <p className="text-xs text-cream/40 leading-relaxed mb-3">
            No purchase necessary. Free entry is available to eligible participants. See{' '}
            <button onClick={onRules} className="text-cream/60 hover:text-cream underline underline-offset-2 transition">
              Official Rules
            </button>
            {' '}for complete entry details.
          </p>
          <p className="text-xs text-cream/40">{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
