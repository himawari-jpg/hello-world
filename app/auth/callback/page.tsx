'use client';

import 'aws-amplify/auth/enable-oauth-listener';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import config from '@/src/amplifyconfiguration.json';

Amplify.configure(config, { ssr: true });
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          router.push('/dashboard');
          break;
        case 'signInWithRedirect_failure':
          console.error('OAuth sign-in failed');
          router.push('/login');
          break;
      }
    });

    // サインインがすでに完了している場合
    getCurrentUser()
      .then(() => router.push('/dashboard'))
      .catch(() => {
        // OAuth処理の完了を待機中
      });

    return unsubscribe;
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  );
}
