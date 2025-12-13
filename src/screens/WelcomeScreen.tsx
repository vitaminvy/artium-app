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

  const content = (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        padding: 30,
      }}
    >
      <Text style={{ color: "white", textAlign: "center", fontSize: 32 }}>
        Welcome
      </Text>

      <Pressable
        onPress={() => navigation.navigate("SignUp")}
        style={{
          backgroundColor: "white",
          padding: 15,
          borderRadius: 30,
          marginTop: 30,
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 18 }}>GET STARTED</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("SignIn")}>
        <Text
          style={{
            color: "white",
            textAlign: "center",
            marginTop: 20,
            fontSize: 16,
          }}
        >
          SIGN IN
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Background video (muted, looped) */}
      <VideoView
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        player={player}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* Optional overlay for readability */}
      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />

      {content}
    </View>
  );
}
