import RootNavigator from "./navigation/RootNavigator";
import { AuthStatus } from "../domains/auth/types";

type AppEntryProps = {
  authStatus: AuthStatus;
};

export default function AppEntry({ authStatus }: AppEntryProps) {
  return <RootNavigator authStatus={authStatus} />;
}
