import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/configs/firebase";

export async function forgotPassword(email: string) {
  if (!email) {
    throw new Error("Vui lòng nhập email");
  }

  await sendPasswordResetEmail(auth, email.trim());
}
