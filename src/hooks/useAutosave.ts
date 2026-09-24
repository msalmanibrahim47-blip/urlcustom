'use client';

import { useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Calls `save(value)` `delayMs` after `value` last changed. Skips the very
 * first render (so mounting the editor doesn't immediately "save" the data
 * it just loaded).
 */
export function useAutosave<T>(value: T, save: (value: T) => Promise<{ ok: boolean; error?: string }>, delayMs = 900) {
  const [state, setState] = useState<SaveState>('idle');
  const isFirstRun = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setState('saving');
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const res = await save(value);
      setState(res.ok ? 'saved' : 'error');
    }, delayMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  return state;
}
