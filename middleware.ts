import { NextResponse, type NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import amplifyConfig from './src/amplifyconfiguration.json';

const { runWithAmplifyServerContext } = createServerRunner({ config: amplifyConfig });

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isOnLogin = request.nextUrl.pathname.startsWith('/login');

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (isOnDashboard && !authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isOnLogin && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
