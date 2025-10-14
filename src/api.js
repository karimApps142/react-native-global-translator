// src/api.js
import axios from 'axios';

// Create a base instance
const apiClient = axios.create({
    headers: {
        'Accept': 'application/json',
    },
});

/**
 * Configures the API client with the user's URL and Key.
 * This is called only once during initialization.
 * @param {string} apiUrl - The base URL for the API (e.g., https://api.example.com/api/v1)
 * @param {string} apiKey - The plain-text API key.
 */
export const configureApiClient = (apiUrl, apiKey) => {
    apiClient.defaults.baseURL = apiUrl;
    apiClient.defaults.headers.common['X-API-KEY'] = apiKey;
};

// Define the functions that call our specific endpoints
export const fetchSyncVersions = () => apiClient.get('/sync');
export const fetchCurrencies = () => apiClient.get('/currencies');
export const fetchTranslations = (langCode) => apiClient.get(`/translations?lang=${langCode}`);