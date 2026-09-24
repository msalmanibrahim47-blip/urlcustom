'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'Create Project',
  '/settings': 'Settings',
  '/domains': 'Domains',
  '/analytics': 'Analytics'
};

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/projects/') && pathname.endsWith('/edit')) return 'Edit Project';
  if (pathname.startsWith('/projects/')) return 'Project';
  return 'White-Label Platform';
}

export function AdminShell({ email, children }: { email?: string | null; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-surface-2">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={titleFor(pathname)} onMenuClick={() => setOpen(true)} email={email} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
