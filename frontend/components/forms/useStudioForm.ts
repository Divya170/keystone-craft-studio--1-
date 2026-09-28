'use client';

import { useCallback, useState } from 'react';
import { ApiError } from '@/lib/api';

export type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * The comp's form behaviour: errors appear on submit, then re-validate live
 * as the user types; submit focuses the first invalid field (`${prefix}${key}`).
 * The API re-validates; its 400 field errors are merged back in.
 */
export function useStudioForm<V extends Record<string, string>, R>(initial: V, validate: (v: V) => Record<string, string>, prefix: string) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<R | null>(null);
  const [failMsg, setFailMsg] = useState('');

  const focusFirst = (keys: string[]) => setTimeout(() => document.getElementById(prefix + keys[0])?.focus(), 0);

  const set = useCallback(
    (key: keyof V, val: string) => {
      setValues((prev) => {
        const next = { ...prev, [key]: val };
        setErrors((errs) => {
          if (!errs[key as string]) return errs;
          const ne = validate(next);
          const copy = { ...errs };
          if (ne[key as string]) copy[key as string] = ne[key as string];
          else delete copy[key as string];
          return copy;
        });
        return next;
      });
    },
    [validate],
  );

  const submit = async (e: React.FormEvent, send: (v: V) => Promise<R>) => {
    e.preventDefault();
    const errs = validate(values);
    const keys = Object.keys(errs);
    if (keys.length) {
      setErrors(errs);
      setStatus('idle');
      focusFirst(keys);
      return;
    }
    setErrors({});
    setStatus('sending');
    setFailMsg('');
    try {
      setResult(await send(values));
      setStatus('sent');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.body?.errors) {
        setErrors(err.body.errors);
        setStatus('idle');
        focusFirst(Object.keys(err.body.errors));
      } else {
        setFailMsg(err instanceof ApiError && err.status < 500 ? err.message : '');
        setStatus('error');
      }
    }
  };

  const reset = (next: Partial<V> = {}) => {
    setValues({ ...initial, ...next });
    setErrors({});
    setStatus('idle');
    setResult(null);
  };

  return { values, setValues, errors, status, result, failMsg, set, submit, reset };
}
