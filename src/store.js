// src/store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureApiClient, fetchSyncVersions, fetchTranslations, fetchCurrencies } from './api';

const rtlLanguages = ['ar', 'ur', 'he', 'fa', 'yi'];

export const useLocalizationStore = create(
    persist(
        (set, get) => ({
            // STATE
            status: 'idle', // 'idle', 'loading', 'ready', 'error'
            translations: {},
            currencies: {},
            currentLang: 'en',
            isRTL: false,
            translationVersion: 0,
            currencyVersion: 0,
            shouldFetchCurrencies: false,

            // ACTIONS
            init: ({ apiUrl, apiKey, defaultLanguage = 'en', fetchCurrencies: enableCurrencies = false }) => {
                // The init function's ONLY job is to configure the store.
                // It should not trigger any async operations, as that's the job of the rehydration logic.
                if (!apiUrl || !apiKey) {
                    console.error('Localization Error: apiUrl and apiKey must be provided.');
                    return set({ status: 'error' });
                }
                configureApiClient(apiUrl, apiKey);

                // Set configuration state.
                set({
                    shouldFetchCurrencies: enableCurrencies,
                    // Set the default language only if no language is already set (for the very first launch).
                    currentLang: get().currentLang || defaultLanguage,
                });
            },

            fetchAndSync: async () => {
                // This is the single, authoritative function for fetching data.
                const { currentLang, translationVersion, shouldFetchCurrencies } = get();

                // Guard against running without a language.
                if (!currentLang) {
                    console.error('Localization Error: No language available to fetch.');
                    return set({ status: 'error' });
                }

                set({ status: 'loading' });

                try {
                    const { data: serverVersions } = await fetchSyncVersions();

                    // The logic for needing a fetch is simple: the server version is newer.
                    // This works for app startup, stale data, AND language switches (because we reset the version to 0).
                    const needsTranslationsFetch = serverVersions.translation_version > translationVersion;

                    if (needsTranslationsFetch) {
                        const { data: newTranslations } = await fetchTranslations(currentLang);

                        let newCurrencies = get().currencies;
                        if (shouldFetchCurrencies) {
                            const { data } = await fetchCurrencies();
                            newCurrencies = data;
                        }

                        set({
                            translations: newTranslations,
                            currencies: newCurrencies,
                            translationVersion: serverVersions.translation_version,
                            currencyVersion: serverVersions.currency_version,
                            status: 'ready',
                        });
                    } else {
                        // If we don't need to fetch, the data is already up-to-date from AsyncStorage.
                        set({ status: 'ready' });
                    }
                } catch (error) {
                    console.error(`Failed to sync localization for '${currentLang}':`, error);
                    set({ status: 'error' });
                }
            },

            setLanguage: (langCode) => {
                const { currentLang, status } = get();

                if (currentLang === langCode || status === 'loading') {
                    return;
                }

                const isRTL = rtlLanguages.includes(langCode);
                // The setLanguage function's ONLY job is to update the state and trigger a fetch.
                // 1. Set the new language.
                // 2. Clear old translations to prevent showing stale data.
                // 3. Reset translationVersion to 0. This is the KEY that tells fetchAndSync it MUST fetch new data.
                set({ currentLang: langCode, translations: {}, translationVersion: 0, isRTL: isRTL });

                // 4. Delegate all fetching logic to our single, robust function.
                get().fetchAndSync();
            },
        }),
        {
            // CONFIG for PERSISTENCE
            name: 'localization-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                translations: state.translations,
                currencies: state.currencies,
                currentLang: state.currentLang,
                isRTL: state.isRTL,
                translationVersion: state.translationVersion,
                currencyVersion: state.currencyVersion,
            }),

            // This is the gatekeeper that prevents startup race conditions.
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('Failed to rehydrate localization store:', error);
                } else {
                    // This runs only ONCE after the state has been loaded from AsyncStorage.
                    // Now it is safe to perform the initial data fetch.
                    useLocalizationStore.getState().fetchAndSync();
                }
            },
        }
    )
);