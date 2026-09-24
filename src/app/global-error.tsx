'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#f4f4f6' }}>
          <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            An unexpected error occurred. This has been logged — please try again.
          </p>
          <button onClick={() => reset()} className="rounded-xl bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
