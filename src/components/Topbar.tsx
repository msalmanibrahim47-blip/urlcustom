'use client';

import { Menu, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { signOut } from '@/lib/actions/auth';

export function Topbar({ title, onMenuClick, email }: { title: string; onMenuClick: () => void; email?: string | null }) {
  return (
    <header className="h-16 border-b bg-surface flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-muted" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {email && <span className="hidden sm:inline text-sm text-muted">{email}</span>}
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-fg rounded-lg px-2.5 py-1.5 hover:bg-surface-2 transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
