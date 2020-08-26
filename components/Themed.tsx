import * as React from "react";
import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
} from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import { AntDesign } from "@expo/vector-icons";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type DefaultTextInputProps = ThemeProps & DefaultTextInput["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export type IconProps = ThemeProps & {
  size?: number;
  name: string;
  onPress?: () => void;
};

export function Icon(props: IconProps) {
  const { lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <AntDesign color={color} {...otherProps} />;
}

export function TextInput(props: DefaultTextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;

  const text = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <DefaultTextInput
      style={[
        {
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          flex: 1,
          paddingHorizontal: 6,
          color: text,
          borderRadius:24
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
