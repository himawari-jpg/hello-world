'use client';

import { useState } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const socialProviders = [
  { id: 'Google', label: 'Continue with Google' },
  { id: 'Facebook', label: 'Continue with Facebook' },
  { id: 'Amazon', label: 'Continue with Amazon' },
];

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { signIn } = await import('aws-amplify/auth');
      const { nextStep } = await signIn({ username: email, password });
      switch (nextStep.signInStep) {
        case 'DONE':
          router.push('/dashboard');
          break;
        case 'CONFIRM_SIGN_UP':
          setError('Email not verified. Please check your inbox for a verification code.');
          break;
        case 'RESET_PASSWORD':
          setError('You need to reset your password.');
          break;
        case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
          setError('A new password is required. Please contact support.');
          break;
        default:
          setError(`Additional verification required: ${nextStep.signInStep}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    const { signInWithRedirect } = await import('aws-amplify/auth');
    await signInWithRedirect({ provider: provider as 'Google' | 'Facebook' | 'Amazon' });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div>
        <h2 className={`${lusitana.className} text-2xl font-bold text-gray-900`}>
          Sign in
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Sign in to your account.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="flex flex-col gap-2">
        {socialProviders.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSocialSignIn(id)}
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  );
}
