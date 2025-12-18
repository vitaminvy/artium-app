import React from "react";
import { Dimensions, ImageBackground, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 280;

type Props = {
  title: string;
  subtitle?: string;
};

export default function AuthHero({ title, subtitle }: Props) {
  return (
    <View className="relative">
      <ImageBackground
        source={require("../../../../assets/auth-decor.jpg")}
        resizeMode="cover"
        style={{ height: HERO_HEIGHT, width: "100%" }}
      >
        <View className="absolute inset-0 bg-black/50" />
        <View className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-transparent" />
        <View className="flex-1 justify-end pb-14 px-6">
          <Text className="text-white text-[34px] font-extrabold drop-shadow-lg">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-white/90 text-base mt-3 leading-6">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </ImageBackground>
      <Svg
        pointerEvents="none"
        width={SCREEN_WIDTH}
        height={60}
        style={{ position: "absolute", bottom: -24, left: 0 }}
        viewBox={`0 0 ${SCREEN_WIDTH} 60`}
      >
        <Path
          d={`M0 0 Q${SCREEN_WIDTH / 2} 26 ${SCREEN_WIDTH} 0 L${SCREEN_WIDTH} 60 L0 60 Z`}
          fill="white"
        />
      </Svg>
    </View>
  );
}
