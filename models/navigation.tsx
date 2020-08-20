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
  MessageScreen:{ id: string };
};

export type TabTwoParamList = {
  TabTwoScreen: undefined;
};

type MessageScreenRouteProp = RouteProp<TabOneParamList, "MessageScreen">;

type MessageScreenNavigationProp = StackNavigationProp<
  TabOneParamList,
  "MessageScreen"
>;

export type MessageScreenProps = {
  route: MessageScreenRouteProp;
  navigation: MessageScreenNavigationProp;
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
