import { navigationRef } from "../../app/navigation/navigationRef";
import { auth } from "../../configs/firebase";

/**
 * Navigate to user profile screen within the current stack
 * - If userId is the current user, navigate to Profile screen
 * - If userId is another user, navigate to UserProfile screen
 * 
 * This navigates within the current stack to preserve back navigation
 * @param userId - The ID of the user whose profile to view
 */
export function navigateToUserProfile(userId: string) {
  if (!userId) {
    console.warn("navigateToUserProfile: userId is required");
    return;
  }

  if (!navigationRef.isReady()) {
    console.warn("navigateToUserProfile: navigation is not ready");
    return;
  }

  const currentUserId = auth.currentUser?.uid;

  // If viewing own profile, navigate to Profile screen
  if (currentUserId && userId === currentUserId) {
    (navigationRef as any).navigate("Profile");
    return;
  }

  // Otherwise, navigate to UserProfile for other users
  (navigationRef as any).navigate("UserProfile", { userId });
}
