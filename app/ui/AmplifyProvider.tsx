'use client';

import { Amplify } from 'aws-amplify';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import config from '@/src/amplifyconfiguration.json';

Amplify.configure(config, { ssr: true });
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
