// frontend/src/app/call-lists/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { callListAPI } from '@/lib/api';

export default function CallLists() {
  const [callLists, setCallLists] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCallLists = async () => {
      try {
        setLoading(true);
        const data = await callListAPI.getCallLists();
        setCallLists(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching call lists:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCallLists();
  }, []);

  const toggleDropdown = (id) => {
    if (isDropdownOpen === id) {
      setIsDropdownOpen(null);
    } else {
      setIsDropdownOpen(id);
    }
  };

  const handleStartCallList = async (id) => {
    try {
      await callListAPI.startCallList(id);
      // Update the call list status in the UI
      setCallLists(
        callLists.map((list) =>
          list._id === id ? { ...list, status: 'active' } : list
        )
      );
      setIsDropdownOpen(null);
    } catch (err) {
      console.error('Error starting call list:', err);
      alert('Error starting call list: ' + err.message);
    }
  };

  const handlePauseCallList = async (id) => {
    try {
      await callListAPI.pauseCallList(id);
      // Update the call list status in the UI
      setCallLists(
        callLists.map((list) =>
          list._id === id ? { ...list, status: 'paused' } : list
        )
      );
      setIsDropdownOpen(null);
    } catch (err) {
      console.error('Error pausing call list:', err);
      alert('Error pausing call list: ' + err.message);
    }
  };

  const handleDeleteCallList = async (id) => {
    if (window.confirm('Are you sure you want to delete this call list?')) {
      try {
        await callListAPI.deleteCallList(id);
        // Remove the call list from the UI
        setCallLists(callLists.filter((list) => list._id !== id));
        setIsDropdownOpen(null);
      } catch (err) {
        console.error('Error deleting call list:', err);
        alert('Error deleting call list: ' + err.message);
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='border-primary-600 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className='relative rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700'
        role='alert'
      >
        <strong className='font-bold'>Error:</strong>
        <span className='block sm:inline'> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Listes d&apos;appels
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Gérez vos campagnes d&apos;appels et listes de contacts.
          </p>
        </div>
        <Link
          href='/call-lists/new'
          className='bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
        >
          <PlusIcon className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
          Nouvelle liste d&apos;appels
        </Link>
      </div>

      {callLists.length === 0 ? (
        <div className='overflow-hidden bg-white p-6 text-center shadow sm:rounded-md'>
          <p className='text-gray-500'>
            Aucune liste d&apos;appels trouvée. Créez-en une nouvelle pour
            commencer !
          </p>
        </div>
      ) : (
        <div className='overflow-hidden bg-white shadow sm:rounded-md'>
          <ul className='divide-y divide-gray-200'>
            {callLists.map((list) => (
              <li key={list._id}>
                <div className='px-4 py-4 sm:px-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='ml-3'>
                        <span className='text-primary-600 hover:text-primary-500 text-lg font-medium'>
                          {list.name}
                        </span>
                        <p className='text-sm text-gray-500'>
                          {list.scenario
                            .split('-')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='flex flex-col items-end'>
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(list.status)}`}
                        >
                          {list.status.charAt(0).toUpperCase() +
                            list.status.slice(1)}
                        </span>
                        <p className='mt-1 text-sm text-gray-500'>
                          {list.processedContacts} / {list.totalContacts}{' '}
                          contacts
                        </p>
                      </div>
                      <div className='relative'>
                        <button
                          type='button'
                          className='focus:ring-primary-500 inline-flex items-center rounded-full border border-transparent bg-gray-200 p-1 text-white shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
                          onClick={() => toggleDropdown(list._id)}
                        >
                          <EllipsisVerticalIcon
                            className='h-5 w-5 text-gray-500'
                            aria-hidden='true'
                          />
                        </button>
                        {isDropdownOpen === list._id && (
                          <div className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5'>
                            {list.status === 'active' && (
                              <button
                                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                                onClick={() => handlePauseCallList(list._id)}
                              >
                                <PauseIcon className='mr-2 inline h-5 w-5 text-yellow-500' />
                                Mettre en pause la campagne
                              </button>
                            )}
                            {(list.status === 'paused' ||
                              list.status === 'draft') && (
                              <button
                                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                                onClick={() => handleStartCallList(list._id)}
                              >
                                <PlayIcon className='mr-2 inline h-5 w-5 text-green-500' />
                                {list.status === 'paused'
                                  ? 'Reprendre la campagne'
                                  : 'Démarrer la campagne'}
                              </button>
                            )}
                            <Link
                              href={`/call-lists/${list._id}/edit`}
                              className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              onClick={() => setIsDropdownOpen(null)}
                            >
                              Modifier
                            </Link>
                            <button
                              className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
                              onClick={() => handleDeleteCallList(list._id)}
                            >
                              <TrashIcon className='mr-2 inline h-5 w-5' />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='mt-2 sm:flex sm:justify-between'>
                    <div className='sm:flex'>
                      <p className='ml-3 mt-2 flex items-center text-sm text-gray-500 sm:mt-0'>
                        Créé le {new Date(list.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='mt-2 flex items-center text-sm text-gray-500 sm:mt-0'>
                      <div className='h-2.5 w-full rounded-full bg-gray-200'>
                        <div
                          className='bg-primary-600 h-2.5 rounded-full'
                          style={{
                            width: `${list.totalContacts ? (list.processedContacts / list.totalContacts) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className='ml-2'>
                        {list.totalContacts
                          ? Math.round(
                              (list.processedContacts / list.totalContacts) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
