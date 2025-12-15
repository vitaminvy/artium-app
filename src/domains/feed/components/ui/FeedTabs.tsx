import React from "react";
import { View, Pressable, Text } from "react-native";
import { FEED_STRINGS } from "../../constants";
import { FeedTab } from "../../types";

type Props = {
  tab: FeedTab;
  onChange: (tab: FeedTab) => void;
};

function FeedTabs({ tab, onChange }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-8 py-2">
      {([
        { key: "explore", label: FEED_STRINGS.TAB_EXPLORE },
        { key: "following", label: FEED_STRINGS.TAB_FOLLOWING },
      ] as const).map((item) => {
        const active = tab === item.key;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)}>
            <Text
              className={`text-base font-semibold ${
                active ? "text-slate-900" : "text-slate-500"
              }`}
              style={
                active
                  ? {
                      borderBottomColor: "#0F172A",
                      borderBottomWidth: 2,
                      paddingBottom: 6,
                    }
                  : { paddingBottom: 6 }
              }
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const areEqual = (prev: Props, next: Props) =>
  prev.tab === next.tab && prev.onChange === next.onChange;

export default React.memo(FeedTabs, areEqual);
