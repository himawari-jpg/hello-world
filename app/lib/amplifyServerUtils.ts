import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';
import config from '@/src/amplifyconfiguration.json';

export const cookiesClient = generateServerClientUsingCookies({
  config,
  cookies,
});
