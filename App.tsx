import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as firebase from "firebase";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";


const firebaseConfig = {
  apiKey: "AIzaSyCJwI19FUPkcEZqcgTk59o-Z5gT5O45zQU",
  authDomain: "nson-276306.firebaseapp.com",
  databaseURL: "https://nson-276306.firebaseio.com",
  projectId: "nson-276306",
  storageBucket: "nson-276306.appspot.com",
  messagingSenderId: "369740818318",
  appId: "1:369740818318:web:9cf65a10d34fac42c426df",
  measurementId: "G-HTDZN5L3D6",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}



export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
