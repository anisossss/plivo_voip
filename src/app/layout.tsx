// frontend/src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Call Bot Dashboard',
  description: 'AI-powered Call Bot for Real Estate Customer Communication'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div className='flex h-screen bg-gray-100'>
          <Sidebar />
          <div className='flex flex-1 flex-col overflow-hidden'>
            <Header />
            <main className='flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-6'>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
