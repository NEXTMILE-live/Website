import { useState, useEffect, useCallback } from 'react';
import {
  LogOut, Users, Trash2, Search, Download, Lock, LayoutGrid,
  Car, CheckCircle2, XCircle, AlertCircle, RefreshCw, Ticket,
  ChevronDown, Eye, ChevronRight, Loader2, WifiOff,
} from 'lucide-react';
import {
  loadAllEntries, deleteEntry, deletePaidEntry,
  loadDonations as fetchDonationsApi, deleteDonation, updateDonationStatus,
} from '@/lib/api';
import AdminLogin from '@/components/AdminLogin';
import ContentManager from '@/components/ContentManager';

/* ─── Types ─── */

type CombinedEntry = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  story?: string | null;
  created_at: string;
  entry_type: 'free' | 'paid';
  entry_count: number;
  product_name: string | null;
  source: string;
};

type CarDonation = {
  id: string;
  year: string;
  make: string;
  model: string;
  mileage: string;
  clean_title: boolean;
  runs_and_drives: boolean;
  no_accidents: boolean;
  up_to_date_maintenance: boolean;
  notes: string | null;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  city: string | null;
  state: string | null;
  status: string;
  created_at: string;
};

type Tab = 'entries' | 'donations' | 'content';
type EntryFilter = 'all' | 'free' | 'paid';
type DonationFilter = 'all' | 'pending' | 'reviewed' | 'accepted' | 'declined';

/* ─── Fetch with retry ─── */

async function fetchWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error('Unreachable');
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError'))
    return 'Could not connect to the database. Please check your internet connection and try again.';
  return msg;
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */

export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('nextmile_admin') === 'true'
  );
  const [tab, setTab] = useState<Tab>('entries');

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} onBack={onExit} />;
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('nextmile_admin');
    onExit();
  };

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Header */}
      <header className="bg-charcoal text-cream sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-cream/50" />
            <span className="font-display text-lg font-500 tracking-tightest">NEXT MILE</span>
            <span className="text-cream/30 text-sm hidden sm:inline">/ Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="text-cream/60 hover:text-cream transition text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> View Site
            </button>
            <button onClick={handleSignOut} className="inline-flex items-center gap-2 text-cream/60 hover:text-cream transition text-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { id: 'entries' as Tab, label: 'Entries', icon: <Users className="w-4 h-4" /> },
            { id: 'donations' as Tab, label: 'Car Donations', icon: <Car className="w-4 h-4" /> },
            { id: 'content' as Tab, label: 'Design & Content', icon: <LayoutGrid className="w-4 h-4" /> },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-500 transition ${
                tab === t.id ? 'bg-charcoal text-cream shadow-md' : 'bg-white text-charcoal/60 hover:bg-sand/40'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {tab === 'entries' && <EntriesTab />}
        {tab === 'donations' && <DonationsTab />}
        {tab === 'content' && <ContentManager onExit={() => setTab('entries')} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ENTRIES TAB
   ═══════════════════════════════════════════ */

function EntriesTab() {
  const [entries, setEntries] = useState<CombinedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<EntryFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWithRetry(loadAllEntries);
      setEntries(data ?? []);
    } catch (err) {
      setError(friendlyError(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, type: 'free' | 'paid') => {
    if (!confirm('Delete this entry permanently?')) return;
    try {
      type === 'paid' ? await deletePaidEntry(id) : await deleteEntry(id);
      setEntries((p) => p.filter((e) => e.id !== id));
    } catch {
      alert('Failed to delete entry.');
    }
  };

  const q = search.toLowerCase();
  const filtered = entries
    .filter((e) => filter === 'all' || e.entry_type === filter)
    .filter((e) =>
      !q ||
      e.full_name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.city ?? '').toLowerCase().includes(q) ||
      (e.state ?? '').toLowerCase().includes(q) ||
      (e.product_name ?? '').toLowerCase().includes(q)
    );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = entries.filter((e) => new Date(e.created_at) >= today).length;
  const freeCount = entries.filter((e) => e.entry_type === 'free').length;
  const paidCount = entries.filter((e) => e.entry_type === 'paid').length;
  const totalTickets = entries.reduce((s, e) => s + (e.entry_count || 1), 0);
  const uniqueEmails = new Set(entries.map((e) => e.email.toLowerCase())).size;

  const exportCsv = () => {
    const hdr = 'Name,Email,Phone,City,State,Type,Entries,Product,Story,Entered\n';
    const rows = filtered.map((e) =>
      [e.full_name, e.email, e.phone ?? '', e.city ?? '', e.state ?? '', e.entry_type,
       e.entry_count, e.product_name ?? '', (e.story ?? '').replace(/"/g, '""'),
       new Date(e.created_at).toLocaleString()
      ].map((v) => `"${v}"`).join(',')
    ).join('\n');
    dl(hdr + rows, `entries-${isoDate()}.csv`);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Stat label="Unique People" value={uniqueEmails} />
        <Stat label="Total Entries" value={totalTickets} />
        <Stat label="Free" value={freeCount} />
        <Stat label="Paid" value={paidCount} />
        <Stat label="Today" value={todayCount} />
        <Stat label="Records" value={entries.length} />
      </div>

      {/* Toolbar */}
      <Bar
        search={search} onSearch={setSearch} placeholder="Search by name, email, city..."
        filterVal={filter} onFilter={setFilter}
        filterOpts={[
          { value: 'all', label: 'All Types' },
          { value: 'free', label: 'Free Only' },
          { value: 'paid', label: 'Paid Only' },
        ]}
        onRefresh={load} loading={loading} onExport={exportCsv}
      />

      {/* Body */}
      {error ? <Err msg={error} onRetry={load} /> : loading ? <Spin /> : filtered.length === 0 ? (
        <Empty icon={<Users className="w-12 h-12" />} msg={search || filter !== 'all' ? 'No entries match your filters.' : 'No entries yet.'} />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sand/40 text-left text-charcoal/50 font-500 uppercase tracking-wider text-xs">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-center">Entries</th>
                    <th className="px-4 py-3 hidden md:table-cell">Location</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Entered</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5">
                  {filtered.map((e) => (
                    <tr
                      key={`${e.entry_type}-${e.id}`}
                      className="hover:bg-sand/20 transition cursor-pointer"
                      onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    >
                      <td className="px-4 py-3 font-500 text-charcoal">
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-3.5 h-3.5 text-charcoal/30 transition-transform ${expandedId === e.id ? 'rotate-90' : ''}`} />
                          <div>
                            {e.full_name}
                            {e.product_name && <span className="block text-xs text-charcoal/40 mt-0.5">{e.product_name}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal/70 hidden sm:table-cell">{e.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-500 ${
                          e.entry_type === 'paid' ? 'bg-terracotta/10 text-terracotta' : 'bg-teal/10 text-teal'
                        }`}>
                          {e.entry_type === 'paid' ? <Ticket className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {e.entry_type === 'paid' ? 'Paid' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-500 text-charcoal">{e.entry_count}</td>
                      <td className="px-4 py-3 text-charcoal/60 hidden md:table-cell">
                        {e.city || e.state ? `${e.city ?? ''}${e.city && e.state ? ', ' : ''}${e.state ?? ''}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-charcoal/50 hidden lg:table-cell">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(e.id, e.entry_type)}
                          className="p-2 rounded-lg text-charcoal/30 hover:text-terracotta hover:bg-terracotta/5 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expanded detail */}
          {expandedId && (() => {
            const e = filtered.find((x) => x.id === expandedId);
            if (!e) return null;
            return (
              <div className="mt-4 bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-lg font-500 text-charcoal">{e.full_name}</h4>
                  <button onClick={() => setExpandedId(null)} className="text-charcoal/40 hover:text-charcoal text-sm">Close</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                  <DRow label="Email" value={e.email} />
                  <DRow label="Phone" value={e.phone ?? '—'} />
                  <DRow label="City" value={e.city ?? '—'} />
                  <DRow label="State" value={e.state ?? '—'} />
                  <DRow label="Type" value={e.entry_type === 'paid' ? 'Paid' : 'Free'} />
                  <DRow label="Entries" value={String(e.entry_count)} />
                  {e.product_name && <DRow label="Product" value={e.product_name} />}
                  <DRow label="Date" value={new Date(e.created_at).toLocaleString()} />
                </div>
                {e.story && (
                  <div className="mt-4 pt-4 border-t border-charcoal/10">
                    <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">Story</p>
                    <p className="text-sm text-charcoal/70 leading-relaxed whitespace-pre-wrap">{e.story}</p>
                  </div>
                )}
              </div>
            );
          })()}

          <p className="text-center text-charcoal/30 text-xs mt-8">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'} &middot; {filtered.reduce((s, x) => s + x.entry_count, 0)} total entries
          </p>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   DONATIONS TAB
   ═══════════════════════════════════════════ */

function DonationsTab() {
  const [donations, setDonations] = useState<CarDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DonationFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWithRetry(fetchDonationsApi);
      setDonations(data ?? []);
    } catch (err) {
      setError(friendlyError(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this donation permanently?')) return;
    try {
      await deleteDonation(id);
      setDonations((p) => p.filter((d) => d.id !== id));
    } catch {
      alert('Failed to delete donation.');
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateDonationStatus(id, status);
      setDonations((p) => p.map((d) => (d.id === id ? { ...d, status } : d)));
    } catch {
      alert('Failed to update status.');
    }
  };

  const q = search.toLowerCase();
  const filtered = donations
    .filter((d) => statusFilter === 'all' || d.status === statusFilter)
    .filter((d) =>
      !q ||
      `${d.year} ${d.make} ${d.model}`.toLowerCase().includes(q) ||
      d.donor_name.toLowerCase().includes(q) ||
      d.donor_email.toLowerCase().includes(q) ||
      (d.city ?? '').toLowerCase().includes(q) ||
      (d.state ?? '').toLowerCase().includes(q)
    );

  const pendingCount = donations.filter((d) => d.status === 'pending').length;
  const acceptedCount = donations.filter((d) => d.status === 'accepted').length;
  const reviewedCount = donations.filter((d) => d.status === 'reviewed').length;

  const exportCsv = () => {
    const hdr = 'Year,Make,Model,Mileage,Clean Title,Runs,No Accidents,Maintenance,Donor,Email,Phone,City,State,Status,Notes,Submitted\n';
    const rows = filtered.map((d) =>
      [d.year, d.make, d.model, d.mileage, d.clean_title ? 'Yes' : 'No', d.runs_and_drives ? 'Yes' : 'No',
       d.no_accidents ? 'Yes' : 'No', d.up_to_date_maintenance ? 'Yes' : 'No', d.donor_name, d.donor_email,
       d.donor_phone ?? '', d.city ?? '', d.state ?? '', d.status, (d.notes ?? '').replace(/"/g, '""'),
       new Date(d.created_at).toLocaleString()
      ].map((v) => `"${v}"`).join(',')
    ).join('\n');
    dl(hdr + rows, `car-donations-${isoDate()}.csv`);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Offers" value={donations.length} />
        <Stat label="Pending" value={pendingCount} />
        <Stat label="Reviewed" value={reviewedCount} />
        <Stat label="Accepted" value={acceptedCount} />
      </div>

      <Bar
        search={search} onSearch={setSearch} placeholder="Search by vehicle, donor, email..."
        filterVal={statusFilter} onFilter={setStatusFilter}
        filterOpts={[
          { value: 'all', label: 'All Statuses' },
          { value: 'pending', label: 'Pending' },
          { value: 'reviewed', label: 'Reviewed' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'declined', label: 'Declined' },
        ]}
        onRefresh={load} loading={loading} onExport={exportCsv}
      />

      {error ? <Err msg={error} onRetry={load} /> : loading ? <Spin /> : filtered.length === 0 ? (
        <Empty icon={<Car className="w-12 h-12" />} msg={search || statusFilter !== 'all' ? 'No donations match your filters.' : 'No car donations yet.'} />
      ) : (
        <>
          <div className="space-y-4">
            {filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Summary row */}
                <div
                  className="p-5 sm:p-6 cursor-pointer hover:bg-sand/10 transition"
                  onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <ChevronRight className={`w-4 h-4 text-charcoal/30 transition-transform ${expandedId === d.id ? 'rotate-90' : ''}`} />
                    <h4 className="font-500 text-charcoal text-lg">{d.year} {d.make} {d.model}</h4>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-charcoal/50 mt-1 ml-7">
                    {d.donor_name} &middot; {d.mileage} miles &middot; {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Expanded details */}
                {expandedId === d.id && (
                  <div className="border-t border-charcoal/8 p-5 sm:p-6 bg-sand/10">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Chk label="Clean Title" ok={d.clean_title} />
                      <Chk label="Runs & Drives" ok={d.runs_and_drives} />
                      <Chk label="No Accidents" ok={d.no_accidents} />
                      <Chk label="Maintenance Current" ok={d.up_to_date_maintenance} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm mb-4">
                      <DRow label="Donor" value={d.donor_name} />
                      <DRow label="Email" value={d.donor_email} />
                      <DRow label="Phone" value={d.donor_phone ?? '—'} />
                      <DRow label="Location" value={d.city || d.state ? `${d.city ?? ''}${d.city && d.state ? ', ' : ''}${d.state ?? ''}` : '—'} />
                      <DRow label="Submitted" value={new Date(d.created_at).toLocaleString()} />
                    </div>
                    {d.notes && (
                      <div className="mb-4 p-3 rounded-xl bg-white border border-charcoal/8">
                        <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-1">Notes</p>
                        <p className="text-sm text-charcoal/70 italic whitespace-pre-wrap">{d.notes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-3 border-t border-charcoal/8">
                      <select
                        value={d.status}
                        onChange={(ev) => { ev.stopPropagation(); handleStatus(d.id, ev.target.value); }}
                        onClick={(ev) => ev.stopPropagation()}
                        className="rounded-lg border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/20 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                      </select>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); handleDelete(d.id); }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-charcoal/40 hover:text-terracotta hover:bg-terracotta/5 transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-charcoal/30 text-xs mt-8">
            {filtered.length} {filtered.length === 1 ? 'donation' : 'donations'}
          </p>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   SHARED UI
   ═══════════════════════════════════════════ */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-1">{label}</p>
      <p className="font-display text-2xl sm:text-3xl font-500 text-charcoal">{value}</p>
    </div>
  );
}

function Bar<T extends string>({ search, onSearch, placeholder, filterVal, onFilter, filterOpts, onRefresh, loading, onExport }: {
  search: string; onSearch: (v: string) => void; placeholder: string;
  filterVal: T; onFilter: (v: T) => void; filterOpts: { value: T; label: string }[];
  onRefresh: () => void; loading: boolean; onExport: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-charcoal/15 bg-white pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition"
        />
      </div>
      <div className="relative">
        <select
          value={filterVal}
          onChange={(e) => onFilter(e.target.value as T)}
          className="appearance-none rounded-full border border-charcoal/15 bg-white pl-4 pr-9 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/20 cursor-pointer"
        >
          {filterOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 pointer-events-none" />
      </div>
      <div className="flex items-center gap-2 sm:ml-auto">
        <button onClick={onRefresh} disabled={loading} className="inline-flex items-center px-4 py-2.5 rounded-full border border-charcoal/15 bg-white text-charcoal/60 hover:bg-sand/40 transition disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={onExport} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-charcoal text-cream text-sm font-500 hover:bg-charcoal/85 transition">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { pending: 'bg-sand text-charcoal/60', reviewed: 'bg-skyblue/10 text-skyblue', accepted: 'bg-teal/10 text-teal', declined: 'bg-terracotta/10 text-terracotta' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-500 capitalize ${s[status] || s.pending}`}>{status}</span>;
}

function Chk({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${ok ? 'bg-teal/5 text-teal' : 'bg-charcoal/5 text-charcoal/40'}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-charcoal/40 text-xs font-500 uppercase tracking-wider">{label}</span>
      <p className="text-charcoal/70 mt-0.5">{value}</p>
    </div>
  );
}

function Err({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  const net = msg.includes('connect') || msg.includes('internet');
  return (
    <div className="text-center py-16">
      {net ? <WifiOff className="w-12 h-12 text-terracotta/40 mx-auto mb-4" /> : <AlertCircle className="w-12 h-12 text-terracotta/40 mx-auto mb-4" />}
      <p className="text-charcoal/60 mb-2">{net ? 'Connection Problem' : 'Something went wrong'}</p>
      <p className="text-charcoal/40 text-sm mb-6 max-w-md mx-auto">{msg}</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-cream text-sm font-500 hover:bg-charcoal/85 transition">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );
}

function Spin() {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-charcoal/20" />
      <p className="text-charcoal/40 text-sm">Loading...</p>
    </div>
  );
}

function Empty({ icon, msg }: { icon: React.ReactNode; msg: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-charcoal/15 mx-auto mb-4 flex justify-center">{icon}</div>
      <p className="text-charcoal/40">{msg}</p>
    </div>
  );
}

function dl(content: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function isoDate() {
  return new Date().toISOString().split('T')[0];
}
