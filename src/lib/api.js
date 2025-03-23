const API_URL = 'https://plivo.ainexim.com';
// const API_URL = 'http://localhost:3200';

async function fetchWithAuth(url, options = {}) {
  // Get token from localStorage
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  // Handle unauthorized
  if (response.status === 401) {
    // Clear localStorage and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authAPI = {
  login: async (credentials) => {
    const data = await fetchWithAuth('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    // Save token to localStorage
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  register: async (userData) => {
    const data = await fetchWithAuth('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    // Save token to localStorage
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  getProfile: async () => {
    return await fetchWithAuth('/api/users/profile');
  },

  updateProfile: async (userData) => {
    return await fetchWithAuth('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  updatePassword: async (passwordData) => {
    return await fetchWithAuth('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};

export const callAPI = {
  getCalls: async () => {
    return await fetchWithAuth('/api/calls');
  },

  getCall: async (id) => {
    return await fetchWithAuth(`/api/calls/${id}`);
  },

  getCallById: async (id) => {
    return await fetchWithAuth(`/api/calls/${id}`);
  },

  createCall: async (callData) => {
    return await fetchWithAuth('/api/calls', {
      method: 'POST',
      body: JSON.stringify(callData)
    });
  },

  updateCall: async (id, callData) => {
    return await fetchWithAuth(`/api/calls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(callData)
    });
  },

  deleteCall: async (id) => {
    return await fetchWithAuth(`/api/calls/${id}`, {
      method: 'DELETE'
    });
  },

  initiateCall: async (id) => {
    return await fetchWithAuth(`/api/calls/${id}/initiate`, {
      method: 'POST'
    });
  },

  hangupCall: async (callId) => {
    return await fetchWithAuth(`/api/calls/${callId}/hangup`, {
      method: 'POST'
    });
  }
};

export const callListAPI = {
  getCallLists: async () => {
    return await fetchWithAuth('/api/call-lists');
  },

  getCallListById: async (id) => {
    return await fetchWithAuth(`/api/call-lists/${id}`);
  },

  createCallList: async (callListData) => {
    return await fetchWithAuth('/api/call-lists', {
      method: 'POST',
      body: JSON.stringify(callListData)
    });
  },

  updateCallList: async (id, callListData) => {
    return await fetchWithAuth(`/api/call-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(callListData)
    });
  },

  deleteCallList: async (id) => {
    return await fetchWithAuth(`/api/call-lists/${id}`, {
      method: 'DELETE'
    });
  },

  startCallList: async (id) => {
    return await fetchWithAuth(`/api/call-lists/${id}/start`, {
      method: 'POST'
    });
  },

  pauseCallList: async (id) => {
    return await fetchWithAuth(`/api/call-lists/${id}/pause`, {
      method: 'POST'
    });
  },

  addContactsToCallList: async (id, contacts) => {
    return await fetchWithAuth(`/api/call-lists/${id}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ contacts })
    });
  }
};
