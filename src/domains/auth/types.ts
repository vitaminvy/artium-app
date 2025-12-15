export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthState = {
  status: AuthStatus;
  token: string | null;
};