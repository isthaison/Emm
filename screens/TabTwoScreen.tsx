import * as React from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
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

import { Text, View, useThemeColor, Icon } from "@components/Themed";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@constants/Colors";
import { Store } from "@hooks/Store";
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

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarCodeEvent) => {
    _storeData(data);
    dispatchStore && dispatchStore({ s2: data });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <SafeAreaView style={styles.container}>
      {me && (
        <View style={{ alignItems: "center" }}>
          <Image
            style={styles.avatar}
            source={{ uri: me.photoURL ? me.photoURL : "" }}
          />
          <Text style={styles.name}>{me.displayName}</Text>
          <Icon onPress={() => setModalVisible(true)} name="qrcode" size={32} />
          <Text>{s2}</Text>
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
    </SafeAreaView>
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
