import { updateProfile, UserCredential } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { doCreateUserWithEmailAndPassword } from "./firebaseAuth";
import { upsertUserProfile } from "./userProfile";

/**
 * Create a new user account and seed a basic profile document.
 */
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<UserCredential> {
  const credential = await doCreateUserWithEmailAndPassword(
    email.trim(),
    password
  );

  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }

  await upsertUserProfile(credential.user, {
    displayName: name,
  });

  return credential;
}
