'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PhoneIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  MicrophoneIcon
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

  // New state for quick call section
  const [quickCallData, setQuickCallData] = useState({
    phoneNumber: '',
    clientName: '',
    scenario: 'project-cancelled-by-broker'
  });
  const [callInProgress, setCallInProgress] = useState(false);
  const [callResult, setCallResult] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, dialing, ringing, connected, ended
  const [activeCallId, setActiveCallId] = useState(null);
  const [callEvents, setCallEvents] = useState([]);

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

  useEffect(() => {
    if (!activeCallId) return;

    const statusInterval = setInterval(async () => {
      try {
        // Use getCallById instead of getCall
        const call = await callAPI.getCallById(activeCallId);

        // Rest of your code remains the same
        if (call.status === 'completed') {
          setCallStatus('ended');
          setCallInProgress(false);
          clearInterval(statusInterval);

          addCallEvent(
            `Call ${call.outcome === 'successful' ? 'completed successfully' : 'ended'}`
          );

          const calls = await callAPI.getCalls();
          setRecentCalls(calls.slice(0, 4));
        } else if (call.status === 'in-progress') {
          if (callStatus === 'dialing' || callStatus === 'idle') {
            setCallStatus('ringing');
            addCallEvent('Call is ringing...');
          }
        }
      } catch (err) {
        console.error('Error polling call status:', err);
      }
    }, 3000);

    return () => clearInterval(statusInterval);
  }, [activeCallId, callStatus]);

  // Handle input changes for the quick call form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuickCallData({
      ...quickCallData,
      [name]: value
    });
  };

  // Add a new call event to the log
  const addCallEvent = (message) => {
    setCallEvents((prev) => [
      ...prev,
      {
        message,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Handle quick call submission
  const handleQuickCall = async (e) => {
    e.preventDefault();
    setCallInProgress(true);
    setCallStatus('dialing');
    setCallResult(null);
    setCallEvents([
      {
        message: 'Initiating call...',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    try {
      // First create the call
      const createdCall = await callAPI.createCall(quickCallData);
      setActiveCallId(createdCall._id);
      addCallEvent(`Call created (ID: ${createdCall._id.substring(0, 8)}...)`);

      // Then initiate it
      addCallEvent('Dialing...');
      const result = await callAPI.initiateCall(createdCall._id);
      console.log(result);
      setCallResult({
        success: true,
        message: 'Call initiated successfully!',
        callId: createdCall._id
      });

      addCallEvent('Call connected to telephony service');
      setCallStatus('connected');
    } catch (err) {
      console.error('Error making quick call:', err);
      addCallEvent(`Error: ${err.message || 'Failed to initiate call'}`);
      setCallResult({
        success: false,
        message: err.message || 'Failed to initiate call'
      });
      setCallStatus('idle');
      setCallInProgress(false);
    }
  };

  // Handle hanging up the call
  const handleHangupCall = async () => {
    if (!activeCallId) return;

    try {
      addCallEvent('Hanging up call...');
      await callAPI.hangupCall(activeCallId);
      setCallStatus('ended');
      setCallInProgress(false);
      addCallEvent('Call ended');

      // Refresh the recent calls list
      const calls = await callAPI.getCalls();
      setRecentCalls(calls.slice(0, 4));
    } catch (err) {
      console.error('Error hanging up call:', err);
      addCallEvent(`Error hanging up: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary-600'></div>
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

  const scenarioOptions = [
    {
      value: 'project-cancelled-by-broker',
      label: 'Projet annulé par le courtier'
    },
    {
      value: 'credit-request-refused',
      label: 'Demande de crédit refusée'
    },
    {
      value: 'professional-prospecting',
      label: 'Prospection professionnelle'
    },
    {
      value: 'client-cancelled-project',
      label: 'Projet annulé par le client'
    },
    {
      value: 'mortgage-simulation-follow-up',
      label: 'Suivi simulation crédit immobilier'
    },
    {
      value: 'debt-consolidation-follow-up',
      label: 'Suivi regroupement de crédits'
    },
    {
      value: 'insurance-optimization-follow-up',
      label: 'Suivi optimisation assurance emprunteur'
    },
    {
      value: 'professional-credit-follow-up',
      label: 'Suivi crédit professionnel'
    },
    {
      value: 'customer-satisfaction-survey',
      label: 'Enquête de satisfaction client'
    },
    {
      value: 'refinancing-opportunity',
      label: 'Opportunité de renégociation'
    }
  ];

  // Call status indicator UI
  const getCallStatusIndicator = () => {
    switch (callStatus) {
      case 'dialing':
        return (
          <div className='flex items-center space-x-2 text-blue-600'>
            <div className='h-3 w-3 animate-pulse rounded-full bg-blue-500'></div>
            <span>Dialing...</span>
          </div>
        );
      case 'ringing':
        return (
          <div className='flex items-center space-x-2 text-yellow-600'>
            <div className='h-3 w-3 animate-pulse rounded-full bg-yellow-500'></div>
            <span>Ringing...</span>
          </div>
        );
      case 'connected':
        return (
          <div className='flex items-center space-x-2 text-green-600'>
            <div className='h-3 w-3 rounded-full bg-green-500'></div>
            <span>Connected</span>
            <MicrophoneIcon className='h-4 w-4 animate-pulse' />
          </div>
        );
      case 'ended':
        return (
          <div className='flex items-center space-x-2 text-gray-600'>
            <div className='h-3 w-3 rounded-full bg-gray-500'></div>
            <span>Call Ended</span>
          </div>
        );
      default:
        return null;
    }
  };

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

      {/* Quick Call Section */}
      <div className='mb-6 overflow-hidden rounded-lg bg-white shadow'>
        <div className='px-4 py-5 sm:px-6'>
          <h3 className='text-lg font-medium leading-6 text-gray-900'>
            Appel rapide
          </h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Effectuez un appel rapide à un client.
          </p>
        </div>
        <div className='border-t border-gray-200 px-4 py-5 sm:p-6'>
          <form onSubmit={handleQuickCall} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div>
                <label
                  htmlFor='phoneNumber'
                  className='block text-sm font-medium text-gray-700'
                >
                  Numéro de téléphone
                </label>
                <input
                  type='tel'
                  name='phoneNumber'
                  id='phoneNumber'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm'
                  placeholder='+33612345678'
                  value={quickCallData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={callInProgress}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='clientName'
                  className='block text-sm font-medium text-gray-700'
                >
                  Nom du client
                </label>
                <input
                  type='text'
                  name='clientName'
                  id='clientName'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm'
                  placeholder='Jean Dupont'
                  value={quickCallData.clientName}
                  onChange={handleInputChange}
                  disabled={callInProgress}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='scenario'
                  className='block text-sm font-medium text-gray-700'
                >
                  Scénario
                </label>
                <select
                  id='scenario'
                  name='scenario'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm'
                  value={quickCallData.scenario}
                  onChange={handleInputChange}
                  disabled={callInProgress}
                >
                  {scenarioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              {getCallStatusIndicator()}

              <div className='flex space-x-3'>
                <button
                  type='submit'
                  className='inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                  disabled={callInProgress}
                >
                  {callInProgress ? (
                    <>
                      <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-white'></span>
                      Appel en cours...
                    </>
                  ) : (
                    <>
                      <PhoneIcon
                        className='-ml-1 mr-2 h-5 w-5'
                        aria-hidden='true'
                      />
                      Appeler maintenant
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Call Events Log */}
          {callEvents.length > 0 && (
            <div className='mt-6'>
              <h4 className='text-sm font-medium text-gray-900'>
                Journal d'appel
              </h4>
              <div className='mt-2 max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2'>
                <ul className='space-y-1'>
                  {callEvents.map((event, index) => (
                    <li key={index} className='text-xs'>
                      <span className='font-mono text-gray-500'>
                        {event.timestamp}
                      </span>
                      <span className='ml-2 text-gray-800'>
                        {event.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {callResult && (
            <div
              className={`mt-4 rounded-md p-4 ${
                callResult.success
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <div className='flex'>
                <div className='flex-shrink-0'>
                  {callResult.success ? (
                    <CheckCircleIcon
                      className='h-5 w-5 text-green-400'
                      aria-hidden='true'
                    />
                  ) : (
                    <XCircleIcon
                      className='h-5 w-5 text-red-400'
                      aria-hidden='true'
                    />
                  )}
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium'>{callResult.message}</p>
                  {callResult.callId && (
                    <p className='mt-2 text-sm'>
                      <Link
                        href={`/call-history/${callResult.callId}`}
                        className='font-medium underline'
                      >
                        Voir les détails de l&apos;appel
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
              className='text-sm font-medium text-primary-600 hover:text-primary-500'
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
              className='text-sm font-medium text-primary-600 hover:text-primary-500'
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
