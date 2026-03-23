'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import config from '@/src/amplifyconfiguration.json';

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    Amplify.configure(config, { ssr: true });
    cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in');
          router.push('/dashboard');
          break;
        case 'signedOut':
          console.log('User signed out');
          router.push('/login');
          break;
        case 'tokenRefresh':
          console.log('Token refreshed successfully');
          break;
        case 'tokenRefresh_failure':
          console.error('Token refresh failed');
          router.push('/login');
          break;
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
