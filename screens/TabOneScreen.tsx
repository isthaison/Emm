import { database, auth, storage } from "firebase";
import * as React from "react";
import { Button, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from "react-native";
import { GiftedChat, IMessage, Actions } from "react-native-gifted-chat";
import * as ImagePicker from "expo-image-picker";
import { Text, View } from "@components/Themed";
import { TabOneScreenProps } from "@models/navigation";
import { Store } from "@hooks/Store";
import { uploadImageAsync } from "@hooks/useStorecloud";
import { sendPushNotification } from "@hooks/useNotification";
export default React.memo(function TabOneScreen({}: TabOneScreenProps) {
  const { me, s2 } = React.useContext(Store);

  const [messages, setmessages] = React.useState<IMessage[]>([]);
  const [online, setonline] = React.useState<string>("offline");
  const [token, settoken] = React.useState<string>("");

  function _onSend(mess: IMessage[] = []) {
    for (let i = 0; i < mess.length; i++) {
      delete mess[i]["_id"];
      append(mess[i]);
    }
    push(mess[0]);
  }

  function ref() {
    return database().ref("message").child([me?.uid, s2].sort().join(""));
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
    if (user._id !== me?.uid) {
      me?.uid && database().ref("friend").child(me?.uid).child(user._id).set(user);
    }
    return message;
  };

  function on(callback: (mess: any) => void) {
    return ref()
      .limitToLast(20)
      .on("child_added", (snapshot) => callback(parse(snapshot)));
  }
  function push(m: IMessage) {
    console.log(online);
    console.log(token);
    if (online === "offline" && token != "") {
      sendPushNotification(token, m);
    }
  }

  React.useEffect(() => {
    if (s2 && me) {
      on((m) =>
        setmessages((previousMessages) =>
          GiftedChat.append(previousMessages, m)
        )
      );
      const refStatus = database().ref("/status/" + s2);
      const refToken = database().ref("/token/" + s2);
      refStatus.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setonline(data.state);
        }
      });
      refToken.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          settoken(data);
        }
      });
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
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar/>
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
      </SafeAreaView>
    );
  }
});

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
