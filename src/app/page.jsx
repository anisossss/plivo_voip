'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PhoneIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { callAPI, callListAPI } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCampaigns: 0,
    successfulCalls: 0,
    failedCalls: 0
  });
  const [recentLists, setRecentLists] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch call lists
        const callLists = await callListAPI.getCallLists();
        setRecentLists(callLists.slice(0, 3)); // Get latest 3

        // Fetch calls
        const calls = await callAPI.getCalls();
        setRecentCalls(calls.slice(0, 4)); // Get latest 4

        // Calculate stats
        const activeCampaigns = callLists.filter(
          (list) => list.status === 'active'
        ).length;
        const successfulCalls = calls.filter(
          (call) => call.outcome === 'successful'
        ).length;
        const failedCalls = calls.filter(
          (call) =>
            call.status === 'failed' ||
            call.outcome === 'declined' ||
            call.outcome === 'no-answer'
        ).length;

        setStats({
          totalCalls: calls.length,
          activeCampaigns,
          successfulCalls,
          failedCalls
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          Tableau de bord
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Aperçu de vos campagnes d&apos;appels et activités récentes.
        </p>
      </div>

      {/* Stats Overview */}
      <div className='mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total des appels'
          value={stats.totalCalls.toString()}
          icon={<PhoneIcon className='h-6 w-6 text-white' aria-hidden='true' />}
          bgColor='bg-blue-500'
        />
        <StatsCard
          title='Campagnes actives'
          value={stats.activeCampaigns.toString()}
          icon={
            <UserGroupIcon className='h-6 w-6 text-white' aria-hidden='true' />
          }
          bgColor='bg-green-500'
        />
        <StatsCard
          title='Appels réussis'
          value={stats.successfulCalls.toString()}
          icon={
            <CheckCircleIcon
              className='h-6 w-6 text-white'
              aria-hidden='true'
            />
          }
          bgColor='bg-indigo-500'
        />
        <StatsCard
          title='Appels échoués'
          value={stats.failedCalls.toString()}
          icon={
            <XCircleIcon className='h-6 w-6 text-white' aria-hidden='true' />
          }
          bgColor='bg-red-500'
        />
      </div>

      {/* Recent Activity */}
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <div className='overflow-hidden rounded-lg bg-white shadow'>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>
              Listes d&apos;appels récentes
            </h3>
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:p-6'>
            <RecentCallLists lists={recentLists} />
          </div>
          <div className='border-t border-gray-200 bg-white px-4 py-4 sm:px-6'>
            <Link
              href='/call-lists'
              className='text-primary-600 hover:text-primary-500 text-sm font-medium'
            >
              Voir toutes les listes d&apos;appels
            </Link>
          </div>
        </div>

        <div className='overflow-hidden rounded-lg bg-white shadow'>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>
              Appels récents
            </h3>
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:p-6'>
            <RecentCalls calls={recentCalls} />
          </div>
          <div className='border-t border-gray-200 bg-white px-4 py-4 sm:px-6'>
            <Link
              href='/call-history'
              className='text-primary-600 hover:text-primary-500 text-sm font-medium'
            >
              Voir tous les appels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, bgColor }) {
  return (
    <div className='overflow-hidden rounded-lg bg-white shadow'>
      <div className='p-5'>
        <div className='flex items-center'>
          <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
            {icon}
          </div>
          <div className='ml-5 w-0 flex-1'>
            <dt className='truncate text-sm font-medium text-gray-500'>
              {title}
            </dt>
            <dd className='flex items-baseline'>
              <div className='text-2xl font-semibold text-gray-900'>
                {value}
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentCallLists({ lists }) {
  if (!lists.length) {
    return (
      <p className='py-4 text-center text-gray-500'>
        Aucune liste d&apos;appels disponible.
      </p>
    );
  }

  const getScenarioName = (scenarioKey) => {
    const scenarioMap = {
      'project-cancelled-by-broker': 'Projet annulé par le courtier',
      'credit-request-refused': 'Demande de crédit refusée',
      'professional-prospecting': 'Prospection professionnelle',
      'client-cancelled-project': 'Projet annulé par le client'
    };
    return scenarioMap[scenarioKey] || scenarioKey;
  };
  return (
    <div className='flow-root'>
      <ul className='-mb-8'>
        {lists.map((list, listIdx) => (
          <li key={list._id}>
            <div className='relative pb-8'>
              {listIdx !== lists.length - 1 ? (
                <span
                  className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'
                  aria-hidden='true'
                />
              ) : null}
              <div className='relative flex space-x-3'>
                <div>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                      list.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    <UserGroupIcon
                      className='h-5 w-5 text-white'
                      aria-hidden='true'
                    />
                  </span>
                </div>
                <div className='flex min-w-0 flex-1 justify-between space-x-4 pt-1.5'>
                  <div>
                    <p className='text-sm text-gray-900'>
                      <Link
                        href={`/call-lists/${list._id}`}
                        className='font-medium text-gray-900'
                      >
                        {list.name}
                      </Link>
                    </p>
                    <p className='text-sm text-gray-500'>
                      {getScenarioName(list.scenario)}
                    </p>
                  </div>
                  <div className='whitespace-nowrap text-right text-sm text-gray-500'>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        list.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {list.status.charAt(0).toUpperCase() +
                        list.status.slice(1)}
                    </span>
                    <p className='mt-1'>
                      {list.processedContacts} / {list.totalContacts}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentCalls({ calls }) {
  if (!calls.length) {
    return (
      <p className='py-4 text-center text-gray-500'>Aucun appel disponible.</p>
    );
  }

  return (
    <div className='flow-root'>
      <ul className='-mb-8'>
        {calls.map((call, callIdx) => (
          <li key={call._id}>
            <div className='relative pb-8'>
              {callIdx !== calls.length - 1 ? (
                <span
                  className='absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200'
                  aria-hidden='true'
                />
              ) : null}
              <div className='relative flex space-x-3'>
                <div>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                      call.outcome === 'successful'
                        ? 'bg-green-500'
                        : call.outcome === 'callback-requested'
                          ? 'bg-yellow-500'
                          : call.outcome === 'declined'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                    }`}
                  >
                    <PhoneIcon
                      className='h-5 w-5 text-white'
                      aria-hidden='true'
                    />
                  </span>
                </div>
                <div className='flex min-w-0 flex-1 justify-between space-x-4 pt-1.5'>
                  <div>
                    <p className='text-sm text-gray-900'>
                      <Link
                        href={`/call-history/${call._id}`}
                        className='font-medium text-gray-900'
                      >
                        {call.clientName}
                      </Link>
                    </p>
                    <p className='text-sm text-gray-500'>{call.phoneNumber}</p>
                  </div>
                  <div className='whitespace-nowrap text-right text-sm text-gray-500'>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        call.outcome === 'successful'
                          ? 'bg-green-100 text-green-800'
                          : call.outcome === 'callback-requested'
                            ? 'bg-yellow-100 text-yellow-800'
                            : call.outcome === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {call.outcome
                        ? call.outcome
                            .split('-')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')
                        : 'Pending'}
                    </span>
                    <p className='mt-1'>
                      {new Date(call.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
