import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OVS | Online Voting System',
  description: 'Adamson University Student Government online voting system.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
