'use client';

import dynamic from 'next/dynamic';

export default dynamic(() => import('./device-management'), { ssr: false });
