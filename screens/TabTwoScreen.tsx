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
  AsyncStorage,
} from "react-native";
import * as firebase from "firebase";
import * as Facebook from "expo-facebook";
import QRCode from "react-native-qrcode-svg";
import { BarCodeScanner, BarCodeEvent } from "expo-barcode-scanner";

import { Text, View, useThemeColor, Icon, TextInput } from "@components/Themed";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@constants/Colors";
import { Store } from "@hooks/Store";
type F = {};
async function _storeDatas2s(users: object[]) {
  try {
    await AsyncStorage.setItem("@EmmStore:s2s", JSON.stringify(users));
    return true;
  } catch (error) {
    // Error saving data
    return false;
  }
}

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
    await Facebook.initializeAsync("769595773610249");

    const facebookResult = await Facebook.logInWithReadPermissionsAsync({
      permissions: ["public_profile"],
    });

    if (facebookResult.type === "success") {
      const credential = firebase.auth.FacebookAuthProvider.credential(
        facebookResult.token
      );

      firebase
        .auth()
        .signInWithCredential(credential)
        .catch((error) => {});
    }
  }

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [hasPermission, setHasPermission] = React.useState<boolean>(false);
  const [value, onChangeText] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarCodeEvent) => {
    _storeData(data);
    dispatchStore && dispatchStore({ s2: data });
    if (data.length > 20) {
      setModalVisible(false);
    }
  };

  const _add = () => {
    _storeData(value);
    dispatchStore && dispatchStore({ s2: value });
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
          <Image
            style={styles.avatar}
            source={{ uri: me.photoURL ? me.photoURL : "" }}
          />
          <Text onPress={_coppier} style={styles.name}>
            {me.displayName}
          </Text>
          <Icon onPress={() => setModalVisible(true)} name="qrcode" size={32} />
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 3 }}
          >
            <TextInput
              placeholder="uid"
              onChangeText={(text) => onChangeText(text)}
              value={value === "" ? me.uid : value}
            />
            <Icon onPress={_add} name="team" size={32} />
          </View>
        </View>
      )}
      {!me && <Button title="Facebook" onPress={loginWithFacebook} />}

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
