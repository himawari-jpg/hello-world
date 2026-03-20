import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import AmplifyProviderLoader from '@/app/ui/AmplifyProviderLoader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AmplifyProviderLoader>{children}</AmplifyProviderLoader>
      </body>
    </html>
  );
}

