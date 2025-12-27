import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import UploadIcon from "../../../../assets/upload/upload-icon.svg";
import { InventoryImage } from "../types";
import { MAX_IMAGES } from "../constants";
// import { InventoryImage } from "@/domains/inventory/types";
type Props = {
  images: InventoryImage[];
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
};

export function UploadImagesStep({ images, onPickImages, onRemoveImage }: Props) {
  return (
    <View className="px-6 pb-8 gap-6">
      <View className="rounded-[28px] border border-slate-200 bg-white p-5 gap-4 mt-6">
        <View className="h-[260px]">
          {images.length === 0 ? (
            <Pressable
              onPress={onPickImages}
              className="flex-1 rounded-[24px] border border-dashed border-slate-300 bg-white items-center justify-center gap-3 active:opacity-80"
            >
              <UploadIcon width={100} height={100} />
              <Text className="text-lg font-semibold text-slate-900">
                Upload images of your artwork
              </Text>
              <Text className="text-sm text-slate-500 text-center">
                Supported formats: GIF, PNG, JPG, JPEG, HEIC.
              </Text>
            </Pressable>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, alignItems: "center" }}
            >
              {images.map((image, index) => (
                <View
                  key={`${image.uri}-${index}`}
                  className="mr-4 rounded-[24px] overflow-hidden border border-slate-200 bg-slate-50"
                  style={{ width: 190, height: 230 }}
                >
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={0}
                  />
                  {index === 0 ? (
                    <View className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1">
                      <Text className="text-[11px] font-semibold text-slate-700">
                        Main Image
                      </Text>
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() => onRemoveImage(index)}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/85 items-center justify-center active:opacity-80"
                  >
                    <Ionicons name="close" size={18} color="#0F172A" />
                  </Pressable>
                </View>
              ))}
              {images.length < MAX_IMAGES ? (
                <Pressable
                  onPress={onPickImages}
                  className="mr-4 rounded-[24px] border border-dashed border-slate-300 bg-white items-center justify-center gap-3 active:opacity-80"
                  style={{ width: 190, height: 230 }}
                >
                  <Ionicons name="add" size={30} color="#0F172A" />
                  <Text className="text-sm font-semibold text-slate-700 text-center">
                    Add or change{`\n`}images
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          )}
        </View>

        <Text className="text-xs text-slate-400">
          Upload up to {MAX_IMAGES} images of your artwork. Your additional images
          will maintain their original ratio.
        </Text>
      </View>
    </View>
  );
}
