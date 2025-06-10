'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProvider client={client}>
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}