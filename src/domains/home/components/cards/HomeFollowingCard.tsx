import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { HomeFollowingProfile } from "../../types";
import { HOME_COLORS } from "../../constants";

const cardShadow = {
  shadowColor: HOME_COLORS.SHADOW,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

type Props = {
  item: HomeFollowingProfile;
  onPress?: (item: HomeFollowingProfile) => void;
  isFollowing?: boolean;
  onToggleFollow?: (id: string) => void;
};

function HomeFollowingCard({
  item,
  onPress,
  isFollowing = false,
  onToggleFollow,
}: Props) {
  const Container = onPress ? Pressable : View;

  // Null safety check
  if (!item?.avatar || !item?.name) {
    return null;
  }

  return (
    <Container
      className="flex-1 rounded-3xl bg-white border border-slate-100 px-4 pt-5 pb-6 items-center"
      style={cardShadow}
      onPress={() => onPress?.(item)}
    >
      <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
        <Image
          source={{ uri: item.avatar }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
      </View>

      <View className="mt-3 flex-row flex-wrap items-center justify-center">
        <Text className="text-[15px] font-semibold text-slate-900 text-center">
          {item.name}
        </Text>
        {item.verified ? (
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={HOME_COLORS.VERIFIED_BADGE}
            style={{ marginLeft: 6, marginTop: 1 }}
          />
        ) : null}
      </View>
      {item.subtitle ? (
        <Text
          className="mt-1 text-[11px] text-slate-500 text-center"
          numberOfLines={1}
        >
          {item.subtitle}
        </Text>
      ) : null}

      <Pressable
        className="mt-4 flex-row items-center gap-2 rounded-full border px-4 py-2 active:opacity-90"
        style={{
          borderColor: isFollowing ? HOME_COLORS.FOLLOWING_BORDER : HOME_COLORS.FOLLOW_BORDER,
          backgroundColor: isFollowing ? HOME_COLORS.FOLLOWING_BG : HOME_COLORS.FOLLOW_BG,
        }}
        onPress={() => onToggleFollow?.(item.id)}
      >
        {isFollowing ? (
          <View style={{ width: 16, height: 16 }}>
            <Ionicons name="person-outline" size={16} color={HOME_COLORS.TEXT_PRIMARY} />
            <View
              style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: HOME_COLORS.VERIFIED_BADGE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={7} color={HOME_COLORS.WHITE} />
            </View>
          </View>
        ) : (
          <Ionicons name="person-add-outline" size={16} color={HOME_COLORS.TEXT_PRIMARY} />
        )}
        <Text className="text-[12px] font-semibold text-slate-900">
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </Container>
  );
}

export default React.memo(HomeFollowingCard);
