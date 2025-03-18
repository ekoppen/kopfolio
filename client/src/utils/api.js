import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor voor het toevoegen van de auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request headers');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor voor het afhandelen van auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers,
      fullURL: `${response.config.baseURL}${response.config.url}`
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
    });

    // Haal de foutmelding op uit de response data of gebruik een standaard melding
    const errorMessage = error.response?.data?.error || 'Er is een fout opgetreden';

    // Voeg de foutmelding toe aan het error object
    error.userMessage = errorMessage;

    // Specifieke afhandeling voor verschillende HTTP statuscodes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Niet geauthenticeerd - verwijder token
          console.log('Unauthorized - removing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          error.userMessage = 'Je sessie is verlopen. Log opnieuw in.';
          break;
        case 403:
          // Geen rechten
          error.userMessage = 'Je hebt geen toegang tot deze functie. Neem contact op met een beheerder.';
          break;
        case 404:
          error.userMessage = 'De opgevraagde resource kon niet worden gevonden.';
          break;
        case 422:
          error.userMessage = 'De ingevoerde gegevens zijn ongeldig.';
          break;
        case 500:
          error.userMessage = 'Er is een serverfout opgetreden. Probeer het later opnieuw.';
          break;
      }
    } else if (error.request) {
      // Netwerk error
      error.userMessage = 'Kan geen verbinding maken met de server. Controleer je internetverbinding.';
    }

    return Promise.reject(error);
  }
);

export default api; 