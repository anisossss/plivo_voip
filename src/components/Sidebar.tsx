'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PhoneIcon,
  ListBulletIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: HomeIcon },
  { name: "Listes d'appels", href: '/call-lists', icon: ListBulletIcon },
  { name: "Historique d'appels", href: '/call-history', icon: PhoneIcon },
  { name: 'Analytiques', href: '/analytics', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon }
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className='md:hidden'>
        <button
          type='button'
          className='fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-md'
          onClick={() => setSidebarOpen(true)}
        >
          <span className='sr-only'>Open sidebar</span>
          <Bars3Icon className='h-6 w-6' aria-hidden='true' />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-40 flex md:hidden'>
          <div
            className='fixed inset-0 bg-black bg-opacity-50'
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className='relative flex w-full max-w-xs flex-1 flex-col bg-white'>
            <div className='absolute right-0 top-0 pr-2 pt-2'>
              <button
                type='button'
                className='focus:ring-primary-500 ml-1 flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-inset'
                onClick={() => setSidebarOpen(false)}
              >
                <span className='sr-only'>Close sidebar</span>
                <XMarkIcon
                  className='h-6 w-6 text-gray-500'
                  aria-hidden='true'
                />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              mobile={true}
              closeSidebar={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className='hidden md:flex md:flex-shrink-0'>
        <div className='flex w-64 flex-col'>
          <div className='flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white'>
            <SidebarContent pathname={pathname} mobile={false} />
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  pathname,
  mobile,
  closeSidebar
}: {
  pathname: string;
  mobile: boolean;
  closeSidebar?: () => void;
}) {
  return (
    <div className='flex flex-grow flex-col overflow-y-auto pt-5'>
      <div className='flex flex-shrink-0 items-center px-4'>
        <Image
          width={80}
          height={60}
          className='m-auto'
          src='/images/logo.avif'
          alt='Agent Immobilier'
        />
      </div>
      <nav className='mt-5 flex-1 space-y-1 px-2'>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } `}
              onClick={mobile ? closeSidebar : undefined}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden='true'
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
