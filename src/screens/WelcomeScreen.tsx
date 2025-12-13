import React from "react";
import { Text, Pressable, View, StyleSheet } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../app/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

// Dùng video remote để tránh lỗi thiếu asset cục bộ
const VIDEO_SOURCE = {
  uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
};

export default function WelcomeScreen({ navigation }: Props) {
  const player = useVideoPlayer(VIDEO_SOURCE, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <View style={{ flex: 1 }}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          padding: 30,
          gap: 16,
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
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 18 }}>GET STARTED</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("SignIn")}>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              marginTop: 8,
              fontSize: 16,
            }}
          >
            SIGN IN
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
