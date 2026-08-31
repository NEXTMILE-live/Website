import { useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useReveal } from '@/lib/animations';
import CinematicBackgroundVideo from '@/components/CinematicBackgroundVideo';

type WordAnimation = 'fade' | 'expand' | 'rise' | 'soft' | 'slide' | 'settle';

const ABOUT_SECTIONS: { word: string; text: string; animation: WordAnimation; wordColor: string; descColor: string }[] = [
  { word: 'OPPORTUNITY', text: 'Sometimes, getting somewhere starts with simply having the chance to go.', animation: 'fade', wordColor: '#D9683B', descColor: 'rgba(23, 24, 23, 0.75)' },
  { word: 'POSSIBILITY', text: 'One opportunity can open the door to so much more. Suddenly, what once felt out of reach feels possible.', animation: 'expand', wordColor: '#B8512A', descColor: 'rgba(23, 24, 23, 0.75)' },
  { word: 'PURPOSE', text: 'Every mile means more when there\u2019s something worth reaching for.', animation: 'rise', wordColor: '#F7F3EA', descColor: 'rgba(247, 243, 234, 0.88)' },
  { word: 'HOPE', text: 'A reason to believe that what\u2019s ahead can be better than what\u2019s behind.', animation: 'soft', wordColor: '#F7F3EA', descColor: 'rgba(247, 243, 234, 0.88)' },
  { word: 'DIRECTION', text: 'Knowing where you want to go\u2014and having a way to get there.', animation: 'slide', wordColor: '#7FC4A6', descColor: 'rgba(247, 243, 234, 0.82)' },
  { word: 'MOMENTUM', text: 'One mile leads to another. A little movement can become something bigger.', animation: 'settle', wordColor: '#5FB898', descColor: 'rgba(247, 243, 234, 0.82)' },
];

const GRADIENT_COLORS: [[number, number, number], [number, number, number]][] = [
  [[247, 243, 234], [229, 216, 197]], // cream → sand — OPPORTUNITY
  [[229, 216, 197], [224, 133, 96]],  // sand → terracotta light — POSSIBILITY
  [[224, 133, 96], [217, 104, 59]],   // terracotta light → terracotta — PURPOSE
  [[217, 104, 59], [184, 81, 42]],    // terracotta → terracotta dark — HOPE
  [[184, 81, 42], [46, 90, 80]],      // terracotta dark → teal — DIRECTION
  [[46, 90, 80], [27, 58, 50]],       // teal → dark teal — MOMENTUM (strongest)
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

function interpolateGradient(
  gradients: [[number, number, number], [number, number, number]][],
  progress: number
): string {
  const n = gradients.length - 1;
  const scaled = Math.max(0, Math.min(1, progress)) * n;
  const idx = Math.min(n - 1, Math.floor(scaled));
  const t = scaled - idx;
  const [t1, b1] = gradients[idx];
  const [t2, b2] = gradients[idx + 1];
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `linear-gradient(180deg, rgb(${lerp(t1[0], t2[0])}, ${lerp(t1[1], t2[1])}, ${lerp(t1[2], t2[2])}) 0%, rgb(${lerp(b1[0], b2[0])}, ${lerp(b1[1], b2[1])}, ${lerp(b1[2], b2[2])}) 100%)`;
}

function interpolateGradientBetween(
  g1: [[number, number, number], [number, number, number]],
  g2: [[number, number, number], [number, number, number]],
  t: number
): string {
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `linear-gradient(180deg, rgb(${lerp(g1[0][0], g2[0][0])}, ${lerp(g1[0][1], g2[0][1])}, ${lerp(g1[0][2], g2[0][2])}) 0%, rgb(${lerp(g1[1][0], g2[1][0])}, ${lerp(g1[1][1], g2[1][1])}, ${lerp(g1[1][2], g2[1][2])}) 100%)`;
}

function computeWordTransform(animation: WordAnimation, enter: number, exit: number): string {
  switch (animation) {
    case 'fade':
      return `translateY(${(1 - enter) * 30 - exit * 80}px) scale(${1 + exit * 0.25})`;
    case 'expand':
      return `scale(${0.85 + enter * 0.15 + exit * 0.25}) translateY(${-exit * 70}px)`;
    case 'rise':
      return `translateY(${(1 - enter) * 70 - exit * 70}px) scale(${1 + exit * 0.25})`;
    case 'soft':
      return `translateY(${(1 - enter) * 15 - exit * 50}px) scale(${1 + exit * 0.15})`;
    case 'slide':
      return `translateX(${(1 - enter) * 50 - exit * 50}px) scale(${1 + exit * 0.2})`;
    case 'settle':
      return `translateY(${(1 - enter) * 50 - exit * 40}px) scale(${1 + exit * 0.3})`;
  }
}

export default function AboutPage({ onBack, onEnter }: { onBack: () => void; onEnter: () => void }) {
  const bgRef = useRef<HTMLDivElement>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleBeyondRef = useRef<HTMLSpanElement>(null);
  const titleTheRef = useRef<HTMLSpanElement>(null);
  const titleDriveRef = useRef<HTMLSpanElement>(null);
  const titleAnimStart = useRef<number>(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const viewportH = window.innerHeight;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Title (BEYOND THE DRIVE) entrance animation — three words converge from different directions
      if (titleAnimStart.current === 0) titleAnimStart.current = performance.now();
      const elapsed = (performance.now() - titleAnimStart.current) / 1000;
      const titleDur = 1.6;
      const titleT = Math.max(0, Math.min(1, elapsed / titleDur));
      const titleEase = 1 - Math.pow(1 - titleT, 3);

      const beyondEl = titleBeyondRef.current;
      const theEl = titleTheRef.current;
      const driveEl = titleDriveRef.current;

      if (reducedMotion) {
        if (beyondEl) { beyondEl.style.opacity = '1'; beyondEl.style.transform = 'none'; }
        if (theEl) { theEl.style.opacity = '1'; theEl.style.transform = 'none'; }
        if (driveEl) { driveEl.style.opacity = '1'; driveEl.style.transform = 'none'; }
      } else {
        // BEYOND: slides down from top
        if (beyondEl) {
          beyondEl.style.opacity = String(titleEase);
          beyondEl.style.transform = `translateY(${(1 - titleEase) * -120}px)`;
        }
        // THE: starts small in center, scales up
        if (theEl) {
          theEl.style.opacity = String(titleEase);
          theEl.style.transform = `scale(${0.3 + titleEase * 0.85})`;
        }
        // DRIVE: slides up from bottom
        if (driveEl) {
          driveEl.style.opacity = String(titleEase);
          driveEl.style.transform = `translateY(${(1 - titleEase) * 120}px)`;
        }
      }

      // Title (BEYOND THE DRIVE) fade-out driven by scroll toward first word
      const wordContainer = wordContainerRef.current;
      if (bgRef.current && wordContainer) {
        const wordRect = wordContainer.getBoundingClientRect();
        let bgColor: string;

        if (wordRect.bottom > viewportH * 0.5) {
          const wordScrollable = wordRect.height - viewportH;
          const wordProg = wordScrollable > 0
            ? Math.max(0, Math.min(1, -wordRect.top / wordScrollable))
            : 0;
          bgColor = interpolateGradient(GRADIENT_COLORS, wordProg);
        } else {
          bgColor = interpolateGradient(GRADIENT_COLORS, 1);
        }

        bgRef.current.style.background = bgColor;
      }

      // Title (BEYOND THE DRIVE) fade-out driven by scroll toward first word
      const title = titleRef.current;
      if (title) {
        const titleRect = title.getBoundingClientRect();
        const scrolledUp = Math.max(0, -titleRect.top);
        const fadeRange = window.innerHeight * 0.6;
        const titleFade = Math.max(0, Math.min(1, scrolledUp / fadeRange));
        const titleOpacity = Math.max(0, 1 - easeInCubic(titleFade));
        title.style.opacity = String(titleOpacity);
      }

      if (reducedMotion) {
        sectionRefs.current.forEach((_, i) => {
          if (wordRefs.current[i]) {
            wordRefs.current[i]!.style.opacity = '1';
            wordRefs.current[i]!.style.transform = 'none';
          }
          if (descRefs.current[i]) {
            descRefs.current[i]!.style.opacity = '1';
            descRefs.current[i]!.style.transform = 'none';
          }
        });
        return;
      }

      // Per-section scroll-driven animation
      sectionRefs.current.forEach((section, i) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const progress = Math.max(0, Math.min(1, 1 - sectionCenter / viewportH));

        const enterPhase = easeOutCubic(Math.min(1, progress * 2));
        const exitPhase = easeInCubic(Math.max(0, Math.min(1, (progress - 0.5) * 2)));

        const wordOpacity = enterPhase * (1 - exitPhase);
        const wordTransform = computeWordTransform(ABOUT_SECTIONS[i].animation, enterPhase, exitPhase);

        const word = wordRefs.current[i];
        if (word) {
          word.style.opacity = String(wordOpacity);
          word.style.transform = wordTransform;
        }

        const desc = descRefs.current[i];
        if (desc) {
          const descOpacity = Math.max(0, (enterPhase - 0.2) / 0.8) * (1 - exitPhase);
          const descTranslate = (1 - enterPhase) * 20;
          desc.style.opacity = String(descOpacity);
          desc.style.transform = `translateY(${descTranslate}px)`;
        }
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    // Continuous loop for the title entrance animation
    const titleAnimLoop = () => {
      const elapsed = (performance.now() - titleAnimStart.current) / 1000;
      update();
      if (elapsed < 1.8) {
        rafId = requestAnimationFrame(titleAnimLoop);
      }
    };

    titleAnimStart.current = performance.now();
    rafId = requestAnimationFrame(titleAnimLoop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Fixed evolving background */}
      <div
        ref={bgRef}
        className="fixed inset-0"
        style={{ background: 'linear-gradient(180deg, rgb(247, 243, 234) 0%, rgb(229, 216, 197) 100%)' }}
      />

      {/* Content above background */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-md border-b border-charcoal/10" style={{ backgroundColor: 'rgba(247, 243, 234, 0.85)' }}>
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
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

        {/* Title — BEYOND THE DRIVE, with cinematic background video */}
        <div ref={titleRef} className="relative h-[55vh] min-h-[360px] w-full flex items-center justify-center overflow-hidden" style={{ opacity: 0.55, willChange: 'opacity' }}>
          <CinematicBackgroundVideo />
          <h1
            className="relative z-10 font-block text-center w-full leading-[0.9]"
            style={{
              fontSize: 'clamp(2rem, 10vh, 5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            <span
              ref={titleBeyondRef}
              className="block"
              style={{
                background: 'linear-gradient(180deg, #E5D8C5 0%, #E0C9AE 50%, #E08560 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                willChange: 'transform, opacity',
              }}
            >BEYOND</span>
            <span
              ref={titleTheRef}
              className="block origin-center"
              style={{
                background: 'linear-gradient(180deg, #E08560 0%, #D9683B 50%, #B8512A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                willChange: 'transform, opacity',
              }}
            >THE</span>
            <span
              ref={titleDriveRef}
              className="block origin-center"
              style={{
                background: 'linear-gradient(180deg, #B8512A 0%, #4A6B5F 50%, #24483F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                willChange: 'transform, opacity',
              }}
            >DRIVE</span>
          </h1>
        </div>

        {/* Six cinematic word sections */}
        <div ref={wordContainerRef}>
          {ABOUT_SECTIONS.map((section, i) => (
            <section
              key={section.word}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className="min-h-[42vh] flex items-center justify-center px-5"
            >
              <div className="text-center max-w-xl">
                <h2
                  ref={(el) => { wordRefs.current[i] = el; }}
                  className="font-display text-5xl sm:text-7xl lg:text-8xl font-600 tracking-tightest leading-[1.05]"
                  style={{ opacity: 0, willChange: 'transform, opacity', color: section.wordColor }}
                >
                  {section.word}
                </h2>
                <p
                  ref={(el) => { descRefs.current[i] = el; }}
                  className="mt-8 font-400 text-lg sm:text-xl leading-relaxed max-w-md mx-auto"
                  style={{ opacity: 0, willChange: 'transform, opacity', color: section.descColor }}
                >
                  {section.text}
                </p>
              </div>
            </section>
          ))}
        </div>

        {/* CTA before footer */}
        <div className="flex items-center justify-center px-5 py-20">
          <div className="text-center">
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-terracotta text-cream font-500 text-base sm:text-lg hover:bg-terracotta-dark transition-all shadow-xl active:scale-[0.97]"
            >
              Enter the Giveaway
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
