import { getStorage } from "firebase-admin/storage";
import axios from "axios";
import { faker } from "@faker-js/faker";

// Cache to avoid re-uploading the same images too many times during testing
const UPLOADED_CACHE: string[] = [];
const TARGET_POOL_SIZE = 20; // Upload 20 unique images and reuse them

export const uploadRandomImage = async (folder: string): Promise<string> => {
  const bucket = getStorage().bucket();

  // Reuse images if we have enough in the pool
  if (UPLOADED_CACHE.length >= TARGET_POOL_SIZE) {
    return faker.helpers.arrayElement(UPLOADED_CACHE);
  }

  try {
    // 1. Download realistic image from Picsum
    // We use a random seed to get different images
    const seed = faker.string.uuid();
    const imageUrl = `https://picsum.photos/seed/${seed}/800/800`; // Square images
    
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    // 2. Upload to Firebase Storage
    const filename = `${folder}/${seed}.jpg`;
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: { contentType: "image/jpeg" },
      public: true, // Make it public
    });

    // 3. Get Public URL
    // For Firebase Storage buckets, the public URL format is usually:
    // https://storage.googleapis.com/BUCKET_NAME/PATH
    // OR if using the firebase-specific domain (requires token, but we made it public)
    const publicUrl = file.publicUrl();
    
    console.log(`[Storage] Uploaded: ${filename}`);
    UPLOADED_CACHE.push(publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    // Fallback to a placeholder if upload fails
    return "https://via.placeholder.com/800";
  }
};
