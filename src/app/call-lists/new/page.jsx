// frontend/src/app/call-lists/new/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { callListAPI } from '@/lib/api';

export default function NewCallList() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scenario: ''
  });
  const [contacts, setContacts] = useState([]);
  const [manualEntry, setManualEntry] = useState({
    phoneNumber: '',
    clientName: '',
    metadata: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleManualEntryChange = (e) => {
    const { name, value } = e.target;
    setManualEntry((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const addManualContact = () => {
    if (manualEntry.phoneNumber && manualEntry.clientName) {
      setContacts([
        ...contacts,
        {
          phoneNumber: manualEntry.phoneNumber,
          clientName: manualEntry.clientName,
          metadata: manualEntry.metadata ? JSON.parse(manualEntry.metadata) : {}
        }
      ]);
      setManualEntry({
        phoneNumber: '',
        clientName: '',
        metadata: ''
      });
    }
  };

  const removeContact = (index) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // Assuming CSV format with headers: phoneNumber,clientName,metadata
        const rows = text.split('\n');
        const headers = rows[0].split(',');

        const phoneIndex = headers.findIndex(
          (h) => h.trim().toLowerCase() === 'phonenumber'
        );
        const nameIndex = headers.findIndex(
          (h) => h.trim().toLowerCase() === 'clientname'
        );

        if (phoneIndex === -1 || nameIndex === -1) {
          alert('CSV file must have phoneNumber and clientName columns');
          return;
        }

        const newContacts = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;

          const values = rows[i].split(',');
          const phoneNumber = values[phoneIndex]?.trim();
          const clientName = values[nameIndex]?.trim();

          if (phoneNumber && clientName) {
            // Collect other columns as metadata
            const metadata = {};
            headers.forEach((header, index) => {
              if (index !== phoneIndex && index !== nameIndex) {
                metadata[header.trim()] = values[index]?.trim() || '';
              }
            });

            newContacts.push({
              phoneNumber,
              clientName,
              metadata
            });
          }
        }

        setContacts([...contacts, ...newContacts]);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.scenario || contacts.length === 0) {
      alert('Please fill all required fields and add at least one contact');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const callListData = {
        ...formData,
        contacts
      };

      await callListAPI.createCallList(callListData);

      // Navigate back to call lists
      router.push('/call-lists');
    } catch (err) {
      console.error('Error creating call list:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Créer une nouvelle liste d&apos;appels
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Configurez une nouvelle campagne avec des contacts et un scénario.
        </p>
      </div>

      {error && (
        <div
          className='relative mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700'
          role='alert'
        >
          <strong className='font-bold'>Error:</strong>
          <span className='block sm:inline'> {error}</span>
        </div>
      )}

      <div className='overflow-hidden bg-white shadow sm:rounded-md'>
        <form onSubmit={handleSubmit} className='p-6'>
          <div className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6'>
            <div className='sm:col-span-3'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'
              >
                Nom de la liste <span className='text-red-500'>*</span>
              </label>
              <div className='mt-1'>
                <input
                  type='text'
                  name='name'
                  id='name'
                  value={formData.name}
                  onChange={handleChange}
                  className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm'
                  required
                />
              </div>
            </div>

            <div className='sm:col-span-3'>
              <label
                htmlFor='scenario'
                className='block text-sm font-medium text-gray-700'
              >
                Scénario <span className='text-red-500'>*</span>
              </label>
              <div className='mt-1'>
                <select
                  id='scenario'
                  name='scenario'
                  value={formData.scenario}
                  onChange={handleChange}
                  className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm'
                  required
                >
                  <option value=''>Select a scenario</option>
                  <option value='project-cancelled-by-broker'>
                    Projet annulé par le courtier
                  </option>
                  <option value='credit-request-refused'>
                    Demande de crédit refusée
                  </option>
                  <option value='professional-prospecting'>
                    Prospection professionnelle
                  </option>
                  <option value='client-cancelled-project'>
                    Projet annulé par le client
                  </option>
                </select>
              </div>
            </div>

            <div className='sm:col-span-6'>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700'
              >
                Description
              </label>
              <div className='mt-1'>
                <textarea
                  id='description'
                  name='description'
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm'
                />
              </div>
              <p className='mt-2 text-sm text-gray-500'>
                Brève description de l&apos;objectif de la liste d&apos;appels.
              </p>
            </div>

            <div className='sm:col-span-6'>
              <label className='block text-sm font-medium text-gray-700'>
                Importer des contacts <span className='text-red-500'>*</span>
              </label>
              <div
                className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pb-6 pt-5 ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className='space-y-1 text-center'>
                  <ArrowUpTrayIcon
                    className='mx-auto h-12 w-12 text-gray-400'
                    aria-hidden='true'
                  />
                  <div className='flex text-sm text-gray-600'>
                    <label
                      htmlFor='file-upload'
                      className='text-primary-600 hover:text-primary-500 focus-within:ring-primary-500 relative cursor-pointer rounded-md bg-white font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2'
                    >
                      <span>Upload a file</span>
                      <input
                        id='file-upload'
                        name='file-upload'
                        type='file'
                        className='sr-only'
                        accept='.csv,.txt'
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                      />
                    </label>
                    <p className='pl-1'>or drag and drop</p>
                  </div>
                  <p className='text-xs text-gray-500'>
                    CSV avec en-têtes : phoneNumber, clientName, [champs de
                    métadonnées]
                  </p>
                </div>
              </div>
            </div>

            <div className='sm:col-span-6'>
              <div className='rounded-md bg-gray-50 p-4'>
                <h3 className='mb-4 text-lg font-medium text-gray-900'>
                  Saisie manuelle
                </h3>
                <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6'>
                  <div className='sm:col-span-2'>
                    <label
                      htmlFor='phoneNumber'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Numéro de téléphone
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='phoneNumber'
                        id='phoneNumber'
                        value={manualEntry.phoneNumber}
                        onChange={handleManualEntryChange}
                        className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm'
                        placeholder='+33612345678'
                      />
                    </div>
                  </div>
                  <div className='sm:col-span-2'>
                    <label
                      htmlFor='clientName'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Nom du client
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='clientName'
                        id='clientName'
                        value={manualEntry.clientName}
                        onChange={handleManualEntryChange}
                        className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm'
                        placeholder='Jean Dupont'
                      />
                    </div>
                  </div>
                  <div className='sm:col-span-2'>
                    <label
                      htmlFor='metadata'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Métadonnées (JSON)
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='metadata'
                        id='metadata'
                        value={manualEntry.metadata}
                        onChange={handleManualEntryChange}
                        className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm'
                        placeholder='{"key": "value"}'
                      />
                    </div>
                  </div>
                  <div className='flex justify-end sm:col-span-6'>
                    <button
                      type='button'
                      onClick={addManualContact}
                      className='bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
                    >
                      Ajouter un contact
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='sm:col-span-6'>
              <h3 className='mb-4 text-lg font-medium text-gray-900'>
                Contact List ({contacts.length})
              </h3>
              {contacts.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                        >
                          Numéro de téléphone
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                        >
                          Nom du client
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                        >
                          Métadonnées
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {contacts.map((contact, index) => (
                        <tr key={index}>
                          <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                            {contact.phoneNumber}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                            {contact.clientName}
                          </td>
                          <td className='max-w-xs truncate px-6 py-4 text-sm text-gray-500'>
                            {JSON.stringify(contact.metadata)}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                            <button
                              type='button'
                              onClick={() => removeContact(index)}
                              className='text-red-600 hover:text-red-900'
                            >
                              <XMarkIcon
                                className='h-5 w-5'
                                aria-hidden='true'
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='py-4 text-center text-gray-500'>
                  Aucun contact ajouté pour l&apos;instant.
                </p>
              )}
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => router.push('/call-lists')}
              className='focus:ring-primary-500 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2'
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type='submit'
              className='bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className='-ml-1 mr-2 h-4 w-4 animate-spin text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                "Créer une liste d'appels"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
