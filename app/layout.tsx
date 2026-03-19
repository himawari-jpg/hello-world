import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import AmplifyProvider from '@/app/ui/AmplifyProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
