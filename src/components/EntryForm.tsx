import { useState, useEffect, useRef, useCallback } from 'react';
import { submitDailyEntry, checkEligibility } from '@/lib/api';
import type { SubmitResult, EligibilityResult } from '@/lib/api';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, Clock, Trophy } from 'lucide-react';

type Phase = 'form' | 'submitting' | 'success' | 'cooldown' | 'error';

export default function EntryForm({
  onClose,
  inline = false,
  onGear,
}: {
  onClose: () => void;
  inline?: boolean;
  onGear?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [nextEligible, setNextEligible] = useState<Date | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setPhase('submitting');
    setErrorMsg('');

    const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();

    try {
      const result: SubmitResult = await submitDailyEntry({
        full_name: fullName,
        email: form.email,
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      });

      if (result.success) {
        setNextEligible(new Date(result.next_eligible));
        setTotalEntries(result.total_entries);
        setPhase('success');
      } else {
        setNextEligible(new Date(result.next_eligible));
        setTotalEntries(result.total_entries);
        setPhase('cooldown');
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setPhase('error');
    }
  };

  /* ── Cooldown screen ── */
  if (phase === 'cooldown') {
    return (
      <CooldownScreen
        nextEligible={nextEligible!}
        totalEntries={totalEntries}
        onClose={onClose}
        onGear={onGear}
      />
    );
  }

  /* ── Success screen ── */
  if (phase === 'success') {
    return (
      <div className="text-center py-8 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal/10 mb-5">
          <CheckCircle2 className="w-8 h-8 text-teal" strokeWidth={2} />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-500 text-charcoal mb-2">You're In.</h3>
        <p className="text-charcoal/60 mb-2 max-w-md mx-auto leading-relaxed">
          Your free daily entry has been recorded.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal text-sm font-500 mb-6">
          <Trophy className="w-4 h-4" />
          {totalEntries} {totalEntries === 1 ? 'TOTAL ENTRY' : 'TOTAL ENTRIES'}
        </div>

        {/* Countdown to next entry */}
        {nextEligible && (
          <div className="mb-6 p-5 rounded-2xl bg-sand/40 border border-charcoal/8">
            <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">
              Next free entry available in
            </p>
            <CountdownTimer target={nextEligible} />
          </div>
        )}

        {onGear && (
          <div className="mb-6 p-5 rounded-2xl bg-terracotta/5 border border-terracotta/15 text-left">
            <h4 className="font-display text-lg font-500 text-charcoal mb-1">
              Want extra entries?
            </h4>
            <p className="text-sm text-charcoal/50 mb-3">
              Browse gear and earn additional entries right now.
            </p>
            <button
              onClick={onGear}
              className="inline-flex items-center gap-2 text-sm font-500 text-terracotta hover:text-terracotta-dark transition group"
            >
              Explore entry opportunities
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        <p className="text-xs text-charcoal/40 leading-relaxed max-w-sm mx-auto mb-5">
          No purchase necessary. A purchase will not increase your odds of winning.
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-full bg-charcoal text-cream font-500 hover:bg-charcoal/80 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  /* ── Entry form ── */
  return (
    <form onSubmit={handleSubmit} className={inline ? '' : 'p-6 sm:p-8'}>
      {!inline && (
        <h3 className="font-display text-2xl font-500 text-charcoal mb-1">Your Free Daily Entry</h3>
      )}
      {!inline && (
        <p className="text-charcoal/50 text-sm mb-6">
          Enter once every 24 hours. No purchase necessary.
        </p>
      )}

      {phase === 'error' && (
        <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-terracotta/10 border border-terracotta/30">
          <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-charcoal/80">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setPhase('form')}
              className="text-sm text-terracotta hover:text-terracotta-dark font-500 mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" required value={form.first_name} onChange={(v) => update('first_name', v)} />
        <Field label="Last Name" required value={form.last_name} onChange={(v) => update('last_name', v)} />
      </div>

      <div className="mt-4">
        <Field label="Email" required type="email" value={form.email} onChange={(v) => update('email', v)} />
      </div>

      <div className="mt-4">
        <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="City" value={form.city} onChange={(v) => update('city', v)} />
        <Field label="State" value={form.state} onChange={(v) => update('state', v)} />
      </div>

      <label className="flex items-start gap-3 mt-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-terracotta flex-shrink-0"
        />
        <span className="text-sm text-charcoal/60 leading-relaxed">
          I agree to the Official Rules and acknowledge the eligibility requirements.
        </span>
      </label>

      <button
        type="submit"
        disabled={phase === 'submitting' || !agreed}
        className="mt-6 w-full py-4 rounded-full bg-terracotta text-cream font-500 text-lg hover:bg-terracotta-dark active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {phase === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Enter Now'
        )}
      </button>

      <p className="text-xs text-charcoal/40 text-center mt-4 leading-relaxed">
        No purchase necessary. Donating does not provide additional entries or improve your odds of winning.
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   COOLDOWN SCREEN
   ═══════════════════════════════════════════════ */

function CooldownScreen({
  nextEligible,
  totalEntries,
  onClose,
  onGear,
}: {
  nextEligible: Date;
  totalEntries: number;
  onClose: () => void;
  onGear?: () => void;
}) {
  return (
    <div className="text-center py-8 px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand mb-5">
        <Clock className="w-8 h-8 text-charcoal/40" strokeWidth={2} />
      </div>
      <h3 className="font-display text-2xl sm:text-3xl font-500 text-charcoal mb-2">
        You've Already Entered Today.
      </h3>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal text-sm font-500 mb-6">
        <Trophy className="w-4 h-4" />
        {totalEntries} {totalEntries === 1 ? 'TOTAL ENTRY' : 'TOTAL ENTRIES'}
      </div>

      <div className="mb-6 p-5 rounded-2xl bg-sand/40 border border-charcoal/8">
        <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">
          Your next free entry will be available in
        </p>
        <CountdownTimer target={nextEligible} />
      </div>

      {onGear && (
        <div className="mb-6 p-5 rounded-2xl bg-terracotta/5 border border-terracotta/15 text-left">
          <h4 className="font-display text-lg font-500 text-charcoal mb-1">
            Want extra entries now?
          </h4>
          <p className="text-sm text-charcoal/50 mb-3">
            Browse gear and earn additional entries while you wait.
          </p>
          <button
            onClick={onGear}
            className="inline-flex items-center gap-2 text-sm font-500 text-terracotta hover:text-terracotta-dark transition group"
          >
            Explore entry opportunities
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-full bg-charcoal text-cream font-500 hover:bg-charcoal/80 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════════════════════════ */

function CountdownTimer({ target }: { target: Date }) {
  const [remaining, setRemaining] = useState(() => calcRemaining(target));
  const rafRef = useRef(0);

  const tick = useCallback(() => {
    setRemaining(calcRemaining(target));
    rafRef.current = requestAnimationFrame(tick);
  }, [target]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (remaining.total <= 0) {
    return (
      <p className="font-display text-2xl font-500 text-teal">
        You can enter now!
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <TimeUnit value={remaining.hours} label="hrs" />
      <span className="text-charcoal/20 font-display text-2xl">:</span>
      <TimeUnit value={remaining.minutes} label="min" />
      <span className="text-charcoal/20 font-display text-2xl">:</span>
      <TimeUnit value={remaining.seconds} label="sec" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="font-display text-3xl sm:text-4xl font-500 text-charcoal tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <p className="text-xs text-charcoal/40 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function calcRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    total: diff,
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

/* ═══════════════════════════════════════════════
   FIELD
   ═══════════════════════════════════════════════ */

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta/40 transition"
      />
    </div>
  );
}
