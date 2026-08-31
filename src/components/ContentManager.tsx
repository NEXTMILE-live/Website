import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save, Loader2, Plus, Trash2, RotateCcw, Image as ImageIcon,
  Sparkles, Type, Car, Heart, HelpCircle, Flag, TrendingUp,
  Compass, Upload, Menu, ShoppingBag, FileText, AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { SiteContent, DEFAULT_CONTENT, CHARITY_ICONS, ProductEntry } from '@/lib/content';
import { loadAllContent, saveAllContent, uploadFile } from '@/lib/api';

/* ─── Types ─── */

type Props = { onExit: () => void };

type Tab =
  | 'nav' | 'hero' | 'moreThanDriving' | 'howItWorks' | 'giveaway'
  | 'car' | 'causes' | 'donateCar' | 'moreEntries' | 'nextMile'
  | 'closing' | 'rules' | 'branding';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'nav',             label: 'Navigation',         icon: <Menu className="w-4 h-4" /> },
  { id: 'hero',            label: 'Hero',               icon: <Sparkles className="w-4 h-4" /> },
  { id: 'moreThanDriving', label: 'More Than Driving',  icon: <Compass className="w-4 h-4" /> },
  { id: 'howItWorks',      label: 'How It Works',       icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'giveaway',        label: 'The Car Section',    icon: <Car className="w-4 h-4" /> },
  { id: 'car',             label: 'Car Details',        icon: <Car className="w-4 h-4" /> },
  { id: 'causes',          label: 'Charities',          icon: <Heart className="w-4 h-4" /> },
  { id: 'donateCar',       label: 'Donate Car',         icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'moreEntries',     label: 'More Entries',       icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'nextMile',        label: 'Next Mile Means More', icon: <Flag className="w-4 h-4" /> },
  { id: 'closing',         label: 'Closing',            icon: <Type className="w-4 h-4" /> },
  { id: 'rules',           label: 'Official Rules',     icon: <FileText className="w-4 h-4" /> },
  { id: 'branding',        label: 'Branding & Footer',  icon: <Type className="w-4 h-4" /> },
];

/* ─── Shared style tokens ─── */

const INPUT = 'w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition';
const INPUT_SM = 'w-full rounded-lg border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/20';
const CARD = 'border border-charcoal/10 rounded-xl p-4 space-y-3 bg-sand/20';

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function ContentManager({ onExit }: Props) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  const loadContent = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await loadAllContent();
        if (data.length > 0) {
          const merged: SiteContent = { ...DEFAULT_CONTENT };
          for (const row of data) {
            const key = row.key as keyof SiteContent;
            if (key in merged) merged[key] = { ...merged[key], ...row.value } as never;
          }
          setContent(merged);
        }
        setLoading(false);
        return;
      } catch (err) {
        lastErr = err;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
      }
    }
    setLoadError(lastErr instanceof Error ? lastErr.message : 'Failed to load content');
    setLoading(false);
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  const saveContent = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const entries = Object.entries(content).map(([key, value]) => ({
        key,
        value: value as Record<string, unknown>,
      }));
      await saveAllContent(entries);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save: ' + (err instanceof Error ? err.message : String(err)));
    }
    setSaving(false);
  };

  const update = useCallback(<K extends keyof SiteContent>(section: K, u: Partial<SiteContent[K]>) => {
    setContent((prev) => ({ ...prev, [section]: { ...prev[section], ...u } }));
  }, []);

  /* ─── Loading / Error states ─── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal/30" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-12 h-12 text-terracotta/40 mx-auto mb-4" />
        <p className="text-charcoal/60 font-400 mb-2">Failed to load content</p>
        <p className="text-charcoal/40 text-sm mb-6 max-w-md mx-auto">{loadError}</p>
        <button
          onClick={loadContent}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-cream text-sm font-500 hover:bg-charcoal/85 transition"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  /* ─── Render ─── */

  return (
    <div>
      {/* Header + Save */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl font-500 text-charcoal">Content Editor</h2>
          <p className="text-sm text-charcoal/50 mt-0.5">Edit your website text and images. Changes appear after saving.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-teal font-500 flex items-center gap-1.5 animate-fade-in">
              <Save className="w-4 h-4" /> Saved!
            </span>
          )}
          {error && <span className="text-sm text-terracotta font-400 max-w-xs truncate">{error}</span>}
          <button
            onClick={saveContent}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terracotta text-cream text-sm font-500 hover:bg-terracotta-dark transition disabled:opacity-40 active:scale-[0.97]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-500 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-charcoal text-cream'
                    : 'bg-white text-charcoal/60 hover:bg-sand/40 border border-charcoal/8'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {activeTab === 'nav' && <NavEditor d={content.nav} o={(u) => update('nav', u)} />}
          {activeTab === 'hero' && <HeroEditor d={content.hero} o={(u) => update('hero', u)} />}
          {activeTab === 'moreThanDriving' && <MoreThanDrivingEditor d={content.moreThanDriving} o={(u) => update('moreThanDriving', u)} />}
          {activeTab === 'howItWorks' && <HowItWorksEditor d={content.howItWorks} o={(u) => update('howItWorks', u)} />}
          {activeTab === 'giveaway' && <GiveawayEditor d={content.giveaway} o={(u) => update('giveaway', u)} />}
          {activeTab === 'car' && <CarEditor d={content.car} o={(u) => update('car', u)} />}
          {activeTab === 'causes' && <CausesEditor d={content.causes} o={(u) => update('causes', u)} />}
          {activeTab === 'donateCar' && <DonateCarEditor d={content.donateCar} o={(u) => update('donateCar', u)} />}
          {activeTab === 'moreEntries' && <MoreEntriesEditor d={content.moreEntries} o={(u) => update('moreEntries', u)} />}
          {activeTab === 'nextMile' && <NextMileEditor d={content.nextMile} o={(u) => update('nextMile', u)} />}
          {activeTab === 'closing' && <ClosingEditor d={content.closing} o={(u) => update('closing', u)} />}
          {activeTab === 'rules' && <RulesEditor d={content.rules} o={(u) => update('rules', u)} />}
          {activeTab === 'branding' && <BrandingEditor d={content.branding} o={(u) => update('branding', u)} />}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setContent(DEFAULT_CONTENT)}
          className="inline-flex items-center gap-2 text-sm text-charcoal/40 hover:text-charcoal/70 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults (unsaved)
        </button>
        <button onClick={onExit} className="text-sm text-charcoal/50 hover:text-charcoal transition">
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SHARED FIELD COMPONENTS
   ═══════════════════════════════════════════════ */

function TextField({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          rows={4} className={`${INPUT} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={INPUT} />
      )}
    </div>
  );
}

function ImageField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadFile(file)); } catch { /* user can paste URL */ }
    setUploading(false);
    if (ref.current) ref.current.value = '';
  };

  return (
    <div>
      <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">{label}</label>
      <div className="flex gap-4">
        {value && (
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-charcoal/10 flex-shrink-0 bg-sand/30">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://..." className={`${INPUT} text-sm`} />
          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-teal-dark transition disabled:opacity-40">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading…' : 'Upload from device'}
            </button>
            <span className="text-xs text-charcoal/30 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> or paste a URL
            </span>
          </div>
          <input ref={ref} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-500 text-charcoal mb-6">{children}</h3>;
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark transition">
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function RemBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-2 rounded-lg text-charcoal/30 hover:text-terracotta hover:bg-terracotta/5 transition">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function ListHeader({ label, onAdd, addLabel }: { label: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-500 text-charcoal/60 uppercase tracking-wider">{label}</h4>
      <AddBtn onClick={onAdd} label={addLabel} />
    </div>
  );
}

function StringListField({ label, value, onChange, placeholder, addLabel }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string;
}) {
  return (
    <div>
      <ListHeader label={label} onAdd={() => onChange([...value, ''])} addLabel={addLabel || 'Add'} />
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={item}
              onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n); }}
              placeholder={placeholder || 'Item…'} className={`flex-1 ${INPUT_SM}`} />
            <RemBtn onClick={() => onChange(value.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECTION EDITORS
   ═══════════════════════════════════════════════ */

/* ─── Navigation ─── */

function NavEditor({ d, o }: { d: SiteContent['nav']; o: (u: Partial<SiteContent['nav']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Navigation Labels</SectionTitle>
      <TextField label="About Link" value={d.aboutLabel} onChange={(v) => o({ aboutLabel: v })} />
      <TextField label="How It Works Link" value={d.howItWorksLabel} onChange={(v) => o({ howItWorksLabel: v })} />
      <TextField label="More Entries Link" value={d.moreEntriesLabel} onChange={(v) => o({ moreEntriesLabel: v })} />
      <TextField label="Beyond the Giveaway Link" value={d.beyondLabel} onChange={(v) => o({ beyondLabel: v })} />
      <TextField label="Official Rules Link" value={d.rulesLabel} onChange={(v) => o({ rulesLabel: v })} />
      <TextField label="Enter Button Text" value={d.enterButton} onChange={(v) => o({ enterButton: v })} />
    </div>
  );
}

/* ─── Hero ─── */

function HeroEditor({ d, o }: { d: SiteContent['hero']; o: (u: Partial<SiteContent['hero']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Hero Section</SectionTitle>
      <ImageField label="Background Image" value={d.heroImage} onChange={(v) => o({ heroImage: v })} />
      <TextField label="Headline" value={d.headline} onChange={(v) => o({ headline: v })} />
      <TextField label="Subheadline" value={d.subheadline} onChange={(v) => o({ subheadline: v })} />
      <TextField label="Enter Button Text" value={d.ctaText} onChange={(v) => o({ ctaText: v })} />
      <TextField label="View Car Button Text" value={d.viewCarText} onChange={(v) => o({ viewCarText: v })} />
      <TextField label="Small Note" value={d.note} onChange={(v) => o({ note: v })} />
    </div>
  );
}

/* ─── More Than Driving ─── */

function MoreThanDrivingEditor({ d, o }: { d: SiteContent['moreThanDriving']; o: (u: Partial<SiteContent['moreThanDriving']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>More Than Driving</SectionTitle>
      <TextField label="Static Prefix (stays while words cycle)" value={d.staticPrefix} onChange={(v) => o({ staticPrefix: v })} />
      <StringListField label="Cycling Words" value={d.cyclingWords} onChange={(v) => o({ cyclingWords: v })} addLabel="Add Word" />
      <TextField label="Closing Line" value={d.closingLine} onChange={(v) => o({ closingLine: v })} />
      <TextField label="View Button Text" value={d.viewCarText} onChange={(v) => o({ viewCarText: v })} />
      <ImageField label="Background Image" value={d.backgroundImage} onChange={(v) => o({ backgroundImage: v })} />
    </div>
  );
}

/* ─── How It Works ─── */

function HowItWorksEditor({ d, o }: { d: SiteContent['howItWorks']; o: (u: Partial<SiteContent['howItWorks']>) => void }) {
  const setStep = (i: number, f: 'title' | 'text', v: string) => {
    const steps = [...d.steps]; steps[i] = { ...steps[i], [f]: v }; o({ steps });
  };
  return (
    <div className="space-y-5">
      <SectionTitle>How It Works</SectionTitle>
      <TextField label="Heading" value={d.heading} onChange={(v) => o({ heading: v })} />
      <div>
        <ListHeader label="Steps"
          onAdd={() => o({ steps: [...d.steps, { num: String(d.steps.length + 1).padStart(2, '0'), title: '', text: '' }] })}
          addLabel="Add Step" />
        <div className="space-y-4">
          {d.steps.map((s, i) => (
            <div key={i} className={CARD}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-500 text-charcoal/40">Step {s.num}</span>
                <RemBtn onClick={() => o({ steps: d.steps.filter((_, idx) => idx !== i) })} />
              </div>
              <input type="text" value={s.title} onChange={(e) => setStep(i, 'title', e.target.value)}
                placeholder="Step title" className={INPUT_SM} />
              <textarea value={s.text} onChange={(e) => setStep(i, 'text', e.target.value)}
                placeholder="Step description" rows={2} className={`${INPUT_SM} resize-none`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Giveaway ─── */

function GiveawayEditor({ d, o }: { d: SiteContent['giveaway']; o: (u: Partial<SiteContent['giveaway']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>The Car Section</SectionTitle>
      <ImageField label="Vehicle Image" value={d.vehicleImage} onChange={(v) => o({ vehicleImage: v })} />
      <TextField label="Heading" value={d.heading} onChange={(v) => o({ heading: v })} />
      <TextField label="Subheading" value={d.subheading} onChange={(v) => o({ subheading: v })} />
      <TextField label="View Car Button Text" value={d.viewCarText} onChange={(v) => o({ viewCarText: v })} />
    </div>
  );
}

/* ─── Car Details ─── */

function CarEditor({ d, o }: { d: SiteContent['car']; o: (u: Partial<SiteContent['car']>) => void }) {
  const setSpec = (i: number, f: 'label' | 'value', v: string) => {
    const specs = [...d.specs]; specs[i] = { ...specs[i], [f]: v }; o({ specs });
  };
  const setFeat = (i: number, v: string) => {
    const features = [...d.features]; features[i] = v; o({ features });
  };
  const setGal = (i: number, f: 'src' | 'label', v: string) => {
    const gallery = [...d.gallery]; gallery[i] = { ...gallery[i], [f]: v }; o({ gallery });
  };

  return (
    <div className="space-y-6">
      <SectionTitle>Car Details</SectionTitle>
      <TextField label="Car Title" value={d.title} onChange={(v) => o({ title: v })} />
      <TextField label="Subtitle" value={d.subtitle} onChange={(v) => o({ subtitle: v })} />

      {/* Specs */}
      <div>
        <ListHeader label="Specifications" onAdd={() => o({ specs: [...d.specs, { label: '', value: '' }] })} addLabel="Add" />
        <div className="space-y-2">
          {d.specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={s.label} onChange={(e) => setSpec(i, 'label', e.target.value)}
                placeholder="Label" className={`flex-1 ${INPUT_SM}`} />
              <input type="text" value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)}
                placeholder="Value" className={`flex-1 ${INPUT_SM}`} />
              <RemBtn onClick={() => o({ specs: d.specs.filter((_, idx) => idx !== i) })} />
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <ListHeader label="Features" onAdd={() => o({ features: [...d.features, ''] })} addLabel="Add" />
        <div className="flex flex-wrap gap-2">
          {d.features.map((f, i) => (
            <div key={i} className="inline-flex items-center gap-1.5 bg-sand/50 rounded-full pl-3 pr-1 py-1.5">
              <input type="text" value={f} onChange={(e) => setFeat(i, e.target.value)}
                className="w-32 bg-transparent text-sm text-charcoal focus:outline-none" />
              <button onClick={() => o({ features: d.features.filter((_, idx) => idx !== i) })}
                className="p-0.5 rounded-full text-charcoal/30 hover:text-terracotta transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <ListHeader label="Photo Gallery" onAdd={() => o({ gallery: [...d.gallery, { src: '', label: '' }] })} addLabel="Add" />
        <div className="space-y-3">
          {d.gallery.map((g, i) => (
            <div key={i} className="flex gap-3 items-start">
              {g.src && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-charcoal/10 flex-shrink-0 bg-sand/30">
                  <img src={g.src} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input type="text" value={g.src} onChange={(e) => setGal(i, 'src', e.target.value)}
                  placeholder="Image URL" className={INPUT_SM} />
                <input type="text" value={g.label} onChange={(e) => setGal(i, 'label', e.target.value)}
                  placeholder="Label (e.g. Exterior)" className={INPUT_SM} />
              </div>
              <div className="mt-1"><RemBtn onClick={() => o({ gallery: d.gallery.filter((_, idx) => idx !== i) })} /></div>
            </div>
          ))}
        </div>
      </div>

      <TextField label="Enter Button Text" value={d.enterCtaText} onChange={(v) => o({ enterCtaText: v })} />
    </div>
  );
}

/* ─── Causes / Charities ─── */

function CausesEditor({ d, o }: { d: SiteContent['causes']; o: (u: Partial<SiteContent['causes']>) => void }) {
  const setCh = (i: number, f: keyof SiteContent['causes']['charities'][0], v: string) => {
    const charities = [...d.charities]; charities[i] = { ...charities[i], [f]: v }; o({ charities });
  };
  const addCh = () => o({ charities: [...d.charities, { id: `charity-${Date.now()}`, name: '', category: '', url: '', description: '', iconKey: 'Heart' }] });

  return (
    <div className="space-y-5">
      <SectionTitle>Charities Section</SectionTitle>
      <TextField label="Badge Text" value={d.badgeText} onChange={(v) => o({ badgeText: v })} />
      <TextField label="Heading" value={d.heading} onChange={(v) => o({ heading: v })} />
      <TextField label="Subheading" value={d.subheading} onChange={(v) => o({ subheading: v })} multiline />
      <TextField label="Charity Badge" value={d.charityBadge} onChange={(v) => o({ charityBadge: v })} />
      <TextField label="Charity Heading" value={d.charityHeading} onChange={(v) => o({ charityHeading: v })} />
      <TextField label="Charity Description" value={d.charityDescription} onChange={(v) => o({ charityDescription: v })} multiline />
      <TextField label="Charity Button Text" value={d.charityCtaText} onChange={(v) => o({ charityCtaText: v })} />

      <div>
        <ListHeader label="Charities" onAdd={addCh} addLabel="Add Charity" />
        <div className="space-y-4">
          {d.charities.map((c, i) => (
            <div key={c.id} className={CARD}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-500 text-charcoal/40">Charity {i + 1}</span>
                <RemBtn onClick={() => o({ charities: d.charities.filter((_, idx) => idx !== i) })} />
              </div>
              <input type="text" value={c.name} onChange={(e) => setCh(i, 'name', e.target.value)}
                placeholder="Charity name" className={INPUT_SM} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={c.category} onChange={(e) => setCh(i, 'category', e.target.value)}
                  placeholder="Category" className={INPUT_SM} />
                <select value={c.iconKey} onChange={(e) => setCh(i, 'iconKey', e.target.value)} className={INPUT_SM}>
                  {Object.keys(CHARITY_ICONS).map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <input type="text" value={c.url} onChange={(e) => setCh(i, 'url', e.target.value)}
                placeholder="Donation URL" className={INPUT_SM} />
              <textarea value={c.description} onChange={(e) => setCh(i, 'description', e.target.value)}
                placeholder="Short description" rows={2} className={`${INPUT_SM} resize-none`} />
            </div>
          ))}
        </div>
      </div>

      <TextField label="Donation Disclaimer" value={d.donationDisclaimer} onChange={(v) => o({ donationDisclaimer: v })} multiline />
    </div>
  );
}

/* ─── Donate Car ─── */

function DonateCarEditor({ d, o }: { d: SiteContent['donateCar']; o: (u: Partial<SiteContent['donateCar']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Donate Car Section</SectionTitle>
      <TextField label="Badge Text" value={d.badgeText} onChange={(v) => o({ badgeText: v })} />
      <TextField label="Heading" value={d.heading} onChange={(v) => o({ heading: v })} />
      <TextField label="Description" value={d.description} onChange={(v) => o({ description: v })} multiline />
      <TextField label="Button Text" value={d.ctaText} onChange={(v) => o({ ctaText: v })} />
      <TextField label="Submit Button Text" value={d.submitButtonText} onChange={(v) => o({ submitButtonText: v })} />
      <TextField label="Success Title" value={d.successTitle} onChange={(v) => o({ successTitle: v })} />
      <TextField label="Success Message" value={d.successMessage} onChange={(v) => o({ successMessage: v })} multiline />

      <StringListField label="Requirements" value={d.requirements}
        onChange={(v) => o({ requirements: v })} placeholder="Requirement" addLabel="Add" />
    </div>
  );
}

/* ─── More Entries ─── */

function MoreEntriesEditor({ d, o }: { d: SiteContent['moreEntries']; o: (u: Partial<SiteContent['moreEntries']>) => void }) {
  const setProd = (i: number, f: keyof ProductEntry, v: string) => {
    const products = [...d.products]; products[i] = { ...products[i], [f]: v }; o({ products });
  };
  const addProd = () => o({ products: [...d.products, { id: `product-${Date.now()}`, name: '', price: '', entries: '', imageUrl: '', productUrl: '' }] });

  return (
    <div className="space-y-5">
      <SectionTitle>More Entries Page</SectionTitle>
      <TextField label="Heading" value={d.heading} onChange={(v) => o({ heading: v })} />
      <TextField label="Subheading" value={d.subheading} onChange={(v) => o({ subheading: v })} />
      <TextField label="Description" value={d.description} onChange={(v) => o({ description: v })} />
      <TextField label="Free Entry Note" value={d.freeEntryNote} onChange={(v) => o({ freeEntryNote: v })} />
      <TextField label="Legal Disclosure" value={d.disclosure} onChange={(v) => o({ disclosure: v })} multiline />

      <div>
        <ListHeader label="Products" onAdd={addProd} addLabel="Add Product" />
        <div className="space-y-4">
          {d.products.map((p, i) => (
            <div key={p.id} className={CARD}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-500 text-charcoal/40">Product {i + 1}</span>
                <RemBtn onClick={() => o({ products: d.products.filter((_, idx) => idx !== i) })} />
              </div>
              <ImageField label="Product Image" value={p.imageUrl} onChange={(v) => setProd(i, 'imageUrl', v)} />
              <input type="text" value={p.name} onChange={(e) => setProd(i, 'name', e.target.value)}
                placeholder="Product name (e.g. POWER BANK)" className={INPUT_SM} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={p.price} onChange={(e) => setProd(i, 'price', e.target.value)}
                  placeholder="Price (e.g. $54.91)" className={INPUT_SM} />
                <input type="text" value={p.entries} onChange={(e) => setProd(i, 'entries', e.target.value)}
                  placeholder="Entries (e.g. 549 ENTRIES)" className={INPUT_SM} />
              </div>
              <input type="text" value={p.productUrl} onChange={(e) => setProd(i, 'productUrl', e.target.value)}
                placeholder="Product link URL (optional)" className={INPUT_SM} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Next Mile ─── */

function NextMileEditor({ d, o }: { d: SiteContent['nextMile']; o: (u: Partial<SiteContent['nextMile']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Next Mile Means More</SectionTitle>
      <TextField label="Intro Text" value={d.introText} onChange={(v) => o({ introText: v })} />
      <StringListField label="Reveal Words" value={d.words}
        onChange={(v) => o({ words: v })} placeholder="A word or phrase" addLabel="Add Word" />
    </div>
  );
}

/* ─── Closing ─── */

function ClosingEditor({ d, o }: { d: SiteContent['closing']; o: (u: Partial<SiteContent['closing']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Closing Section</SectionTitle>
      <ImageField label="Background Image" value={d.closingImage} onChange={(v) => o({ closingImage: v })} />
      <TextField label="Headline" value={d.headline} onChange={(v) => o({ headline: v })} />
      <TextField label="Subheadline" value={d.subheadline} onChange={(v) => o({ subheadline: v })} />
      <TextField label="Button Text" value={d.ctaText} onChange={(v) => o({ ctaText: v })} />
      <TextField label="Brand Name" value={d.brandName} onChange={(v) => o({ brandName: v })} />
      <TextField label="Brand Tagline" value={d.brandTagline} onChange={(v) => o({ brandTagline: v })} />
    </div>
  );
}

/* ─── Rules ─── */

function RulesEditor({ d, o }: { d: SiteContent['rules']; o: (u: Partial<SiteContent['rules']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Official Rules Page</SectionTitle>
      <TextField label="Last Updated Date" value={d.lastUpdated} onChange={(v) => o({ lastUpdated: v })} />
      <p className="text-xs text-charcoal/40 leading-relaxed">
        The Official Rules page uses placeholder text (shown as [To be provided]) for legal
        details that still need to be filled in. Update this date when you publish revised rules.
      </p>
    </div>
  );
}

/* ─── Branding ─── */

function BrandingEditor({ d, o }: { d: SiteContent['branding']; o: (u: Partial<SiteContent['branding']>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Branding &amp; Footer</SectionTitle>
      <ImageField label="Logo Image (shown in navigation)" value={d.logoUrl} onChange={(v) => o({ logoUrl: v })} />
      <TextField label="Brand Name" value={d.brandName} onChange={(v) => o({ brandName: v })} />
      <TextField label="Brand Tagline" value={d.brandTagline} onChange={(v) => o({ brandTagline: v })} />
      <TextField label="Footer Disclaimer" value={d.footerNote} onChange={(v) => o({ footerNote: v })} multiline />
      <TextField label="Copyright Text" value={d.copyright} onChange={(v) => o({ copyright: v })} />
    </div>
  );
}
