import * as React from "react";
import {
  StyleSheet,
  Button,

  Image,

  Modal,

  TouchableNativeFeedback,

} from "react-native";
import * as firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
import * as Facebook from "expo-facebook";
import QRCode from "react-native-qrcode-svg";
import { BarCodeScanner, BarCodeEvent } from "expo-barcode-scanner";
import { User } from "react-native-gifted-chat";

import { Text, View, useThemeColor, Icon, TextInput } from "components/Themed";
import { Store } from "hooks/Store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";


async function _storeData(uid: string) {
  try {
    await AsyncStorage.setItem("@EmmStore:s2", uid);
    return true;
  } catch (error) {
    // Error saving data
    return false;
  }
}

export default function TabTwoScreen() {
  const { dispatchStore, me, s2 } = React.useContext(Store);
  async function loginWithFacebook() {
    await Facebook.initializeAsync({ appId: "508641377049985", appName: 'Emm', version: '' });

    const facebookResult = await Facebook.logInWithReadPermissionsAsync({
      permissions: ["public_profile", ""],
    });

    console.log(facebookResult);


    if (facebookResult.type === "success") {
      const credential = firebase.auth.FacebookAuthProvider.credential(
        facebookResult.token
      );

      firebase
        .auth()
        .signInWithCredential(credential)
        .catch((error) => {
          console.log(error);

        });
    }
  }

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [hasPermission, setHasPermission] = React.useState<boolean>(false);
  const [value, onChangeText] = React.useState("");
  const [s2s, sets2s] = React.useState<User[]>([]);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
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
  React.useEffect(() => {
    s2 && onChangeText(s2);
  }, [s2]);

  const handleBarCodeScanned = ({ type, data }: BarCodeEvent) => {
    _storeData(data);
    dispatchStore && dispatchStore({ s2: data });
    firebase
      .database()
      .ref("friend")
      .child(me ? me?.uid : "")
      .child(data)
      .set({
        _id: data,
      });
    if (data.length > 20) {
      setModalVisible(false);
    }
  };

  const _add = () => {
    _storeData(value);
    dispatchStore && dispatchStore({ s2: value });

    firebase
      .database()
      .ref("friend")
      .child(me ? me?.uid : "")
      .child(value)
      .set({
        _id: value,
      });
  };
  const _addpress = (s: string) => {
    _storeData(s);
    dispatchStore && dispatchStore({ s2: s });
  };
  const _coppier = () => {
    Clipboard.setString(me?.uid ? me?.uid : "");
  };
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      {me && (
        <View style={{ alignItems: "center" }}>
          <TouchableNativeFeedback onPress={_coppier}>
            <Image
              style={styles.avatar}
              source={{ uri: me.photoURL ? me.photoURL : "" }}
            />
          </TouchableNativeFeedback>

          <Text onPress={_coppier} style={styles.name}>
            {me.displayName}
          </Text>
          <Icon
            onPress={() => setModalVisible(true)}
            name="qrcode"
            size={32}
          />
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 3 }}
          >
            <TextInput
              placeholder="uid"
              onChangeText={(text) => onChangeText(text)}
              value={value}
            />
            <Icon onPress={_add} name="team" size={32} />
          </View>
        </View>

      )}

      {!me &&
        <View style={{ paddingHorizontal: '10%' }}>
          <Button title="Facebook" onPress={loginWithFacebook} />

        </View>

      }

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}></View>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={[
            StyleSheet.absoluteFillObject,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          {me && (
            <QRCode backgroundColor="transparent" value={me.uid} size={200} />
          )}
        </BarCodeScanner>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
