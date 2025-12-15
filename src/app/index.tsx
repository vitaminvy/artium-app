import { useAuthBootstrap } from "../domains/auth/hooks/useAuthBootstrap";
import RootNavigator from "./navigation/RootNavigator";
import Loader from "../shared/components/Loader";

export default function AppEntry() {
  const auth = useAuthBootstrap();

  if (auth.status === "loading") return <Loader />;

  return <RootNavigator authStatus={auth.status} />;
}
