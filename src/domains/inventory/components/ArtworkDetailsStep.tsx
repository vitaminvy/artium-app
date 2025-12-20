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
  errors?: Partial<Record<FieldKey, string>>;
  onFieldLayout?: (key: FieldKey, y: number) => void;
  onFieldChange?: (key: FieldKey) => void;
};

export type FieldKey =
  | "title"
  | "description"
  | "year"
  | "edition"
  | "dimensions.height"
  | "dimensions.width"
  | "dimensions.depth"
  | "weight.value"
  | "materials"
  | "price"
  | "quantity";

export function ArtworkDetailsStep({
  details,
  onChangeDetails,
  errors,
  onFieldLayout,
  onFieldChange,
}: Props) {
  const handleChange = (field: keyof InventoryDetails, value: any) => {
    onChangeDetails((prev) => ({ ...prev, [field]: value }));
    if (field === "title") onFieldChange?.("title");
    if (field === "description") onFieldChange?.("description");
    if (field === "year") onFieldChange?.("year");
    if (field === "edition") onFieldChange?.("edition");
    if (field === "materials") onFieldChange?.("materials");
    if (field === "price") onFieldChange?.("price");
    if (field === "quantity") onFieldChange?.("quantity");
  };

  const renderError = (key: FieldKey) =>
    errors?.[key] ? (
      <Text className="mt-1 text-[12px] text-rose-600">
        {errors[key]}
      </Text>
    ) : null;

  return (
    <View className="px-6 pb-10 gap-6">
      <SectionCard title="Artwork details">
        <View onLayout={(e) => onFieldLayout?.("title", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Artwork title"
            value={details.title}
            onChangeText={(val) => handleChange("title", val)}
            placeholder="Artwork title"
          />
          {renderError("title")}
        </View>
        <View onLayout={(e) => onFieldLayout?.("description", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Description"
            value={details.description}
            onChangeText={(val) => handleChange("description", val)}
            placeholder="Describe your artwork"
            multiline
            helper="Tell buyers about the story, process, or inspiration."
          />
          {renderError("description")}
        </View>
        <View onLayout={(e) => onFieldLayout?.("year", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Year"
            value={details.year}
            onChangeText={(val) => handleChange("year", val)}
            placeholder="2025"
            keyboardType="numeric"
          />
          {renderError("year")}
        </View>
        <View onLayout={(e) => onFieldLayout?.("edition", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Edition"
            value={details.edition}
            onChangeText={(val) => handleChange("edition", val)}
            placeholder="12/100, Limited Edition, etc."
          />
          {renderError("edition")}
        </View>
        
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
              <View
                onLayout={(e) =>
                  onFieldLayout?.("dimensions.height", e.nativeEvent.layout.y)
                }
              >
                <TextInput
                  value={details.dimensions.height}
                  onChangeText={(val) =>
                  onChangeDetails((prev) => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, height: val },
                  }))
                }
                onEndEditing={() => onFieldChange?.("dimensions.height")}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
                />
              </View>
            </View>
            <View className="flex-1 gap-3">
              <Text className="text-sm text-slate-600">Width</Text>
              <View
                onLayout={(e) =>
                  onFieldLayout?.("dimensions.width", e.nativeEvent.layout.y)
                }
              >
                <TextInput
                  value={details.dimensions.width}
                  onChangeText={(val) =>
                  onChangeDetails((prev) => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, width: val },
                  }))
                }
                onEndEditing={() => onFieldChange?.("dimensions.height")}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
                />
              </View>
            </View>
            <View className="flex-1 gap-3">
              <Text className="text-sm text-slate-600">Depth</Text>
              <View
                onLayout={(e) =>
                  onFieldLayout?.("dimensions.depth", e.nativeEvent.layout.y)
                }
              >
                <TextInput
                  value={details.dimensions.depth}
                  onChangeText={(val) =>
                  onChangeDetails((prev) => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, depth: val },
                  }))
                }
                onEndEditing={() => onFieldChange?.("dimensions.height")}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
                />
              </View>
            </View>
          </View>
          {errors?.["dimensions.height"] ? (
            <Text className="mt-1 text-[12px] text-rose-600">
              Dimensions are required.
            </Text>
          ) : null}
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
          <View
            onLayout={(e) =>
              onFieldLayout?.("weight.value", e.nativeEvent.layout.y)
            }
          >
            <TextInput
              value={details.weight.value}
              onChangeText={(val) =>
              onChangeDetails((prev) => ({
                ...prev,
                weight: { ...prev.weight, value: val },
              }))
            }
            onEndEditing={() => onFieldChange?.("weight.value")}
            placeholder="0"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] text-slate-900"
            />
            {renderError("weight.value")}
          </View>
        </View>

        <View onLayout={(e) => onFieldLayout?.("materials", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Materials"
            value={details.materials}
            onChangeText={(val) => handleChange("materials", val)}
            placeholder="Oil on canvas"
          />
          {renderError("materials")}
        </View>
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
        <View onLayout={(e) => onFieldLayout?.("price", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Artwork price"
            value={details.price}
            onChangeText={(val) => handleChange("price", val)}
            placeholder="US$ 12,345"
            keyboardType="numeric"
          />
          {renderError("price")}
        </View>
        <Text className="text-sm text-slate-500">
          Artium takes a commission from every sale. Learn more
        </Text>
        <View onLayout={(e) => onFieldLayout?.("quantity", e.nativeEvent.layout.y)}>
          <LabeledField
            label="Quantity available"
            value={details.quantity}
            onChangeText={(val) => handleChange("quantity", val)}
            placeholder="1"
            keyboardType="numeric"
          />
          {renderError("quantity")}
        </View>
        <Text className="text-sm text-slate-500">
          For your reference only. Price and quantity will appear in your
          Inventory but won’t be visible to buyers.
        </Text>
      </SectionCard>
    </View>
  );
}
