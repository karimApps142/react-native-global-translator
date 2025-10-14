# React Native Global Translator

![NPM Version](https://img.shields.io/npm/v/react-native-global-translator)
![License](https://img.shields.io/npm/l/react-native-global-translator)
![Downloads](https://img.shields.io/npm/dw/react-native-global-translator)

A client-side library for React Native that provides seamless integration with the **Dynamic Global Language and Currency Management System**.  
Built with Zustand for lightweight and powerful state management, this package handles all the complexity of fetching, caching, and updating translations automatically.

---

## 🚀 Features

- **Dynamic Translations:** Fetch all UI text directly from your central Laravel backend.
- **Automatic Syncing:** Automatically checks for new translation versions on app launch and syncs if needed.
- **Persistent Caching:** Uses AsyncStorage to cache translations, ensuring instant load times and offline availability.
- **Lightweight State Management:** Powered by Zustand for a minimal footprint and a simple, hook-based API.
- **Centralized Management:** All text is controlled from one web panel — no need for app updates to change a label.
- **Simple API:** Get started in minutes with a single `init` function and one simple hook.

---

## ⚙️ Prerequisites

> **Important!**  
> This package is the **client-side component** and is **useless** without the corresponding Laravel backend system.  
> You must have the [Dynamic Global Language and Currency Management System](https://github.com/your-repo/laravel-global-translator-backend) set up and running.

Your backend will provide you with:

1. An **API URL**
2. An **API Key** for your mobile application

---

## 📦 Installation

```bash
yarn add react-native-global-translator

npm install @react-native-async-storage/async-storage

```

## 🧩 How to Use

### Step 1: Initialize the Service

At the root of your application (typically in `App.js` or `index.js`), call the `initLocalization` function **once**.  
This should be done **before** your main app component renders.

```js
// App.js
import React from "react";
import { initLocalization } from "react-native-global-translator";
import YourAppNavigation from "./src/YourAppNavigation";

// Initialize the service at startup
initLocalization({
  apiUrl: "https://api.global.karimapps.com/api/v1", // <-- Your backend API URL
  apiKey: "YOUR_SECURE_API_KEY_HERE", // <-- Your app's unique API Key
  defaultLanguage: "en", // Optional: fallback language
});

const App = () => {
  return <YourAppNavigation />;
};

export default App;
```

### Step 2: Use the Hook in Your Components

In any component, use the `useLocalization` hook to access the translation function (`t`) and the current system status.

```js
// src/screens/HomeScreen.js
import React from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalization } from "react-native-global-translator";

const HomeScreen = () => {
  const { t, status, currentLang, setLanguage } = useLocalization();

  // Show a loading indicator while fetching initial data
  if (status !== "ready") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.welcome_message")}</Text>
      <Button title={t("buttons.submit")} onPress={() => alert("Action!")} />

      <View style={styles.languageSwitcher}>
        <Text>Current Language: {currentLang}</Text>
        <Button title="Switch to Spanish" onPress={() => setLanguage("es")} />
        <Button title="Switch to English" onPress={() => setLanguage("en")} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  languageSwitcher: {
    marginTop: 50,
  },
});

export default HomeScreen;
```

## 🧠 API Reference

The `useLocalization()` hook returns an object with the following properties:

| **Name**      | **Type**   | **Description**                                                              |
| ------------- | ---------- | ---------------------------------------------------------------------------- |
| `t`           | `function` | The translation function. Takes a string key (e.g., `'buttons.submit'`).     |
| `status`      | `string`   | The current state of the store: `'idle'`, `'loading'`, `'ready'`, `'error'`. |
| `currentLang` | `string`   | The currently active language code (e.g., `'en'`, `'es'`).                   |
| `setLanguage` | `function` | Function to switch the language. Example: `setLanguage('es')`.               |

---

## 🌍 Managing Your Translations

All **languages**, **currencies**, **translation keys**, and **translated values** are managed through your centralized web-based **admin panel**.

- **Admin Panel Login:** [https://global.karimapps.com/admin](https://global.karimapps.com/admin)
- **Manage Translations:** [https://global.karimapps.com/admin/translation-keys](https://global.karimapps.com/admin/translation-keys)
- **Manage Languages:** [https://global.karimapps.com/admin/languages](https://global.karimapps.com/admin/languages)

> ⚠️ **Note:** Registration for new admin users is a protected action.  
> Please contact system administrator to create an account.

## 🪪 License

This project is licensed under the **MIT License**.
