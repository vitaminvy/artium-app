import { useCallback, useState } from "react";
import type { User } from "firebase/auth";

import { register } from "@/domains/auth/services/register";

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const isStrongPassword = (value: string) => value.length >= 8;

  /**
   * Handles new user registration process
   * @param {string | undefined} displayName - User's display name
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
      // Basic client-side validation before hitting Firebase.
      const trimmedName = displayName?.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName) {
        setError("Please enter your display name.");
        return;
      }
      if (!trimmedEmail) {
        setError("Please enter your email.");
        return;
      }
      if (!isValidEmail(trimmedEmail)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!password) {
        setError("Please enter a password.");
        return;
      }
      if (!isStrongPassword(password)) {
        setError("Password must be at least 8 characters.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await register(trimmedEmail, password, trimmedName);
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
