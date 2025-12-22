import React, { useEffect, useRef, useState } from "react";
import { Controller, Control } from "react-hook-form";
import { View, Text, TextInput, Pressable, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EDIT_PROFILE_COUNTRY_FALLBACKS } from "../../constants/editProfile";
import { EditProfileFormValues } from "../../types";
import CountryPickerModal, { flagEmoji } from "./CountryPickerModal";
import { fetchCountryOptions } from "../../services/countryService";

type Props = {
  control: Control<EditProfileFormValues>;
  label: string;
  required?: boolean;
  maxLength?: number;
  inputRef?: React.RefObject<TextInput | null>;
  returnKeyType?: TextInputProps["returnKeyType"];
  blurOnSubmit?: TextInputProps["blurOnSubmit"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
};

export default function PhoneField({
  control,
  label,
  required,
  maxLength,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
}: Props) {
  const [open, setOpen] = useState(false);
  const [countryOptions, setCountryOptions] = useState(
    EDIT_PROFILE_COUNTRY_FALLBACKS
  );
  const [anchor, setAnchor] = useState<{ y: number; height: number }>({
    y: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    let isActive = true;
    fetchCountryOptions()
      .then((options) => {
        if (isActive && options.length) {
          setCountryOptions(options);
        }
      })
      .catch(() => {
        // Fallback stays in place on failure.
      });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-slate-600 mb-1">
        {label.toUpperCase()}{" "}
        {required ? <Text className="text-red-500">*</Text> : null}
      </Text>

      <View className="rounded-xl border border-slate-200 bg-white px-3 py-3 flex-row items-center min-h-[52px] justify-center">
        <Controller
          control={control}
          name="countryCode"
          render={({ field: { value, onChange } }) => {
            const selected =
              countryOptions.find((c) => c.code === value) ?? countryOptions[0];
            return (
              <>
                <Pressable
                  ref={triggerRef}
                  onPress={() => {
                    if (triggerRef.current) {
                      triggerRef.current.measureInWindow((_, y, __, h) => {
                        setAnchor({ y, height: h });
                        setOpen(true);
                      });
                    } else {
                      setOpen(true);
                    }
                  }}
                  className="flex-row items-center pr-3"
                >
                  <View className="h-8 w-10 rounded-lg border border-slate-200 items-center justify-center bg-slate-50">
                    <Text className="text-lg">{flagEmoji(selected.code)}</Text>
                  </View>
                  <Text className="ml-2 text-base font-semibold text-slate-900">
                    {selected.dialCode}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color="#94A3B8"
                    style={{ marginLeft: 4 }}
                  />
                </Pressable>

                <CountryPickerModal
                  visible={open}
                  options={countryOptions}
                  selectedCode={selected.code}
                  onClose={() => setOpen(false)}
                  onSelect={(code) => {
                    onChange(code);
                    setOpen(false);
                  }}
                  anchor={anchor}
                />
              </>
            );
          }}
        />

        <View className="h-6 w-px bg-slate-200 mx-3" />

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { value, onChange, onBlur } }) => {
            return (
              <TextInput
                ref={inputRef}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={maxLength}
                keyboardType="phone-pad"
                returnKeyType={returnKeyType}
                blurOnSubmit={blurOnSubmit}
                onSubmitEditing={onSubmitEditing}
                className="flex-1 text-slate-900 text-[16px]"
                style={{ paddingVertical: 0, textAlignVertical: "center" }}
              />
            );
          }}
        />
      </View>
      <Text className="mt-1 text-[11px] text-slate-400">
        We will only use your phone number for delivery purposes.
      </Text>
    </View>
  );
}
