// src/store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureApiClient, fetchSyncVersions, fetchTranslations, fetchCurrencies } from './api';

export const useLocalizationStore = create(
    persist(
        (set, get) => ({
            // STATE (no changes needed here)
            status: 'idle',
            translations: {},
            currencies: {},
            currentLang: 'en',
            translationVersion: 0,
            currencyVersion: 0,
            shouldFetchCurrencies: false,

            // ACTIONS (all logic is refactored here)
            init: async ({ apiUrl, apiKey, defaultLanguage = 'en', fetchCurrencies: enableCurrencies = false }) => {
                if (!apiUrl || !apiKey) {
                    console.error('Localization Error: apiUrl and apiKey must be provided.');
                    return set({ status: 'error' });
                }
                configureApiClient(apiUrl, apiKey);

                set({ shouldFetchCurrencies: enableCurrencies });

                // On init, if a language isn't set, use the default.
                if (!get().currentLang) {
                    set({ currentLang: defaultLanguage });
                }

                // Always run fetchAndSync on startup.
                get().fetchAndSync();
            },

            fetchAndSync: async () => {
                set({ status: 'loading' });

                const langToFetch = get().currentLang;
                const localVersion = get().translationVersion;

                // Guard against fetching without a language
                if (!langToFetch) {
                    console.error('Localization Error: No language selected.');
                    return set({ status: 'error' });
                }

                try {
                    const { data: serverVersions } = await fetchSyncVersions();

                    // **CRITICAL FIX**: Check if a fetch is needed for EITHER a version mismatch OR because the current translations are for a different language.
                    const needsFetch = serverVersions.translation_version > localVersion || Object.keys(get().translations).length === 0;

                    if (needsFetch) {
                        console.log(`Fetching translations for '${langToFetch}' from server...`);
                        const { data: newTranslations } = await fetchTranslations(langToFetch);

                        let newCurrencies = get().currencies;
                        if (get().shouldFetchCurrencies) {
                            console.log("Currency fetching is enabled. Fetching from server...");
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
                        console.log('Translations are up to date.');
                        // This is crucial: if we don't fetch, we must still ensure the status is ready.
                        set({ status: 'ready' });
                    }
                } catch (error) {
                    console.error(`Failed to sync localization for '${langToFetch}':`, error);
                    set({ status: 'error' });
                }
            },

            // **REFACTORED setLanguage**
            setLanguage: (langCode) => {
                const { currentLang, status } = get();

                if (currentLang === langCode || status === 'loading') {
                    return;
                }

                // 1. Set the new language.
                // 2. CRUCIALLY, reset the translationVersion to 0. This FORCES fetchAndSync to see a version mismatch and fetch new data.
                // 3. Clear the old translations to prevent showing stale data.
                set({ currentLang: langCode, translationVersion: 0, translations: {} });

                // 4. Delegate all fetching and state setting to our single, robust function.
                get().fetchAndSync();
            },
        }),
        {
            // CONFIG for PERSISTENCE (no changes needed here)
            name: 'localization-storage',
            storage: createJSONStorage(() => AsyncStorage),
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