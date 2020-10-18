import * as React from "react";
import {
  StyleSheet,
  Button,
  TouchableOpacity,
  Clipboard,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
  TouchableNativeFeedback,
  AsyncStorage,
  FlatList,
} from "react-native";
import * as firebase from "firebase";
import * as Facebook from "expo-facebook";
import QRCode from "react-native-qrcode-svg";
import { BarCodeScanner, BarCodeEvent } from "expo-barcode-scanner";
import { User } from "react-native-gifted-chat";

import { Text, View, useThemeColor, Icon, TextInput } from "components/Themed";
import { Store } from "hooks/Store";

async function _storeData(uid: string) {
  try {
    await AsyncStorage.setItem("@EmmStore:s2", uid);
    return true;
  } catch (error) {
    // Error saving data
    return false;
  }
}

export default function TabOneScreen() {
  const { dispatchStore, me, s2 } = React.useContext(Store);

  const [s2s, sets2s] = React.useState<User[]>([]);

  React.useEffect(() => {
    me?.uid &&
      firebase
        .database()
        .ref("friend")
        .child(me?.uid)
        .limitToLast(200)
        .on("value", (snapshot) => {
          const _l: User[] = [];
          const data = snapshot.val();
          if (data) {
            for (const [key, value] of Object.entries(data)) {
              console.log(`${key}: ${value}`);
              _l.push(value as User);
            }
          }
          sets2s(_l);
        });
  }, []);

  const _addpress = (s: string) => {
    _storeData(s);
    dispatchStore && dispatchStore({ s2: s });
  };

  return (
    <FlatList
      data={s2s}
      keyExtractor={(item, index) => item._id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            _addpress(item._id.toString());
          }}
          style={{ flexDirection: "row", margin: 4 }}
        >
          <Image
            style={{
              height: 60,
              width: 60,
              borderRadius: 40,
              borderWidth: 1,
            }}
            source={{
              uri: typeof item.avatar === "string" ? item.avatar : "",
            }}
          />
          <View
            style={{
              marginLeft: 6,
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text style={{ fontSize: 8 }}>{item._id}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  avatar: {
    height: 180,
    width: 180,
    borderRadius: 140,
    borderWidth: 1,
  },
  name: {
    fontSize: 32,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
