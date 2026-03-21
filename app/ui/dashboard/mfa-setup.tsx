'use client';

import { useState, useEffect } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { QRCodeSVG } from 'qrcode.react';

type MfaStep = 'status' | 'setup' | 'verify';

export default function MfaSetup() {
  const [mfaStep, setMfaStep] = useState<MfaStep>('status');
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupUri, setSetupUri] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMfaStatus() {
      try {
        const { fetchMFAPreference } = await import('aws-amplify/auth');
        const { enabled } = await fetchMFAPreference();
        setIsEnabled(enabled?.includes('TOTP') ?? false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMfaStatus();
  }, []);

  const handleStartSetup = async () => {
    setError('');
    setLoading(true);
    try {
      const { setUpTOTP } = await import('aws-amplify/auth');
      const totpSetupDetails = await setUpTOTP();
      const uri = totpSetupDetails.getSetupUri('Acme Dashboard').toString();
      setSetupUri(uri);
      setSharedSecret(totpSetupDetails.sharedSecret);
      setMfaStep('setup');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to start TOTP setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { verifyTOTPSetup, updateMFAPreference } = await import('aws-amplify/auth');
      await verifyTOTPSetup({ code: totpCode });
      await updateMFAPreference({ totp: 'PREFERRED' });
      setIsEnabled(true);
      setSuccess('Two-factor authentication enabled successfully.');
      setMfaStep('status');
      setTotpCode('');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setError('');
    setLoading(true);
    try {
      const { updateMFAPreference } = await import('aws-amplify/auth');
      await updateMFAPreference({ totp: 'DISABLED' });
      setIsEnabled(false);
      setSuccess('Two-factor authentication disabled.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to disable MFA.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && mfaStep === 'status') {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div>
        <h2 className={`${lusitana.className} text-xl font-bold text-gray-900`}>
          Two-factor authentication
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add an extra layer of security to your account using an authenticator app.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">{success}</div>
      )}

      {/* ステータス表示 */}
      {mfaStep === 'status' && (
        <>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <span className={`h-2.5 w-2.5 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">
              Two-factor authentication is <strong>{isEnabled ? 'enabled' : 'disabled'}</strong>
            </span>
          </div>

          {isEnabled ? (
            <button
              onClick={handleDisable}
              disabled={loading}
              className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              Disable two-factor authentication
            </button>
          ) : (
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Set up two-factor authentication'}
            </button>
          )}
        </>
      )}

      {/* QRコード表示 */}
      {mfaStep === 'setup' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            1. Open your authenticator app (Google Authenticator, Microsoft Authenticator, etc.)
          </p>
          <p className="text-sm text-gray-600">
            2. Scan the QR code below or enter the secret key manually.
          </p>

          <div className="flex justify-center rounded-lg bg-gray-50 p-4">
            <QRCodeSVG value={setupUri} size={180} />
          </div>

          <details className="rounded-lg bg-gray-50 px-4 py-3">
            <summary className="cursor-pointer text-xs font-medium text-gray-500">
              Can&apos;t scan? Enter this key manually
            </summary>
            <p className="mt-2 break-all font-mono text-sm text-gray-700">{sharedSecret}</p>
          </details>

          <p className="text-sm text-gray-600">
            3. Enter the 6-digit code from the app to verify setup.
          </p>

          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
              maxLength={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-center text-xl font-mono tracking-widest text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="000000"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setMfaStep('status'); setError(''); }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify & enable'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
