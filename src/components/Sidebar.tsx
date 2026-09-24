'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, PlusCircle, Settings, Globe, BarChart3, Layers, X } from 'lucide-react';
import { cx } from '@/lib/utils/misc';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/projects/new', label: 'Create Project', icon: PlusCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={cx(
          'fixed z-50 lg:z-0 lg:static inset-y-0 left-0 w-64 shrink-0 border-r bg-surface flex flex-col transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Layers className="h-4.5 w-4.5 text-accent-fg" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Platform</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-muted" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/projects/new');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cx(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition',
                  active ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface-2 hover:text-fg'
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t text-xs text-muted">White-Label Platform v1.0</div>
      </aside>
    </>
  );
}
