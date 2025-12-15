import React from "react";
import { Text, Pressable, View, StyleSheet } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../app/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

const VIDEO_SOURCE = require("../../assets/videos/welcome.mp4");

export default function WelcomeScreen({ navigation }: Props) {
  const player = useVideoPlayer(VIDEO_SOURCE, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = true;
    playerInstance.play();
  });

  return (
    <View className="flex-1">
      {/* Background video (muted, looped) */}
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false} // tắt toàn bộ UI điều khiển của player
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* Optional overlay for readability */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]}
      />

      <View className="flex-1 justify-end px-8 pb-12">
        <Text className="text-white text-center text-3xl">Welcome</Text>

        <Pressable
          onPress={() => navigation.navigate("SignUp")}
          className="bg-white py-4 px-6 rounded-full mt-8"
        >
          <Text className="text-center text-lg">GET STARTED</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("SignIn")}>
          <Text className="text-white text-center mt-6 text-base">SIGN IN</Text>
        </Pressable>
      </View>
    </View>
  );
}
