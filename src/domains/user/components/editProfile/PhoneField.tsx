import React, { useMemo, useRef, useState } from "react";
import { Controller, Control } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EDIT_PROFILE_COUNTRIES } from "../../constants/editProfile";

type Props = {
  control: Control<any>;
  label: string;
  required?: boolean;
  maxLength?: number;
};

export default function PhoneField({
  control,
  label,
  required,
  maxLength,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ y: number; height: number }>({
    y: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);

  const countryOptions = useMemo(() => EDIT_PROFILE_COUNTRIES, []);

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
            const sample =
              countryOptions.find(
                (c) => c.code === (control as any)?._formValues?.countryCode
              )?.sample ?? "Phone number";
            return (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={sample}
                maxLength={maxLength}
                keyboardType="phone-pad"
                className="flex-1 text-slate-900 text-[16px]"
                style={{ paddingVertical: 0, textAlignVertical: "center" }}
                placeholderTextColor="#94A3B8"
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

type PickerProps = {
  visible: boolean;
  options: typeof EDIT_PROFILE_COUNTRIES;
  selectedCode: string;
  onClose: () => void;
  onSelect: (code: string) => void;
  anchor: { y: number; height: number };
};

function CountryPickerModal({
  visible,
  options,
  selectedCode,
  onClose,
  onSelect,
  anchor,
}: PickerProps) {
  const { height } = useWindowDimensions();
  const topCandidate = anchor.y + anchor.height + 8;
  const top = Math.min(Math.max(topCandidate, 120), height - 360);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
      />
      <View
        className="absolute left-4 right-4 rounded-2xl bg-white p-4 shadow-lg"
        style={{
          top,
          maxHeight: "60%",
        }}
      >
        <Text className="text-base font-semibold text-slate-900 mb-3">
          Select country
        </Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.code)}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center" style={{ columnGap: 10 }}>
                <View className="h-8 w-10 rounded-lg border border-slate-200 items-center justify-center bg-slate-50">
                  <Text className="text-lg">{flagEmoji(item.code)}</Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </Text>
                  <Text className="text-[12px] text-slate-500">
                    {item.dialCode}
                  </Text>
                </View>
              </View>
              {selectedCode === item.code ? (
                <Ionicons name="checkmark" size={18} color="#0F172A" />
              ) : null}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
        />
      </View>
    </Modal>
  );
}

const flagEmoji = (countryCode: string) => {
  if (!countryCode) return "🏳️";
  const codePoints = countryCode
    .trim()
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
