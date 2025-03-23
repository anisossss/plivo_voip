// frontend/src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className='z-10 bg-white shadow-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 justify-between'>
          <div className='flex'>
            <div className='flex flex-shrink-0 items-center'></div>
          </div>

          <div className='flex items-center'>
            <button className='focus:ring-primary-500 rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2'>
              <span className='sr-only'>Voir les notifications</span>
              <BellIcon className='h-6 w-6' aria-hidden='true' />
            </button>

            <div className='relative ml-3'>
              <div>
                <button
                  className='focus:ring-primary-500 flex rounded-full text-sm focus:outline-none focus:ring-2'
                  id='user-menu'
                  aria-expanded='false'
                  aria-haspopup='true'
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className='sr-only'>Ouvrir le menu utilisateur</span>
                  <UserCircleIcon
                    className='h-8 w-8 text-gray-400'
                    aria-hidden='true'
                  />
                </button>
              </div>

              {isProfileOpen && (
                <div
                  className='absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
                  role='menu'
                  aria-orientation='vertical'
                  aria-labelledby='user-menu'
                >
                  <Link
                    href='/profile'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    role='menuitem'
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Votre Profil
                  </Link>
                  <Link
                    href='/settings'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    role='menuitem'
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Paramètres
                  </Link>
                  <Link
                    href='/login'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    role='menuitem'
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Se déconnecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
