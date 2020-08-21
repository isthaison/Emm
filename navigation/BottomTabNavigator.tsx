import * as React from "react";

import Colors from "@constants/Colors";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as firebase from "firebase";
import useColorScheme from "@hooks/useColorScheme";
import {
  BottomTabParamList,
  TabOneParamList,
  TabTwoParamList,
} from "@models/navigation";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import TabOneScreen from "@screens/TabOneScreen";
import TabTwoScreen from "@screens/TabTwoScreen";
import { AsyncStorage } from "react-native";
import { Store } from "@hooks/Store";

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
          // If we're not currently connected, don't do anything.
          if (snapshot.val() == false) {
            return;
          }

          // If we are currently connected, then use the 'onDisconnect()'
          // method to add a set which will only trigger once this
          // client has disconnected by closing the app,
          // losing internet, or any other means.
          userStatusDatabaseRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(function () {
              // The promise returned from .onDisconnect().set() will
              // resolve as soon as the server acknowledges the onDisconnect()
              // request, NOT once we've actually disconnected:
              // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

              // We can now safely set ourselves as 'online' knowing that the
              // server will mark us as offline once we lose connection.
              userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
    }
  }

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
