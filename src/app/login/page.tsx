import { signIn } from '@/lib/actions/auth';
import { Layers } from 'lucide-react';

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-sm anim-slide">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Layers className="h-5 w-5 text-accent-fg" />
          </div>
          <span className="font-semibold text-lg tracking-tight">White-Label Platform</span>
        </div>

        <div className="bg-surface border rounded-2xl shadow-soft p-6">
          <h1 className="text-lg font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-muted mb-6">Access your admin dashboard.</p>

          {searchParams.error && (
            <div className="mb-4 text-sm rounded-xl border border-danger/30 bg-danger/10 text-danger px-3 py-2">
              {searchParams.error}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <input type="hidden" name="next" value={searchParams.next ?? '/dashboard'} />
            <div>
              <label className="text-sm font-medium mb-1.5 block" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-accent text-accent-fg text-sm font-medium py-2.5 hover:opacity-90 transition"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-xs text-muted text-center mt-6">
          Accounts are created in your Supabase project (Authentication → Users), or via
          <code className="mx-1 px-1 py-0.5 rounded bg-surface-2 border">supabase.auth.signUp</code>
          during setup — see the README.
        </p>
      </div>
    </div>
  );
}
