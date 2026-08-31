import { ArrowLeft, FileText } from 'lucide-react';

type RuleSection = {
  number: string;
  title: string;
  body: React.ReactNode;
};

const PLACEHOLDER = '[To be provided]';

const SECTIONS: RuleSection[] = [
  {
    number: '1',
    title: 'Sponsor',
    body: (
      <p>
        This giveaway is sponsored by <strong>{PLACEHOLDER}</strong> located at{' '}
        <strong>{PLACEHOLDER}</strong> (the "Sponsor").
      </p>
    ),
  },
  {
    number: '2',
    title: 'Eligibility',
    body: (
      <p>
        The NEXT MILE giveaway is open to <strong>{PLACEHOLDER}</strong> who are{' '}
        <strong>{PLACEHOLDER}</strong> years of age or older at the time of entry.
        Geographic restrictions: <strong>{PLACEHOLDER}</strong>. Employees,
        contractors, and immediate family members of the Sponsor are not eligible.
        Void where prohibited by law.
      </p>
    ),
  },
  {
    number: '3',
    title: 'Entry Period',
    body: (
      <p>
        The giveaway begins on <strong>{PLACEHOLDER}</strong> and ends on{' '}
        <strong>{PLACEHOLDER}</strong> (the "Entry Period"). All entries must be
        received before the deadline to be eligible.
      </p>
    ),
  },
  {
    number: '4',
    title: 'How to Enter',
    body: (
      <>
        <p className="mb-3">
          To enter, <strong>{PLACEHOLDER}</strong>. Every eligible participant
          receives one (1) free entry per giveaway through the designated free
          entry method.
        </p>
        <p>
          Maximum number of entries permitted: <strong>{PLACEHOLDER}</strong>.
        </p>
      </>
    ),
  },
  {
    number: '5',
    title: 'No Purchase Necessary',
    body: (
      <p>
        No purchase, payment, or donation is required to enter or win. A purchase
        or donation will not increase your chances of winning. If additional
        entries are offered, a free alternate method of entry is available:{' '}
        <strong>{PLACEHOLDER}</strong>.
      </p>
    ),
  },
  {
    number: '6',
    title: 'Prize Description & Value',
    body: (
      <p>
        The prize is <strong>{PLACEHOLDER}</strong>. Approximate retail value:{' '}
        <strong>{PLACEHOLDER}</strong>. The winner is responsible for any
        applicable taxes, title, registration, insurance, and transportation
        costs. The Sponsor makes no warranties, express or implied, regarding the
        prize.
      </p>
    ),
  },
  {
    number: '7',
    title: 'Number of Winners & Odds',
    body: (
      <p>
        Number of winners: <strong>{PLACEHOLDER}</strong>. The odds of winning
        depend on the number of eligible entries received. Approximate odds:{' '}
        <strong>{PLACEHOLDER}</strong>.
      </p>
    ),
  },
  {
    number: '8',
    title: 'Winner Selection & Notification',
    body: (
      <p>
        Winner(s) will be selected by <strong>{PLACEHOLDER}</strong> from all
        eligible entries received. The drawing will be conducted within a
        reasonable time after the Entry Period closes. The winner will be
        notified by <strong>{PLACEHOLDER}</strong> using the contact information
        provided at entry.
      </p>
    ),
  },
  {
    number: '9',
    title: 'Claim Period',
    body: (
      <p>
        The winner must respond to the notification within{' '}
        <strong>{PLACEHOLDER}</strong> days and complete all required
        documentation, including signing an affidavit of eligibility and
        liability release. Failure to respond within the time limit may result in
        forfeiture of the prize and selection of an alternate winner.
      </p>
    ),
  },
  {
    number: '10',
    title: 'Privacy & Data Use',
    body: (
      <p>
        Personal information collected through the entry form is used solely to
        administer the giveaway and contact the winner.{' '}
        <strong>{PLACEHOLDER}</strong>. The Sponsor will not sell or share your
        information with third parties for marketing purposes.
      </p>
    ),
  },
  {
    number: '11',
    title: 'State-Specific Restrictions',
    body: (
      <p>
        <strong>{PLACEHOLDER}</strong>. Void where prohibited.
      </p>
    ),
  },
  {
    number: '12',
    title: 'General Conditions',
    body: (
      <p>
        The Sponsor reserves the right to cancel, suspend, or modify the giveaway
        if any fraud, technical failure, or other factor beyond its control
        impairs the integrity of the giveaway. By entering, participants agree to
        release and hold harmless the Sponsor from any liability arising from
        participation or acceptance of the prize.
      </p>
    ),
  },
];

export default function OfficialRulesPage({ onBack, lastUpdated }: { onBack: () => void; lastUpdated: string }) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-charcoal/10">
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

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal/5 text-charcoal/50 text-xs font-500 uppercase tracking-wider mb-5">
            <FileText className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-500 text-charcoal tracking-tightest mb-3">
            Official Rules
          </h1>
          <p className="text-charcoal/50 text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Key disclosure banner */}
        <div className="mb-10 p-5 rounded-2xl bg-terracotta/8 border border-terracotta/20">
          <p className="text-sm text-charcoal/75 leading-relaxed text-center">
            <strong className="text-terracotta">NO PURCHASE NECESSARY.</strong>{' '}
            A purchase will not increase your odds of winning. Every eligible
            participant receives one free entry per giveaway through the
            designated free entry method.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.number}>
              <h3 className="font-display text-lg font-500 text-charcoal mb-2">
                {section.number}. {section.title}
              </h3>
              <div className="text-charcoal/70 text-sm leading-relaxed">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="border-t border-charcoal/10 mt-12 pt-8 text-center">
          <p className="text-xs text-charcoal/40 leading-relaxed max-w-xl mx-auto">
            These Official Rules are provided for informational purposes and may
            be updated. Sections marked [To be provided] will be completed before
            the giveaway opens. If changes are made, the updated date above will
            reflect the most recent revision.
          </p>
        </div>
      </div>
    </div>
  );
}
