import { database, auth } from "firebase";
import * as React from "react";
import { Button, StyleSheet, FlatList } from "react-native";
import { Text, View } from "@components/Themed";
import { TabOneScreenProps } from "@models/navigation";
import { TouchableNativeFeedback } from "react-native-gesture-handler";

type Room = {
  name: string;
  key: string;
  room: string;
};
export default function TabOneScreen({ navigation }: TabOneScreenProps) {
  const [list, setlist] = React.useState<Room[]>([]);

  function storeHighScore() {
    database()
      .ref("conversation")
      .push({
        name: "test",
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function setupHighscoreListener(userId: string) {
    console.log("setupHighscoreListener");

    database()
      .ref("conversation")
      .limitToLast(200)
      .on("value", (snapshot: database.DataSnapshot) => {
        console.log(snapshot);
        const data = snapshot.val();
        console.log(data);
        if (data) {
          const _list: Room[] = [];
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
    setupHighscoreListener("isthaison");
    storeHighScore();

    console.log();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        renderItem={({ item }) => (
          <TouchableNativeFeedback
            onPress={() => {
              navigation.navigate("MessageScreen", { id: item.key });
            }}
          >
            <View style={styles.item_wrapper}>
              <Text>{item["name"]}</Text>
            </View>
          </TouchableNativeFeedback>
        )}
      />
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
  item_wrapper: {
    padding: 8,
  },
});
