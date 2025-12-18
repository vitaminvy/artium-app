import React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import AuthHero from "./AuthHero";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthScreenLayout({ title, subtitle, children }: Props) {
  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <View className="flex-1 bg-white">
          <AuthHero title={title} subtitle={subtitle} />
          <View className="flex-1 px-6 pb-12 pt-10 -mt-8">{children}</View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
