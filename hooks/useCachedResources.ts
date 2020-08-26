import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { initializeApp } from 'firebase';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
          ...AntDesign.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });

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

        initializeApp(firebaseConfig);
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
