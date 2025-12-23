import React from "react";
import { Controller, Control, RegisterOptions } from "react-hook-form";
import { TextInput, View, Text, TextInputProps } from "react-native";

type Props = {
  control: Control<any>;
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  helperText?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  rules?: RegisterOptions;
  inputRef?: React.RefObject<TextInput | null>;
  returnKeyType?: TextInputProps["returnKeyType"];
  blurOnSubmit?: TextInputProps["blurOnSubmit"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
};

export default function TextField({
  control,
  name,
  label,
  required,
  maxLength,
  helperText,
  keyboardType = "default",
  rules,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
}: Props) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange, onBlur } }) => (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-semibold text-slate-600">
              {label.toUpperCase()}{" "}
              {required ? <Text className="text-red-500">*</Text> : null}
            </Text>
            {maxLength ? (
              <Text className="text-[12px] text-slate-400">
                {value?.length ?? 0}/{maxLength} characters
              </Text>
            ) : null}
          </View>

          <View className="rounded-xl border border-slate-200 bg-white px-3 py-3 min-h-[52px] justify-center">
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={maxLength}
              keyboardType={keyboardType}
              returnKeyType={returnKeyType}
              blurOnSubmit={blurOnSubmit}
              onSubmitEditing={onSubmitEditing}
              className="text-slate-900 text-[16px]"
              style={{ paddingVertical: 0, textAlignVertical: "center" }}
            />
          </View>

          {helperText ? (
            <Text className="mt-1 text-[11px] text-slate-400">
              {helperText}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}
