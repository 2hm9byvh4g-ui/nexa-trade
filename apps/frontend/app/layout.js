import { headers } from 'next/headers';
import './globals.css';

export const metadata = {
  title: 'NEXA Trade — From Nigerian Supply to Global Demand',
  description: 'A trusted B2B trade platform connecting verified Nigerian suppliers with international buyers.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
