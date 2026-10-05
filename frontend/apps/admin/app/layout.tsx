import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Tribyte360 — Platform Super Admin',
  description: 'Tribyte360 Multi-Tenant Enterprise Architecture',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
