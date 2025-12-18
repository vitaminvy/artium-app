import {
  createNavigationContainerRef,
  NavigationContainerRefWithCurrent,
} from "@react-navigation/native";
import { AppStackParamList } from "./types";

export const navigationRef: NavigationContainerRefWithCurrent<AppStackParamList> =
  createNavigationContainerRef<AppStackParamList>();

export function navigate<Name extends keyof AppStackParamList>(
  name: Name,
  params?: AppStackParamList[Name]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
