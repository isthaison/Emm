import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type TabOneParamList = {
  TabOneScreen: undefined;
  MessageScreen: { id: string };
};

export type TabTwoParamList = {
  TabTwoScreen: undefined;
};

type TabTwocreenRouteProp = RouteProp<TabTwoParamList, "TabTwoScreen">;

type TabTwoScreenNavigationProp = StackNavigationProp<
  TabTwoParamList,
  "TabTwoScreen"
>;

export type TabTwoScreenProps = {
  route: TabTwocreenRouteProp;
  navigation: TabTwoScreenNavigationProp;
};

type TabOneScreenRouteProp = RouteProp<TabOneParamList, "TabOneScreen">;

type TabOneScreenNavigationProp = StackNavigationProp<
  TabOneParamList,
  "TabOneScreen"
>;

export type TabOneScreenProps = {
  route: TabOneScreenRouteProp;
  navigation: TabOneScreenNavigationProp;
};
