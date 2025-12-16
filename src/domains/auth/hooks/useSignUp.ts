import { useCallback, useState } from "react";
import type { User } from "firebase/auth";

import { register } from "@/domains/auth/services/register";

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles new user registration process
   * @param {string | undefined} displayName - Optional user's display name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User | undefined>} Created user or undefined
   */
  const signUp = useCallback(
    async (
      displayName: string | undefined,
      email: string,
      password: string
    ): Promise<User | undefined> => {
      if (!email.trim()) {
        setError("Please enter your email.");
        return;
      }
      if (!password) {
        setError("Please enter a password.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await register(email.trim(), password, displayName);
        return response?.user;
      } catch (err: any) {
        let msg = "Sign-up failed";
        switch (err?.code) {
          case "auth/email-already-in-use":
            msg = "Email already in use";
            break;
          case "auth/invalid-email":
            msg = "Invalid email format";
            break;
          case "auth/weak-password":
            msg = "Password must be at least 6 characters.";
            break;
          default:
            msg = err?.message || msg;
            break;
        }
        setError(msg);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { signUp, loading, error, clearError };
}
