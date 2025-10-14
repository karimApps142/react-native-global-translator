// src/store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureApiClient, fetchSyncVersions, fetchTranslations, fetchCurrencies } from './api';

export const useLocalizationStore = create(
    persist(
        (set, get) => ({
            // STATE
            status: 'idle', // 'idle', 'loading', 'ready', 'error'
            translations: {},
            currencies: {},
            currentLang: 'en', // Default language, can be overridden by persisted state
            translationVersion: 0,
            currencyVersion: 0,

            // ACTIONS
            init: async ({ apiUrl, apiKey, defaultLanguage = 'en' }) => {
                if (!apiUrl || !apiKey) {
                    console.error('Localization Error: apiUrl and apiKey must be provided.');
                    return set({ status: 'error' });
                }
                configureApiClient(apiUrl, apiKey);

                // If language isn't persisted, set default
                if (!get().currentLang) {
                    set({ currentLang: defaultLanguage });
                }

                get().fetchAndSync();
            },

            fetchAndSync: async () => {
                const { currentLang, translationVersion } = get();
                set({ status: 'loading' });

                try {
                    const { data: serverVersions } = await fetchSyncVersions();

                    if (serverVersions.translation_version > translationVersion) {
                        console.log('New translations found! Fetching from server...');
                        const { data: newTranslations } = await fetchTranslations(currentLang);
                        const { data: newCurrencies } = await fetchCurrencies();

                        set({
                            translations: newTranslations,
                            currencies: newCurrencies,
                            translationVersion: serverVersions.translation_version,
                            currencyVersion: serverVersions.currency_version,
                            status: 'ready',
                        });
                    } else {
                        console.log('Translations are up to date.');
                        set({ status: 'ready' });
                    }
                } catch (error) {
                    console.error('Failed to sync localization:', error);
                    set({ status: 'error' });
                }
            },

            setLanguage: (langCode) => {
                if (get().currentLang === langCode) return;
                set({ currentLang: langCode, translations: {} }); // Clear old translations
                get().fetchAndSync(); // Re-fetch data for the new language
            },
        }),
        {
            // CONFIG for PERSISTENCE
            name: 'localization-storage', // Key used in AsyncStorage
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist these specific fields to local storage
            partialize: (state) => ({
                translations: state.translations,
                currencies: state.currencies,
                currentLang: state.currentLang,
                translationVersion: state.translationVersion,
                currencyVersion: state.currencyVersion,
            }),
        }
    )
);