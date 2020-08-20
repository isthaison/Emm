import * as React from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as firebase from "firebase";
import { IFirebaseOptions } from "expo-firebase-core";

import {
  FirebaseRecaptchaVerifierModal,
  FirebaseRecaptchaVerifier,
} from "expo-firebase-recaptcha";
import { Text, View } from "@components/Themed";

export default function TabTwoScreen() {
  const recaptchaVerifier = React.useRef<FirebaseRecaptchaVerifierModal>(null);
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [verificationId, setVerificationId] = React.useState<string>("");
  const [recaptchaToken, setrecaptchaToken] = React.useState<string>("");
  const [verificationCode, setVerificationCode] = React.useState<string>("");
  const firebaseConfig: IFirebaseOptions = (firebase.apps.length
    ? firebase.app().options
    : undefined) as any;

  const [message, showMessage] = React.useState<
    | {
        text: string;
        color?: string;
      }
    | undefined
  >(
    !firebaseConfig || Platform.OS === "web"
      ? {
          text:
            "To get started, provide a valid firebase config in App.js and open this snack on an iOS or Android device.",
        }
      : undefined
  );

  const sendcode = async () => {
    try {
      if (recaptchaVerifier.current === null) {
        showMessage({
          text: "Recaptcha verifier ca'nt initial",
        });
        return;
      }
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      showMessage({
        text: "Verification code has been sent to your phone.",
      });
    } catch (err) {
      showMessage({ text: `Error: ${err.message}`, color: "red" });
    }
  };

  const verification = async () => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await firebase.auth().signInWithCredential(credential);
      showMessage({
        text: "Phone authentication successful 👍",
      });
    } catch (err) {
      showMessage({
        text: `Error: ${err.message}`,
        color: "red",
      });
    }
  };

  return (
    <React.Fragment>
      <View style={styles.container}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
        />
        <Text style={{ marginTop: 20 }}>Enter phone number (+84)</Text>
        <TextInput
          style={{ marginVertical: 10, fontSize: 17 }}
          placeholder="+84 99 999 9999"
          autoFocus
          autoCompleteType="tel"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
        />
        <Button
          title="Send Verification Code"
          disabled={!phoneNumber}
          onPress={sendcode}
        />
        <Text style={{ marginTop: 20 }}>Enter Verification code</Text>
        <TextInput
          style={{ marginVertical: 10, fontSize: 17 }}
          editable={!!verificationId}
          placeholder="123456"
          onChangeText={setVerificationCode}
        />
        <Button
          title="Confirm Verification Code"
          disabled={!verificationId}
          onPress={verification}
        />
      </View>
      {message ? (
        <TouchableOpacity
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "0xffffffee", justifyContent: "center" },
          ]}
          onPress={() => showMessage(undefined)}
        >
          <Text
            style={{
              color: message.color || "blue",
              fontSize: 17,
              textAlign: "center",
              margin: 20,
            }}
          >
            {message.text}
          </Text>
        </TouchableOpacity>
      ) : undefined}
    </React.Fragment>
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
});
