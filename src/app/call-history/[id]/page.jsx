'use client';

import { useState, useEffect } from 'react';
import {
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { callAPI } from '@/lib/api';

export default function CallDetails({ params }) {
  const { id } = params;
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCall = async () => {
      try {
        setLoading(true);
        const data = await callAPI.getCallById(id);
        setCall(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching call:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCall();
  }, [id]);

  const handleCallAgain = async () => {
    try {
      if (!call) return;

      const result = await callAPI.initiateCall(call._id);
      alert('Call initiated successfully');
    } catch (err) {
      console.error('Error initiating call:', err);
      alert('Error initiating call: ' + err.message);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getOutcomeColor = (outcome) => {
    if (!outcome) return 'text-gray-600';

    switch (outcome) {
      case 'successful':
        return 'text-green-600';
      case 'callback-requested':
        return 'text-yellow-600';
      case 'declined':
        return 'text-red-600';
      case 'no-answer':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
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

  const downloadTranscript = () => {
    if (!call || !call.transcript || call.transcript.length === 0) {
      alert('No transcript available for download');
      return;
    }

    const formatTimestamp = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    let content = `Call with ${call.clientName} (${call.phoneNumber}) on ${new Date(call.startTime || call.createdAt).toLocaleDateString()}\n\n`;

    call.transcript.forEach((entry) => {
      content += `[${formatTimestamp(entry.timestamp)}] ${entry.speaker === 'assistant' ? 'Emma' : call.clientName}: ${entry.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${call._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (!call) {
    return (
      <div className='overflow-hidden bg-white p-6 shadow sm:rounded-lg'>
        <p className='text-center text-gray-500'>Call not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Détails de l&apos;appel
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Appel avec {call.clientName} le{' '}
            {new Date(call.startTime || call.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className='mt-4 flex space-x-3 md:mt-0'>
          <button
            type='button'
            onClick={downloadTranscript}
            className='focus:ring-primary-500 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2'
            disabled={!call.transcript || call.transcript.length === 0}
          >
            Télécharger la transcription
          </button>
          <button
            type='button'
            onClick={handleCallAgain}
            className='bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
          >
            <PhoneIcon className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
            Rappeler
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
        {/* Call Information */}
        <div className='lg:col-span-1'>
          <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Informations sur l&apos;appel
              </h3>
            </div>
            <div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
              <dl className='sm:divide-y sm:divide-gray-200'>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>
                    Nom du client
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                    {call.clientName}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>
                    Numéro de téléphone
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                    {call.phoneNumber}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>
                    Scénario
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                    {call.scenario
                      ? call.scenario
                          .split('-')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(' ')
                      : '-'}
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>
                    Date et heure
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                    <div className='flex items-center'>
                      <CalendarIcon
                        className='mr-1.5 h-5 w-5 text-gray-400'
                        aria-hidden='true'
                      />
                      {new Date(
                        call.startTime || call.createdAt
                      ).toLocaleDateString()}{' '}
                      at{' '}
                      {new Date(
                        call.startTime || call.createdAt
                      ).toLocaleTimeString()}
                    </div>
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>Durée</dt>
                  <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                    <div className='flex items-center'>
                      <ClockIcon
                        className='mr-1.5 h-5 w-5 text-gray-400'
                        aria-hidden='true'
                      />
                      {formatDuration(call.duration)}
                    </div>
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>Status</dt>
                  <dd className='mt-1 text-sm sm:col-span-2 sm:mt-0'>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        call.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : call.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : call.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {call.status
                        ? call.status.charAt(0).toUpperCase() +
                          call.status.slice(1)
                        : 'Pending'}
                    </span>
                  </dd>
                </div>
                <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                  <dt className='text-sm font-medium text-gray-500'>Outcome</dt>
                  <dd className='mt-1 text-sm sm:col-span-2 sm:mt-0'>
                    <div className='flex items-center'>
                      {getOutcomeIcon(call.outcome)}
                      <span
                        className={`ml-1.5 ${getOutcomeColor(call.outcome)}`}
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
                    </div>
                  </dd>
                </div>
                {call.metadata && (
                  <>
                    <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                      <dt className='text-sm font-medium text-gray-500'>
                        Sentiment utilisateur
                      </dt>
                      <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                        {call.metadata.userSentiment
                          ? call.metadata.userSentiment
                              .charAt(0)
                              .toUpperCase() +
                            call.metadata.userSentiment.slice(1)
                          : '-'}
                      </dd>
                    </div>
                    <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5'>
                      <dt className='text-sm font-medium text-gray-500'>
                        Intention utilisateur
                      </dt>
                      <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                        {call.metadata.userIntent
                          ? call.metadata.userIntent
                              .split('_')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(' ')
                          : '-'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className='lg:col-span-3'>
          <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Transcription de l&apos;appel
              </h3>
            </div>
            <div className='border-t border-gray-200'>
              <div className='px-4 py-5 sm:p-6'>
                {call.transcript && call.transcript.length > 0 ? (
                  <div className='space-y-6'>
                    {call.transcript.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex ${entry.speaker === 'assistant' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-lg rounded-lg px-4 py-2 ${
                            entry.speaker === 'assistant'
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className='mb-1 text-xs text-gray-500'>
                            {entry.speaker === 'assistant'
                              ? 'Emma'
                              : call.clientName}{' '}
                            • {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                          <p className='text-sm'>{entry.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='py-4 text-center text-gray-500'>
                    Aucune transcription disponible.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
