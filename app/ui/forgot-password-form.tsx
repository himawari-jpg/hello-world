'use client';

import { useState } from 'react';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Step = 'request' | 'confirm' | 'done';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { resetPassword } = await import('aws-amplify/auth');
      const { nextStep } = await resetPassword({ username });
      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setStep('confirm');
      } else if (nextStep.resetPasswordStep === 'DONE') {
        setStep('done');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { confirmResetPassword } = await import('aws-amplify/auth');
      await confirmResetPassword({ username, confirmationCode: code, newPassword });
      setStep('done');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div>
          <h2 className={`${lusitana.className} text-2xl font-bold text-gray-900`}>
            Password reset complete
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your password has been successfully reset.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div>
          <h2 className={`${lusitana.className} text-2xl font-bold text-gray-900`}>
            Set new password
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the code sent to your email and your new password.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <form onSubmit={handleConfirmResetPassword} className="flex flex-col gap-4">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg font-mono tracking-widest text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="000000"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div>
        <h2 className={`${lusitana.className} text-2xl font-bold text-gray-900`}>
          Forgot your password?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
