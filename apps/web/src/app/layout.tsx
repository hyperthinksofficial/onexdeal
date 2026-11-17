import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { colors } from '@onexdeal/ui';

export const metadata: Metadata = {
  title: 'OneXDeal — Hosur Local Marketplace',
  description:
    'Discover nearby products in Hosur, Krishnagiri district, Tamil Nadu. Local classifieds marketplace.',
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: colors.surface.base,
          color: colors.text.primary,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
