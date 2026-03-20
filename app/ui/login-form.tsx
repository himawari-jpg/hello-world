'use client';

import { lusitana } from '@/app/ui/fonts';

const providers = [
  { id: 'Google', label: 'Sign in with Google' },
  { id: 'Facebook', label: 'Sign in with Facebook' },
  { id: 'Amazon', label: 'Sign in with Amazon' },
];

export default function LoginForm() {
  const handleSignIn = async (provider: string) => {
    const { signInWithRedirect } = await import('aws-amplify/auth');
    await signInWithRedirect({ provider: provider as 'Google' | 'Facebook' | 'Amazon' });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-6">
      <h2 className={`${lusitana.className} mb-2 text-xl text-gray-900`}>
        Please log in to continue.
      </h2>
      {providers.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => handleSignIn(id)}
          className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
