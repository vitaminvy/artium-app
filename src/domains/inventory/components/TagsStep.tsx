import React from "react";
import { Pressable, Text, View } from "react-native";
import { SectionCard } from "./ui/SectionCard";

type Props = {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

const TAG_GROUPS: { title: string; tags: string[] }[] = [
  {
    title: "Vibes",
    tags: [
      "JOYFUL",
      "NATURAL",
      "VIBRANT",
      "EXPRESSIVE",
      "PEACEFUL",
      "ROMANTIC",
      "BOLD",
      "DREAMY",
      "CLASSIC",
      "MOODY",
      "MINIMALIST",
      "VINTAGE",
      "AVANT GARDE",
      "OTHER",
      "SPIRITUAL",
      "MELANCHOLIC",
    ],
  },
  {
    title: "Values",
    tags: [
      "CULTURAL HERITAGE",
      "HUMAN EXPERIENCE",
      "PRIDE",
      "FUTURISM",
      "ENVIRONMENT",
      "EQUITY",
      "FEMINISM",
      "SOCIAL AWARENESS",
      "ESCAPISM",
      "OTHER",
      "EMPOWERMENT",
      "UNIVERSAL",
    ],
  },
  {
    title: "Mediums",
    tags: [
      "PAINTING",
      "DRAWING",
      "ILLUSTRATION",
      "DIGITAL ART",
      "PHOTOGRAPHY",
      "SCULPTURE",
      "INSTALLATION",
      "OTHER",
      "COLLAGE",
      "IMMERSIVE",
      "MIXED MEDIA",
      "PERFORMANCE ART",
      "PRINTS",
      "PUBLIC ART",
      "VIDEO",
      "CERAMICS",
      "ANIMATION",
      "JEWELRY",
      "TEXTILE",
      "DESIGNED OBJECTS",
      "FUNCTIONAL ART",
      "CONCEPT ART",
      "INTELLECTUAL ART",
    ],
  },
];

export function TagsStep({ selectedTags, onToggleTag }: Props) {
  return (
    <View className="px-6 pb-10 gap-6">
      <SectionCard title="Artwork tags">
        {TAG_GROUPS.map((group) => (
          <View key={group.title} className="gap-3">
            <Text className="text-[12px] font-semibold text-slate-500 uppercase tracking-[1px]">
              {group.title}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {group.tags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={`${group.title}-${tag}`}
                    onPress={() => onToggleTag(tag)}
                    className={`rounded-full border px-4 py-2 ${
                      selected
                        ? "border-[#0B73FF] bg-[#0B73FF]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold tracking-[0.8px] ${
                        selected ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}
