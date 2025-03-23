// frontend/src/app/call-history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { callAPI } from '@/lib/api';

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const data = await callAPI.getCalls();
        setCalls(data);
        setFilteredCalls(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching calls:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [searchTerm, statusFilter, outcomeFilter, calls]);

  const filterCalls = () => {
    let result = [...calls];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (call) =>
          call.clientName.toLowerCase().includes(term) ||
          call.phoneNumber.includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((call) => call.status === statusFilter);
    }

    // Apply outcome filter
    if (outcomeFilter !== 'all') {
      result = result.filter((call) => call.outcome === outcomeFilter);
    }

    setFilteredCalls(result);
  };

  const getOutcomeIcon = (outcome) => {
    if (!outcome)
      return <ClockIcon className='h-5 w-5 text-gray-600' aria-hidden='true' />;

    switch (outcome) {
      case 'successful':
        return (
          <CheckCircleIcon
            className='h-5 w-5 text-green-600'
            aria-hidden='true'
          />
        );
      case 'callback-requested':
        return (
          <ArrowUturnLeftIcon
            className='h-5 w-5 text-yellow-600'
            aria-hidden='true'
          />
        );
      case 'declined':
        return (
          <XCircleIcon className='h-5 w-5 text-red-600' aria-hidden='true' />
        );
      case 'no-answer':
        return (
          <XCircleIcon className='h-5 w-5 text-gray-600' aria-hidden='true' />
        );
      default:
        return (
          <ClockIcon className='h-5 w-5 text-gray-600' aria-hidden='true' />
        );
    }
  };

  const getOutcomeBadgeColor = (outcome) => {
    if (!outcome) return 'bg-gray-100 text-gray-800';

    switch (outcome) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'callback-requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'no-answer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Historique des appels
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Consultez et gérez vos enregistrements d&apos;appels.
        </p>
      </div>

      {/* Filters */}
      <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <MagnifyingGlassIcon
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </div>
            <input
              type='text'
              placeholder='Rechercher par nom ou téléphone'
              className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value='all'>Tous les statuts</option>
              <option value='pending'>En attente</option>
              <option value='in-progress'>En cours</option>
              <option value='completed'>Terminé</option>
              <option value='failed'>Échoué</option>
            </select>
          </div>

          <div>
            <select
              className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm'
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
            >
              <option value='all'>Tous les résultats</option>
              <option value='successful'>Réussi</option>
              <option value='callback-requested'>Rappel demandé</option>
              <option value='declined'>Refusé</option>
              <option value='no-answer'>Pas de réponse</option>
            </select>
          </div>

          <div className='text-right'>
            <span className='text-sm text-gray-700'>
              Affichage de{' '}
              <span className='font-medium'>{filteredCalls.length}</span> appels
            </span>
          </div>
        </div>
      </div>

      {/* Call List */}
      {filteredCalls.length === 0 ? (
        <div className='overflow-hidden bg-white p-6 text-center shadow sm:rounded-md'>
          <p className='text-gray-500'>
            Aucun appel trouvé. Ajustez vos filtres ou effectuez des appels !
          </p>
        </div>
      ) : (
        <div className='overflow-hidden bg-white shadow sm:rounded-md'>
          <ul className='divide-y divide-gray-200'>
            {filteredCalls.map((call) => (
              <li key={call._id}>
                <Link
                  href={`/call-history/${call._id}`}
                  className='block hover:bg-gray-50'
                >
                  <div className='px-4 py-4 sm:px-6'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                          <span
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                              call.outcome === 'successful'
                                ? 'bg-green-100'
                                : call.outcome === 'callback-requested'
                                  ? 'bg-yellow-100'
                                  : call.outcome === 'declined'
                                    ? 'bg-red-100'
                                    : 'bg-gray-100'
                            }`}
                          >
                            {getOutcomeIcon(call.outcome)}
                          </span>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {call.clientName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {call.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                        <div className='flex space-x-2'>
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(call.status)}`}
                          >
                            {call.status
                              ? call.status.charAt(0).toUpperCase() +
                                call.status.slice(1)
                              : 'Pending'}
                          </span>
                          {call.outcome && (
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getOutcomeBadgeColor(call.outcome)}`}
                            >
                              {call.outcome
                                .split('-')
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(' ')}
                            </span>
                          )}
                        </div>
                        <div className='mt-1 text-sm text-gray-500'>
                          {new Date(
                            call.startTime || call.createdAt
                          ).toLocaleDateString()}{' '}
                          {new Date(
                            call.startTime || call.createdAt
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className='mt-2 sm:flex sm:justify-between'>
                      <div className='sm:flex'>
                        <div className='mt-2 flex items-center text-sm text-gray-500 sm:mt-0'>
                          <PhoneIcon
                            className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                            aria-hidden='true'
                          />
                          <span>
                            {call.scenario
                              ? call.scenario
                                  .split('-')
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(' ')
                              : 'No scenario'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
