import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor voor het toevoegen van de auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor voor het afhandelen van auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Haal de foutmelding op uit de response data of gebruik een standaard melding
    const errorMessage = error.response?.data?.error || 'Er is een fout opgetreden';

    // Voeg de foutmelding toe aan het error object
    error.userMessage = errorMessage;

    // Specifieke afhandeling voor verschillende HTTP statuscodes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Niet geauthenticeerd - stuur gebruiker naar login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
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