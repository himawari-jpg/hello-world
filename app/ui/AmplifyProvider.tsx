'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import config from '@/src/amplifyconfiguration.json';

Amplify.configure(config, { ssr: true });
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          getCurrentUser().then(() => {
            router.push('/dashboard');
          });
          break;
        case 'signInWithRedirect_failure':
          console.error('OAuth sign-in failed');
          router.push('/login');
          break;
      }
    });

    return unsubscribe;
  }, [router]);

  return <>{children}</>;
}
