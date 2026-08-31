import { useState } from 'react';
import {
  Car,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { submitDonation } from '@/lib/api';
import type { SiteContent } from '@/lib/content';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function DonateCarPage({
  onBack,
  data,
}: {
  onBack: () => void;
  data: SiteContent['donateCar'];
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    year: '', make: '', model: '', mileage: '',
    donor_name: '', donor_email: '', donor_phone: '',
    city: '', state: '', notes: '',
  });
  const [checks, setChecks] = useState({
    clean_title: false,
    runs_and_drives: false,
    no_accidents: false,
    up_to_date_maintenance: false,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const allChecksPassed = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecksPassed) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitDonation({
        year: form.year.trim(),
        make: form.make.trim(),
        model: form.model.trim(),
        mileage: form.mileage.trim(),
        clean_title: checks.clean_title,
        runs_and_drives: checks.runs_and_drives,
        no_accidents: checks.no_accidents,
        up_to_date_maintenance: checks.up_to_date_maintenance,
        notes: form.notes.trim() || null,
        donor_name: form.donor_name.trim(),
        donor_email: form.donor_email.trim().toLowerCase(),
        donor_phone: form.donor_phone.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
      });
    } catch {
      setErrorMsg('Something went wrong. Please try again in a moment.');
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
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

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {status === 'success' ? (
          <div className="text-center max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal/10 mb-6">
              <CheckCircle2 className="w-8 h-8 text-teal" strokeWidth={2} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-500 text-charcoal tracking-tightest mb-3">
              {data.successTitle}
            </h1>
            <p className="text-charcoal/60 leading-relaxed mb-8">
              {data.successMessage}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-full bg-charcoal text-cream font-500 text-sm hover:bg-charcoal/80 transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-500 uppercase tracking-wider mb-5">
                <Car className="w-3.5 h-3.5" fill="currentColor" />
                {data.badgeText}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-500 text-charcoal tracking-tightest mb-3">
                {data.heading}
              </h1>
              <p className="text-charcoal/60 leading-relaxed max-w-xl mx-auto">
                {data.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="mb-8 p-5 rounded-2xl bg-sand/40 border border-charcoal/8">
              <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-3">
                Requirements
              </p>
              <ul className="space-y-2">
                {data.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-charcoal/70">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <div className="bg-white/60 rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8">
              <CarDonationForm
                form={form}
                checks={checks}
                status={status}
                errorMsg={errorMsg}
                allChecksPassed={allChecksPassed}
                onUpdate={update}
                onCheckChange={(key) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }))}
                onSubmit={handleSubmit}
                submitLabel={data.submitButtonText}
              />
            </div>

            <div className="mt-6 flex items-start gap-3">
              <Info className="w-4 h-4 text-charcoal/30 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-charcoal/45 leading-relaxed">
                This is a donation — not a giveaway entry. Submitting your vehicle does not give you any
                extra entries or improve your odds of winning.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CarDonationForm({
  form,
  checks,
  status,
  errorMsg,
  allChecksPassed,
  onUpdate,
  onCheckChange,
  onSubmit,
  submitLabel,
}: {
  form: { year: string; make: string; model: string; mileage: string; donor_name: string; donor_email: string; donor_phone: string; city: string; state: string; notes: string };
  checks: { clean_title: boolean; runs_and_drives: boolean; no_accidents: boolean; up_to_date_maintenance: boolean };
  status: Status;
  errorMsg: string;
  allChecksPassed: boolean;
  onUpdate: (key: 'year' | 'make' | 'model' | 'mileage' | 'donor_name' | 'donor_email' | 'donor_phone' | 'city' | 'state' | 'notes', value: string) => void;
  onCheckChange: (key: 'clean_title' | 'runs_and_drives' | 'no_accidents' | 'up_to_date_maintenance') => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit}>
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-terracotta/10 border border-terracotta/30">
          <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
          <p className="text-sm text-charcoal/80">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <FormField label="Year" required value={form.year} onChange={(v) => onUpdate('year', v)} placeholder="2018" />
        <FormField label="Make" required value={form.make} onChange={(v) => onUpdate('make', v)} placeholder="Toyota" />
        <FormField label="Model" required value={form.model} onChange={(v) => onUpdate('model', v)} placeholder="Camry" />
        <FormField label="Mileage" required value={form.mileage} onChange={(v) => onUpdate('mileage', v)} placeholder="45,000" />
      </div>

      <div className="space-y-2 mb-5">
        <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">Please confirm all that apply:</p>
        {([
          ['clean_title', 'I have a clean title for this vehicle'],
          ['runs_and_drives', 'The vehicle runs and drives'],
          ['no_accidents', 'No accidents have been reported'],
          ['up_to_date_maintenance', 'Maintenance is up to date (oil changes, brakes, etc.)'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checks[key]}
              onChange={() => onCheckChange(key)}
              className="mt-0.5 w-4 h-4 accent-teal flex-shrink-0"
            />
            <span className="text-sm text-charcoal/70 group-hover:text-charcoal/90 transition">{label}</span>
          </label>
        ))}
      </div>

      <div className="border-t border-charcoal/8 pt-4 mb-4">
        <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-3">Your Contact Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Full Name" required value={form.donor_name} onChange={(v) => onUpdate('donor_name', v)} placeholder="Jane Doe" />
          <FormField label="Email" required type="email" value={form.donor_email} onChange={(v) => onUpdate('donor_email', v)} placeholder="jane@example.com" />
          <FormField label="Phone" type="tel" value={form.donor_phone} onChange={(v) => onUpdate('donor_phone', v)} placeholder="(555) 123-4567" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City" value={form.city} onChange={(v) => onUpdate('city', v)} placeholder="Austin" />
            <FormField label="State" value={form.state} onChange={(v) => onUpdate('state', v)} placeholder="TX" />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">
          Anything else? <span className="text-charcoal/30 normal-case">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          rows={3}
          placeholder="Tell us about the condition, recent repairs, or anything else..."
          className="w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-transparent transition resize-none"
        />
      </div>

      {!allChecksPassed && (
        <p className="text-sm text-charcoal/40 text-center mb-4">
          Please confirm all four requirements above to submit your vehicle.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting' || !allChecksPassed}
        className="w-full py-3.5 rounded-full bg-teal text-cream font-500 text-lg hover:bg-teal-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-transparent transition"
      />
    </div>
  );
}
