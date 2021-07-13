import * as React from "react";

import Colors from "constants/Colors";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as firebase from "firebase";
import 'firebase/database';
import 'firebase/auth';

import useColorScheme from "hooks/useColorScheme";
import {
  BottomTabParamList,
  TabOneParamList,
  TabTwoParamList,
} from "models/navigation";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { createStackNavigator } from "@react-navigation/stack";
import TabOneScreen from "screens/TabOneScreen";
import TabTwoScreen from "screens/TabTwoScreen";
import ChatScreen from "screens/ChatScreen";
import {  AppState, AppStateStatus } from "react-native";
import { Store } from "hooks/Store";
import { registerForPushNotificationsAsync } from "hooks/useNotification";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const { dispatchStore } = React.useContext(Store);

  React.useEffect(() => {
    const currentUser: firebase.User | null = firebase.auth().currentUser;
    status(currentUser);
    firebase.auth().onAuthStateChanged((user) => {
      if (user != null) {
        console.log("We are authenticated now!");
        status(user);
        dispatchStore && dispatchStore({ me: user });
      }
    });
    _retrieveData();
  }, []);

  async function _retrieveData() {
    try {
      const value = await AsyncStorage.getItem("@EmmStore:s2");
      if (value) {
        dispatchStore && dispatchStore({ s2: value });
      }
    } catch (error) {}
  }

  function status(currentUser: firebase.User | null) {
    if (currentUser) {
      registerForPushNotificationsAsync()
        .then((token) => {
          firebase
            .database()
            .ref("token/" + currentUser.uid)
            .set(token);
        })
        .catch((err) => alert(err));
      dispatchStore && dispatchStore({ me: currentUser });

      const { uid } = currentUser;
      var userStatusDatabaseRef = firebase.database().ref("/status/" + uid);

      var isOfflineForDatabase = {
        state: "offline",
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        uid,
      };

      var isOnlineForDatabase = {
        state: "online",
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        uid,
      };

      firebase
        .database()
        .ref(".info/connected")
        .on("value", function (snapshot) {
          if (snapshot.val() == false) {
            return;
          }

          userStatusDatabaseRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(function () {
              userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
    }
  }

  React.useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
      const currentUser: firebase.User | null = firebase.auth().currentUser;
      if (currentUser) {
        const { uid } = currentUser;
        var userStatusDatabaseRef = firebase.database().ref("/status/" + uid);

        var isOfflineForDatabase = {
          state: "offline",
          last_changed: firebase.database.ServerValue.TIMESTAMP,
          uid,
        };

        userStatusDatabaseRef.set(isOfflineForDatabase);
      }
    };
  }, []);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    const currentUser: firebase.User | null = firebase.auth().currentUser;
    if (currentUser) {
      const { uid } = currentUser;
      var userStatusDatabaseRef = firebase.database().ref("/status/" + uid);

      var isOfflineForDatabase = {
        state: "offline",
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        uid,
      };

      var isOnlineForDatabase = {
        state: "online",
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        uid,
      };
      if (nextAppState === "active") {
        userStatusDatabaseRef.set(isOnlineForDatabase);
      } else {
        userStatusDatabaseRef.set(isOfflineForDatabase);
      }
    }
  };

  return (
    <BottomTab.Navigator
      initialRouteName="TabOne"
      tabBarOptions={{
        allowFontScaling: true,
        showLabel: false,
        keyboardHidesTabBar: true,
      }}
    >
      <BottomTab.Screen
        name="TabOne"
        component={TabOneNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="chat-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="TabTwo"
        component={TabTwoNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="face-profile"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

const TabOneStack = createStackNavigator<TabOneParamList>();

function TabOneNavigator() {
  return (
    <TabOneStack.Navigator>
      <TabOneStack.Screen
        name="TabOneScreen"
        component={TabOneScreen}
        options={{ header: () => null }}
      />
       <TabOneStack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ header: () => null }}
      />
    </TabOneStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<TabTwoParamList>();

function TabTwoNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="TabTwoScreen"
        component={TabTwoScreen}
        options={{ header: () => null }}
      />
    </TabTwoStack.Navigator>
  );
}
