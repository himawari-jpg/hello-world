'use client';

import { useState, useEffect } from 'react';
import { lusitana } from '@/app/ui/fonts';

type Step = 'view' | 'edit' | 'confirm' | 'change-password';

export default function ProfileForm() {
  const [step, setStep] = useState<Step>('view');
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [pendingEmailKey, setPendingEmailKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attrs = await fetchUserAttributes();
        setAttributes(attrs as Record<string, string>);
        setName(attrs.name ?? '');
        setEmail(attrs.email ?? '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { updateUserAttributes } = await import('aws-amplify/auth');
      const result = await updateUserAttributes({
        userAttributes: { name, email },
      });

      // emailの変更には確認コードが必要な場合がある
      const emailResult = result.email;
      if (emailResult?.nextStep.updateAttributeStep === 'CONFIRM_ATTRIBUTE_WITH_CODE') {
        setPendingEmailKey('email');
        setStep('confirm');
      } else {
        setSuccess('Profile updated successfully.');
        setStep('view');
        // 最新の属性を再取得
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attrs = await fetchUserAttributes();
        setAttributes(attrs as Record<string, string>);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { confirmUserAttribute, fetchUserAttributes } = await import('aws-amplify/auth');
      await confirmUserAttribute({
        userAttributeKey: pendingEmailKey as 'email',
        confirmationCode,
      });
      setSuccess('Email verified and updated successfully.');
      setStep('view');
      const attrs = await fetchUserAttributes();
      setAttributes(attrs as Record<string, string>);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const { sendUserAttributeVerificationCode } = await import('aws-amplify/auth');
      await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
      setSuccess('Verification code resent.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading && step === 'view' && Object.keys(attributes).length === 0) {
    return <p className="text-sm text-gray-500">Loading profile…</p>;
  }

  if (step === 'change-password') {
    return (
      <ChangePasswordSection
        onBack={() => setStep('view')}
        onSuccess={(msg) => { setSuccess(msg); setStep('view'); }}
      />
    );
  }

  // 確認コード入力画面
  if (step === 'confirm') {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div>
          <h2 className={`${lusitana.className} text-xl font-bold text-gray-900`}>
            Verify your email
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A verification code was sent to <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              maxLength={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-lg font-mono tracking-widest text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResendCode}
          className="text-center text-sm text-blue-600 hover:text-blue-500"
        >
          Resend code
        </button>
      </div>
    );
  }

  // 編集画面
  if (step === 'edit') {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h2 className={`${lusitana.className} text-xl font-bold text-gray-900`}>Edit Profile</h2>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Your name"
            />
          </div>

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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-gray-400">Changing your email requires verification.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep('view'); setError(''); }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // プロフィール表示画面
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h2 className={`${lusitana.className} text-xl font-bold text-gray-900`}>Profile</h2>

      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">{success}</div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name</span>
          <span className="text-sm text-gray-900">{attributes.name ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</span>
          <span className="text-sm text-gray-900">{attributes.email ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email verified</span>
          <span className="text-sm text-gray-900">{attributes.email_verified === 'true' ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => { setStep('edit'); setSuccess(''); }}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Edit profile
        </button>
        <button
          onClick={() => { setStep('change-password'); setSuccess(''); setError(''); }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Change password
        </button>
      </div>
    </div>
  );
}

function ChangePasswordSection({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { updatePassword } = await import('aws-amplify/auth');
      await updatePassword({ oldPassword, newPassword });
      onSuccess('Password updated successfully.');
      onBack();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h2 className={`${lusitana.className} text-xl font-bold text-gray-900`}>Change Password</h2>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
        <div>
          <label htmlFor="oldPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
            Current password
          </label>
          <input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="••••••••"
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
          <label htmlFor="confirmNewPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm new password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="••••••••"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}
