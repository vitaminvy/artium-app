import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/configs/firebase";
import 'react-native-get-random-values'; // Required for uuid to work on RN
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Uploads a media file (from a local URI) to Firebase Storage and returns the public download URL.
 * @param localUri The `file:///` URI of the media on the user's device.
 * @param path The path in storage to upload to, e.g., 'posts' or 'avatars'.
 * @returns The public URL of the uploaded file.
 */
export const uploadMedia = async (localUri: string, path: 'posts' | 'avatars' = 'posts'): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be logged in to upload media.");
  }

  const blob = await uriToBlob(localUri);

  // Create a unique file name to avoid overwrites
  const fileExtension = localUri.split('.').pop() || 'tmp';
  const fileName = `${uuidv4()}.${fileExtension}`;
  
  // Create a storage reference
  const storageRef = ref(storage, `${path}/${user.uid}/${fileName}`);

  // 'uploadBytes' is the simplest way to upload a blob.
  // We can also pass metadata, such as the content type
  console.log(`Blob Info: size=${blob.size}, type=${blob.type}`); // Log blob info
  const fileType = blob.type || `image/${fileExtension}`; // Fallback for safety
  const metadata = { contentType: fileType };
  const snapshot = await uploadBytes(storageRef, blob, metadata);
  console.log('Uploaded a blob or file!', snapshot.metadata.fullPath);

  // Get the public download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};
