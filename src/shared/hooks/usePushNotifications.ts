import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { updateUserPushToken } from "@/domains/user/services/userService";

// Cấu hình cách thông báo hiển thị khi app đang mở (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    
    // Lấy token (sử dụng projectId từ app config nếu có, nếu không Expo tự xử lý)
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
        
      const tokenResult = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      token = tokenResult.data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.error("Error fetching push token:", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  // @ts-ignore
  const notificationListener = useRef<Notifications.EventSubscription>();
  // @ts-ignore
  const responseListener = useRef<Notifications.EventSubscription>();
  
  const { currentUser } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      
      // Nếu đã đăng nhập và có token, lưu vào Firestore
      if (token && currentUser?.uid) {
        updateUserPushToken(currentUser.uid, token);
      }
    });

    // Lắng nghe thông báo khi app đang chạy (foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Lắng nghe khi người dùng chạm vào thông báo
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User tapped notification:", response);
        // Tại đây bạn có thể xử lý điều hướng (navigation) dựa trên data của thông báo
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [currentUser]); // Chạy lại khi currentUser thay đổi để đảm bảo lưu token đúng user

  return {
    expoPushToken,
    notification,
  };
}
