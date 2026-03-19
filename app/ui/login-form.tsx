'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  return (
    <Authenticator>
      {({ signOut, user }) => {
        if (user) {
          router.push('/dashboard');
        }
        return <></>;
      }}
    </Authenticator>
  );
}
