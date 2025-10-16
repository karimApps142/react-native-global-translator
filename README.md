# React Native Global Translator

![NPM Version](https://img.shields.io/npm/v/react-native-global-translator)
![License](https://img.shields.io/npm/l/react-native-global-translator)
![Downloads](https://img.shields.io/npm/dw/react-native-global-translator)

A client-side library for React Native that provides seamless integration with a **Dynamic Global Language and Currency Management System**. Built with Zustand for lightweight and powerful state management, this package handles all the complexity of fetching, caching, and updating translations automatically.

---

## 🚀 Features

- **Dynamic Translations:** Fetch all UI text directly from your central backend.
- **Automatic Syncing:** Automatically checks for new translation versions on app launch and syncs if needed.
- **Persistent Caching:** Uses AsyncStorage to cache translations, ensuring instant load times and offline availability.
- **Lightweight State Management:** Powered by Zustand for a minimal footprint and a simple, hook-based API.
- **Centralized Management:** All text is controlled from one web panel—no need for app updates to change a label.
- **Simple API:** Get started in minutes with a single `init` function and one simple hook.

---

## ⚙️ Prerequisites

> **Important!**
> This package is the **client-side component** and is **useless** without a compatible backend system. You must have an account and an API key from the management platform.

Your backend will provide you with:

1. An **API URL**.
2. An **API Key** for your mobile application.

---

## 📦 Installation

```bash
# Using npm
npm install react-native-global-translator @react-native-async-storage/async-storage

# Using Yarn
yarn add react-native-global-translator @react-native-async-storage/async-storage

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
  apiUrl: "https://api.globalize.karimapps.com/api/v1", // <-- Your backend API URL
  apiKey: "YOUR_SECURE_API_KEY_HERE", // <-- Your app's unique API Key
  defaultLanguage: "en", // Optional: fallback language
  fetchCurrencies: false, // Optional: set to true to enable currency fetching
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

# Handling RTL (Right-to-Left) Layouts

This guide provides a complete, step-by-step process for implementing automatic Right-to-Left (RTL) layout switching in your React Native application using the `react-native-global-translator` package.

Languages such as Arabic (`ar`), Urdu (`ur`), and Hebrew (`he`) are read from right to left. For a truly native user experience, your app's entire layout must flip to accommodate this.

React Native uses the native `I18nManager` module to control layout direction.

> **⚠️ Important:** Changing the layout direction with `I18nManager.forceRTL()` requires a **full application restart** to take effect. The following code handles this gracefully.

Place this logic in a top-level component, like `App.js`, so it runs once when the app's language state changes.

```javascript
// A good place for this is your root navigator or App.js

import React, { useEffect } from "react";
import { I18nManager, Alert } from "react-native";
import { useLocalization } from "react-native-global-translator";
import * as Updates from "expo-updates"; // For Expo apps

// If not using Expo, you might use a library like 'react-native-restart'.
// import RNRestart from 'react-native-restart';

export default function AppLayout() {
  const { isRTL } = useLocalization();

  useEffect(() => {
    // Compare the app's current layout direction with our state.
    if (I18nManager.isRTL !== isRTL) {
      // If they don't match, force the new layout direction.
      I18nManager.forceRTL(isRTL);

      // Show a confirmation alert and then reload the app to apply the changes.
      Alert.alert(
        "Language Change",
        "The app needs to restart to apply the new language direction.",
        [{ text: "OK", onPress: () => Updates.reloadAsync() }] // For Expo
        // [{ text: 'OK', onPress: () => RNRestart.Restart() }] // For non-Expo
      );
    }
  }, [isRTL]); // This effect runs ONLY when the isRTL flag changes.

  // ... return your app's navigation or main screen
  return <YourAppNavigation />;
}
```

## Writing RTL-Friendly Styles

Write your component styles so they automatically adapt to the layout direction.

### The Golden Rule: Use `start` and `end`

React Native's layout engine (Yoga) understands **logical properties**. Always prefer these over absolute `left` and `right` properties.

| Do This 👍 (Logical) | Don't Do This 👎 (Absolute) | Why?                                                                    |
| :------------------- | :-------------------------- | :---------------------------------------------------------------------- |
| `marginStart: 10`    | `marginLeft: 10`            | `marginStart` is "left" in LTR and "right" in RTL.                      |
| `marginEnd: 10`      | `marginRight: 10`           | `marginEnd` is "right" in LTR and "left" in RTL.                        |
| `paddingStart: 10`   | `paddingLeft: 10`           | `paddingStart` is "left" in LTR and "right" in RTL.                     |
| `borderEndWidth: 1`  | `borderRightWidth: 1`       | The border will be on the correct side automatically.                   |
| `textAlign: 'start'` | `textAlign: 'left'`         | Text will align to the start of the line (left for LTR, right for RTL). |

### Handling Exceptions

Some styles don't have logical equivalents and must be handled manually using the `isRTL` flag.

#### `flexDirection`

`flexDirection: 'row'` always lays out items from left to right. To flip the order of items in RTL, you must explicitly use `row-reverse`.

```jsx
const { isRTL } = useLocalization();
//...
<View style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
  <Text>First Item</Text>
  <Text>Second Item</Text>
</View>;
```

#### Directional Icons

Icons like back arrows or chevrons need to be flipped horizontally.

```jsx
import { Feather } from "@expo/vector-icons";
//...
const { isRTL } = useLocalization();
//...
<Feather
  name="arrow-left"
  size={24}
  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
/>;
```

## 🧠 API Reference

The `useLocalization()` hook returns an object with the following properties:

| **Name**      | **Type**   | **Description**                                                                                                  |
| ------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `t`           | `function` | The translation function. Takes a string key (e.g., `'buttons.submit'`).                                         |
| `status`      | `string`   | The current state of the store: `'idle'`, `'loading'`, `'ready'`, `'error'`.                                     |
| `currentLang` | `string`   | The currently active language code (e.g., `'en'`, `'es'`).                                                       |
| `setLanguage` | `function` | Function to switch the language. Example: `setLanguage('es')`.                                                   |
| `currencies`  | `object`   | The object containing currency data, if fetchCurrencies was enabled.                                             |
| `isRTL`       | `boolean`  | Indicates whether the current language is a right-to-left (RTL) language. Useful for adjusting layout direction. |

---

## 🌍 Managing Your Translations

To get started, you first need an account on the management platform. Registration is handled by a Super Admin to ensure security.

- **Platform URL:** [https://globalize.karimapps.com](https://globalize.karimapps.com)

> ⚠️ **Note:** Please visit the main platform and contact the administrator for account setup. Once you have an account, you can log in to the admin panel to manage all your apps, languages, and translations.

- **Admin Panel Login:** [https://globalize.karimapps.com/admin](https://globalize.karimapps.com/admin)

## 🪪 License

This project is licensed under the **MIT License**.
