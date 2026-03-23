'use client';

import { useState, useEffect, useCallback } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { DeviceType } from 'aws-amplify/auth';

export default function DeviceManagement() {
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDevices = useCallback(async () => {
    try {
      const { fetchDevices } = await import('aws-amplify/auth');
      const result = await fetchDevices();
      setDevices(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleRememberCurrentDevice = async () => {
    setError('');
    setSuccess('');
    try {
      const { rememberDevice } = await import('aws-amplify/auth');
      await rememberDevice();
      setSuccess('This device has been remembered.');
      await loadDevices();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to remember device.');
    }
  };

  const handleForgetDevice = async (device: DeviceType) => {
    setError('');
    setSuccess('');
    try {
      const { forgetDevice } = await import('aws-amplify/auth');
      await forgetDevice({ device });
      setSuccess('Device removed.');
      await loadDevices();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to forget device.');
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div>
        <h2 className={`${lusitana.className} text-xl font-bold text-gray-900`}>
          Trusted devices
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Remembered devices can skip two-factor authentication on sign-in.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">{success}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading devices…</p>
      ) : devices.length === 0 ? (
        <p className="text-sm text-gray-500">No trusted devices yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {devices.map((device) => (
            <li
              key={device.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {device.name ?? 'Unknown device'}
                </span>
                <span className="text-xs text-gray-400">
                  Last seen:{' '}
                  {device.attributes?.lastIpUsed ?? '—'}
                </span>
              </div>
              <button
                onClick={() => handleForgetDevice(device)}
                className="ml-4 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleRememberCurrentDevice}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Remember this device
      </button>
    </div>
  );
}
