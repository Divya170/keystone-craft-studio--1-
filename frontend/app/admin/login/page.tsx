'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const { login, token } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) router.replace('/admin');
  }, [token, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const input = 'min-h-12 px-4 rounded-[14px] border-[1.5px] border-edge bg-field text-base';
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm bg-cream rounded-[28px] p-8 flex flex-col gap-6">
        <div>
          <strong className="font-display font-normal text-2xl">Keystone · Admin</strong>
          <p className="mt-1 text-sm text-muted">Sign in to manage products, workshops and messages.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="px-4 py-3 rounded-xl bg-err-bg text-err-text text-sm font-semibold">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold">Email</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          </div>
          <button type="submit" disabled={submitting} className="min-h-12 rounded-full bg-clay text-cream font-semibold border-0 cursor-pointer hover:bg-clay-hover disabled:opacity-70">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <a href="/" className="text-sm">← Back to the website</a>
      </div>
    </div>
  );
}
