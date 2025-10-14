// src/index.js
import { useLocalizationStore } from './store';

/**
 * Initializes the localization service. Must be called once at app startup.
 * @param {object} config - The configuration object.
 * @param {string} config.apiUrl - The base URL for the API.
 * @param {string} config.apiKey - The plain-text API key.
 * @param {string} [config.defaultLanguage='en'] - The fallback language.
 */
export const initLocalization = (config) => {
    return useLocalizationStore.getState().init(config);
};

/**
 * The main hook for accessing localization state and functions.
 * @returns {object} - An object containing the t function, state, and actions.
 */
export const useLocalization = () => {
    // Select state from the store
    const { translations, currentLang, status, setLanguage } = useLocalizationStore();

    /**
     * The translation function.
     * @param {string} key - The key to translate (e.g., 'auth.welcome_message').
     * @returns {string} - The translated string or the key itself if not found.
     */
    const t = (key) => {
        return translations[key] || key;
    };

    return { t, currentLang, status, setLanguage };
};