import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { InventoryDetails, ListingStatus } from "../types";
import { LISTING_STATUS_OPTIONS } from "../constants";
import { SectionCard } from "./ui/SectionCard";
import { LabeledField } from "./ui/LabeledField";
import { UnitToggle } from "./ui/UnitToggle";

type Props = {
  details: InventoryDetails;
  onChangeDetails: (
    updater: (prev: InventoryDetails) => InventoryDetails
  ) => void;
};

export function ArtworkDetailsStep({ details, onChangeDetails }: Props) {
  const handleChange = (field: keyof InventoryDetails, value: any) => {
    onChangeDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View className="px-6 pb-10 gap-6">
      <SectionCard title="Artwork details">
        <LabeledField
          label="Artwork title"
          value={details.title}
          onChangeText={(val) => handleChange("title", val)}
          placeholder="Artwork title"
        />
        <LabeledField
          label="Description"
          value={details.description}
          onChangeText={(val) => handleChange("description", val)}
          placeholder="Describe your artwork"
          multiline
          helper="Tell buyers about the story, process, or inspiration."
        />
        <LabeledField
          label="Year"
          value={details.year}
          onChangeText={(val) => handleChange("year", val)}
          placeholder="2024"
          keyboardType="numeric"
        />
        <LabeledField
          label="Edition"
          value={details.edition}
          onChangeText={(val) => handleChange("edition", val)}
          placeholder="12/100, Limited Edition, etc."
        />
        
        {/* Dimensions */}
        <View className="gap-2">
          <Text className="text-[12px] font-semibold text-slate-600 uppercase">
            Dimensions
          </Text>
          <UnitToggle
            value={details.dimensions.unit}
            options={[
              { label: "in", value: "in" },
              { label: "cm", value: "cm" },
            ]}
            onChange={(val) =>
              onChangeDetails((prev) => ({
                ...prev,
                dimensions: { ...prev.dimensions, unit: val },
              }))
            }
          />
          <View className="flex-row items-center gap-4">
            <View className="flex-1 gap-3">
              <Text className="text-sm text-slate-600">Height</Text>
              <TextInput
                value={details.dimensions.height}
                onChangeText={(val) =>
                  onChangeDetails((prev) => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, height: val },
                  }))
                }
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
              />
            </View>
            <View className="flex-1 gap-3">
              <Text className="text-sm text-slate-600">Width</Text>
              <TextInput
                value={details.dimensions.width}
                onChangeText={(val) =>
                  onChangeDetails((prev) => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, width: val },
                  }))
                }
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
              />
            </View>
            <View className="flex-1 gap-3">
              <Text className="text-sm text-slate-600">Depth</Text>
              <TextInput
                value={details.dimensions.depth}
                onChangeText={(val) =>
                  onChangeDetails((prev) => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, depth: val },
                  }))
                }
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
              />
            </View>
          </View>
        </View>

        {/* Weight */}
        <View className="gap-2">
          <Text className="text-[12px] font-semibold text-slate-600 uppercase">
            Weight
          </Text>
          <UnitToggle
            value={details.weight.unit}
            options={[
              { label: "lbs", value: "lbs" },
              { label: "kg", value: "kg" },
            ]}
            onChange={(val) =>
              onChangeDetails((prev) => ({
                ...prev,
                weight: { ...prev.weight, unit: val },
              }))
            }
          />
          <TextInput
            value={details.weight.value}
            onChangeText={(val) =>
              onChangeDetails((prev) => ({
                ...prev,
                weight: { ...prev.weight, value: val },
              }))
            }
            placeholder="0"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] text-slate-900"
          />
        </View>

        <LabeledField
          label="Materials"
          value={details.materials}
          onChangeText={(val) => handleChange("materials", val)}
          placeholder="Oil on canvas"
        />
      </SectionCard>

      <SectionCard
        title="Listing information"
        subtitle="Choose whether to list this artwork's availability status for sale, allow for inquiry, or mark it as sold."
      >
        <View className="gap-4">
          <Text className="text-[12px] font-semibold text-slate-600 uppercase">
            Listing status
          </Text>
          <View className="flex-row gap-3">
            {LISTING_STATUS_OPTIONS.map((option) => {
              const active = details.status === option.value;
              const disabled = option.disabled;
              return (
                <Pressable
                  key={option.value}
                  disabled={disabled}
                  onPress={() => {
                    if (disabled) return;
                    handleChange("status", option.value as ListingStatus);
                  }}
                  className={`flex-1 rounded-2xl border px-3 py-3 items-center justify-center ${
                    active
                      ? "bg-white border-[#0B73FF]"
                      : "bg-white border-slate-200"
                  } ${disabled ? "opacity-70" : ""}`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Text
                      className={`text-[15px] font-semibold text-center ${
                        active ? "text-[#0B73FF]" : "text-slate-700"
                      } ${disabled ? "text-slate-500" : ""}`}
                    >
                      {option.label}
                    </Text>
                    {option.pro ? (
                      <View className="px-2 py-1 rounded-full bg-[#e0e7ff]">
                        <Text className="text-[11px] font-semibold text-[#4f46e5]">
                          Pro
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
        {details.status === "inquire" ? (
          <Text className="text-sm text-slate-600">
            Interested buyers can make an offer or ask to learn more about this
            artwork.
          </Text>
        ) : null}
        <LabeledField
          label="Artwork price"
          value={details.price}
          onChangeText={(val) => handleChange("price", val)}
          placeholder="US$ 12,345"
          keyboardType="numeric"
        />
        <Text className="text-sm text-slate-500">
          Artium takes a commission from every sale. Learn more
        </Text>
        <LabeledField
          label="Quantity available"
          value={details.quantity}
          onChangeText={(val) => handleChange("quantity", val)}
          placeholder="1"
          keyboardType="numeric"
        />
        <Text className="text-sm text-slate-500">
          For your reference only. Price and quantity will appear in your
          Inventory but won’t be visible to buyers.
        </Text>
      </SectionCard>
    </View>
  );
}
