import { useEffect, useState } from "react";
import { AuthState } from "../types";
import { tokenStorage } from "../services/tokenStorage";

export function useAuthBootstrap() {
  const [auth, setAuth] = useState<AuthState>({
    status: "loading",
    token: null,
  });

  useEffect(() => {
    async function bootstrap() {
      const token = await tokenStorage.get();

      if (token) {
        setAuth({ status: "authenticated", token });
      } else {
        setAuth({ status: "unauthenticated", token: null });
      }
    }

    bootstrap();
  }, []);

  return auth;
}