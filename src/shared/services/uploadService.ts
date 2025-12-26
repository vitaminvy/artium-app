import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/configs/firebase";
import 'react-native-get-random-values'; // Required for uuid to work on RN
import { v4 as uuidv4 } from 'uuid';

export const isLocalUri = (uri?: string | null): boolean => {
  if (!uri || typeof uri !== "string") return false;
  return uri.startsWith("file://") || uri.startsWith("content://");
};

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Failed to convert URI to blob"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

const getFileExtension = (uri: string): string => {
  const clean = uri.split("?")[0];
  const parts = clean.split(".");
  if (parts.length <= 1) return "jpg";
  const ext = parts.pop()?.toLowerCase();
  return ext && ext.length <= 5 ? ext : "jpg";
};

const uploadMediaToPath = async (localUri: string, storagePath: string): Promise<string> => {
  const blob = await uriToBlob(localUri);
  const fileExtension = getFileExtension(localUri);
  const fileType = blob.type || `image/${fileExtension}`;
  const metadata = { contentType: fileType };
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, blob, metadata);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Uploads a media file (from a local URI) to Firebase Storage and returns the public download URL.
 * @param localUri The `file:///` URI of the media on the user's device.
 * @param path The path in storage to upload to, e.g., 'posts' or 'avatars'.
 * @returns The public URL of the uploaded file.
 */
export const uploadMedia = async (localUri: string, path: string = "posts"): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to upload media.");
  }

  // Create a unique file name to avoid overwrites
  const fileExtension = getFileExtension(localUri);
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storagePath = `${path}/${user.uid}/${fileName}`;
  return await uploadMediaToPath(localUri, storagePath);
};

export const uploadIfLocal = async (
  uri?: string | null,
  path: string = "posts"
): Promise<string | undefined> => {
  if (!uri || !isLocalUri(uri)) return uri ?? undefined;
  return await uploadMedia(uri, path);
};
