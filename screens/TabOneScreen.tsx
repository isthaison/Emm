import { database, auth, storage } from "firebase";
import * as React from "react";
import { Button, StyleSheet } from "react-native";
import { GiftedChat, IMessage, Actions } from "react-native-gifted-chat";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import { Text, View } from "@components/Themed";
import { TabOneScreenProps } from "@models/navigation";
import uuid from "uuid";
import { useFocusEffect } from "@react-navigation/native";
import { Store } from "@hooks/Store";
export default React.memo(function TabOneScreen({}: TabOneScreenProps) {
  const { me, s2 } = React.useContext(Store);

  const [messages, setmessages] = React.useState<IMessage[]>([]);

  function _onSend(mess: IMessage[] = []) {
    for (let i = 0; i < mess.length; i++) {
      delete mess[i]["_id"];
      append(mess[i]);
    }
  }

  function ref() {
    return database().ref("message/" + [me?.uid, s2].sort().join("") + "/");
  }

  const append = (message: any) => {
    message["timestamp"] = database.ServerValue.TIMESTAMP;
    ref()
      .push(message)
      .then((err) => {
        console.log(err);
      })
      .catch((ee) => console.log(ee));
  };

  const parse = (snapshot: database.DataSnapshot) => {
    const { text, user, image, timestamp } = snapshot.val();
    const { key: _id } = snapshot;
    const message = {
      _id,
      text,
      user,
      image,
      timestamp: new Date(timestamp),
    };
    return message;
  };

  function on(callback: (mess: any) => void) {
    return ref()
      .limitToLast(20)
      .on("child_added", (snapshot) => callback(parse(snapshot)));
  }
  function off() {
    ref().off();
  }

  function setupHighscoreListener() {
    database()
      .ref("/status/")
      .orderByChild("uid")
      .equalTo("SdEcEojq03f7xsGP4cPJHlPdyCR2")
      .on("value", (snapshot) => {
        const data = snapshot.val();

        if (data) {
        }
      });
  }

  React.useEffect(() => {
    if (s2 && me) {
      setupHighscoreListener();
      on((m) =>
        setmessages((previousMessages) =>
          GiftedChat.append(previousMessages, m)
        )
      );
    }
  }, [s2, me]);

  const _Library = async () => {
    try {
      let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,

        quality: 1,
      });
      if (!result.cancelled && me) {
        const urifirestore = await uploadImageAsync(result.uri);
        const mess: IMessage = {
          _id: new Date().getTime(),
          user: {
            _id: me.uid,
            avatar: me.photoURL ? me.photoURL : "",
            name: me.displayName ? me.displayName : "",
          },
          image: urifirestore,
          createdAt: new Date(),
          text: "",
        };
        append(mess);
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };
  if (!me || !s2) {
    return (
      <Text
        style={{
          fontSize: 80,
          textAlign: "center",
          textAlignVertical: "center",
          flex: 1,
        }}
      >
        🌼
      </Text>
    );
  } else {
    return (
      <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={_onSend}
          inverted
          user={{
            _id: me.uid,
            avatar: me.photoURL ? me.photoURL : "",
            name: me.displayName ? me.displayName : "",
          }}
          renderActions={() => (
            <Actions
              options={{
                "Choose From Library": _Library,
                Cancel: () => {
                  console.log("Cancel");
                },
              }}
              optionTintColor="#222B45"
            />
          )}
        />
      </View>
    );
  }
});

async function uploadImageAsync(uri: string) {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const ref = storage().ref().child(uuid.v4());
  const snapshot = await ref.put(blob);

  // We're done with the blob, close and release it
  return await snapshot.ref.getDownloadURL();
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
