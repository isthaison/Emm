import { database } from "firebase";
import * as React from "react";
import { Button, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

import { Text, View } from "@components/Themed";
import { MessageScreenProps } from "@models/navigation";

export default function TabOneScreen({ route }: MessageScreenProps) {
  const { id } = route.params;
  const [list, setlist] = React.useState<IMessage[]>([]);
  const [messages, setmessages] = React.useState([]);

  function _onSend(mess = []) {
    setmessages(messages.concat(mess));
    storeHighScore(mess);
  }
  function storeHighScore(mess: object) {
    database()
      .ref("message/" + id)
      .push(mess)
      .catch((e) => {
        console.log(e);
      });
  }
  function setupHighscoreListener() {
    database()
      .ref("message/" + id)
      .limitToLast(200)
      .on("value", (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        if (data) {
          const _list: IMessage[] = [];
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === "object")
              _list.push({
                key,
                ...(value as any),
              });
          }
          console.log(_list);
          setlist(_list);
        }
      });
  }

  React.useEffect(() => {
    setupHighscoreListener();
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat messages={messages} onSend={_onSend} />
    </View>
  );
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
