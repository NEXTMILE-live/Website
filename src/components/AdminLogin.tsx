import { useState } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = 'NextMile2026!';

export default function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('nextmile_admin', 'true');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-cream/40 hover:text-cream/70 transition mb-8 text-sm font-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </button>

        <div className={`bg-cream rounded-2xl shadow-2xl p-8 transition-transform ${shake ? 'animate-shake' : ''}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-charcoal text-cream flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-500 text-charcoal tracking-tight">Admin Login</h1>
              <p className="text-xs text-charcoal/40 font-400">NEXT MILE Dashboard</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-terracotta/8 border border-terracotta/20 text-sm text-terracotta/80 font-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-500 uppercase tracking-wider text-charcoal/40 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 pr-11 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-transparent transition"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-charcoal text-cream font-500 text-base hover:bg-charcoal/85 transition active:scale-[0.99]"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-cream/25 text-xs font-400 mt-6 leading-relaxed">
          Authorized access only.
        </p>
      </div>
    </div>
  );
}
