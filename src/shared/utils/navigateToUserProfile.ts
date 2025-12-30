import { navigate } from "../../app/navigation/navigationRef";

/**
 * Navigate to user profile screen
 * @param userId - The ID of the user whose profile to view
 */
export function navigateToUserProfile(userId: string) {
  if (!userId) {
    console.warn("navigateToUserProfile: userId is required");
    return;
  }

  navigate("UserProfile", { userId });
}
