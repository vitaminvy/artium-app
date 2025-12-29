import React, { useState } from "react";
import { View, Text, ViewStyle } from "react-native";
import type { ArtworkDetail } from "../types";
import { InfoBlock, InfoBlockWithConvert } from "./ui/InfoBlock";

type ArtworkDetailsProps = {
  detail: ArtworkDetail;
};

const cardShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

export default function ArtworkDetails({ detail }: ArtworkDetailsProps) {
  const [showDimensionConvert, setShowDimensionConvert] = useState(false);
  const [showWeightConvert, setShowWeightConvert] = useState(false);

  const dimensionUnit = detail.dimension.unit?.trim() || "in";
  const normalizedDimensionUnit = dimensionUnit.toLowerCase();
  const dimensionLabel = `${detail.dimension.h.toFixed(
    2
  )} × ${detail.dimension.w.toFixed(2)} × ${detail.dimension.d.toFixed(
    2
  )} ${dimensionUnit}`;
  const dimensionConvertFactor = normalizedDimensionUnit === "cm" ? 1 / 2.54 : 2.54;
  const dimensionConvertUnit = normalizedDimensionUnit === "cm" ? "in" : "cm";
  const dimensionConvertLabel = `${(
    detail.dimension.h * dimensionConvertFactor
  ).toFixed(2)} × ${(detail.dimension.w * dimensionConvertFactor).toFixed(
    2
  )} × ${(detail.dimension.d * dimensionConvertFactor).toFixed(
    2
  )} ${dimensionConvertUnit}`;

  const weightSource = detail.weight?.trim() || "";
  const weightValue = Number.isFinite(detail.weightValue)
    ? (detail.weightValue as number)
    : (() => {
        const match = weightSource.match(/([\d.]+)/);
        return match ? Number(match[1]) : 0;
      })();
  const weightUnit =
    detail.weightUnit || weightSource.replace(/[\d.\s]/g, "").trim();
  const normalizedWeightUnit = weightUnit.toLowerCase();
  const isKg = normalizedWeightUnit.startsWith("kg");
  const isLb = normalizedWeightUnit.startsWith("lb");
  const weightLabel =
    weightSource || (weightValue ? `${weightValue} ${weightUnit}`.trim() : "");
  const weightConvertLabel = isKg
    ? `${(weightValue / 0.45359237).toFixed(2)} lb`
    : isLb
      ? `${(weightValue * 0.45359237).toFixed(2)} kg`
      : weightLabel;

  return (
    <>
      {/* Shipping Info */}
      <View className="px-4 pb-5">
        <View className="flex-row gap-3">
          {detail.shipping.map((item, idx) => (
            <View
              key={idx}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4"
              style={cardShadow}
            >
              <Text className="text-sm font-semibold text-slate-900">
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text className="text-xs text-slate-500 mt-1">
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {/* Tags */}
      {detail.tags.length ? (
        <View className="px-4 py-2">
          <Text className="text-sm font-semibold text-slate-600 mb-3">
            ABOUT THE ARTWORK
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {detail.tags.map((tag) => (
              <View
                key={tag}
                className="px-4 py-2 rounded-full border border-slate-300"
              >
                <Text className="text-sm font-semibold text-slate-800 uppercase">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Dimensions & Materials */}
      <View className="px-4 py-6">
        <View className="flex-row gap-6">
          <InfoBlockWithConvert
            label="Dimension: (H X W X D)"
            value={dimensionLabel}
            convertLabel="This is equivalent to:"
            convertValue={dimensionConvertLabel}
            visible={showDimensionConvert}
            onToggle={() => setShowDimensionConvert((prev) => !prev)}
          />
          <InfoBlockWithConvert
            label="Weight:"
            value={weightLabel}
            convertLabel="This is equivalent to:"
            convertValue={weightConvertLabel}
            visible={showWeightConvert}
            onToggle={() => setShowWeightConvert((prev) => !prev)}
          />
        </View>
        <View className="flex-row gap-6 mt-5">
          <InfoBlock
            label="Year / Total Edition Run:"
            value={`${detail.year} / ${detail.edition}`}
          />
        </View>
        <View className="mt-6">
          <Text className="text-xs font-semibold text-slate-500 uppercase">
            Materials:
          </Text>
          <Text className="text-base text-slate-900 mt-2">
            {detail.materials}
          </Text>
        </View>
      </View>
    </>
  );
}
