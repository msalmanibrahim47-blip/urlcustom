import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface-2">
      <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <FileQuestion className="h-7 w-7 text-accent" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-muted max-w-sm mb-6">
        The page or project you're looking for doesn't exist, isn't published, or may have been moved.
      </p>
      <Link href="/dashboard" className="rounded-xl bg-accent text-accent-fg text-sm font-medium px-4 py-2 hover:opacity-90 transition">
        Go to Dashboard
      </Link>
    </div>
  );
}
