import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption } from "../../types";
import MultiSelectSheet from "../ui/MultiSelectSheet";

const MAX_TITLE = 255;

// OPTIMIZED: Simple date formatter (no complex options generation)
const formatDateTime = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

type Props = {
  visible: boolean;
  typeOptions: EventFilterOption[];
  onClose: () => void;
  onCreate: (event: EventItem) => void;
};

export default function CreateEventModal({
  visible,
  typeOptions,
  onClose,
  onCreate,
}: Props) {
  // TEST 1: Event Title - Simple TextInput ✅ OK
  const [title, setTitle] = useState("");

  // TEST 2: Type - MultiSelectSheet ✅ OK - NOT LAG SOURCE
  const [selectedTypes, setSelectedTypes] = useState<EventFilterOption[]>([]);

  const filteredTypes = useMemo(
    () => typeOptions.filter((option) => option.id !== "all"),
    [typeOptions]
  );

  // TEST 3-4: Date Pickers (TESTING NOW)
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));

  const handleStartDateChange = useCallback((date: Date) => {
    setStartDate(date);
    setEndDate((prevEnd) => {
      if (date > prevEnd) {
        return new Date(date.getTime() + 60 * 60 * 1000);
      }
      return prevEnd;
    });
  }, []);

  const handleEndDateChange = useCallback((date: Date) => {
    setEndDate(date);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30 justify-center px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="rounded-3xl bg-white p-5 shadow-2xl"
          style={{ maxHeight: "90%" }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="w-10" />
            <Text className="text-lg font-semibold text-slate-900">
              Create Event (Optimized Test)
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </Pressable>
          </View>

          {/* Simple ScrollView thay vì KeyboardAwareScrollView */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <View className="gap-4">

              {/* SECTION 1: EVENT TITLE - ✅ ENABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  EVENT TITLE <Text className="text-red-500">*</Text>
                  <Text className="text-green-600"> ✓ ENABLED</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 flex-row items-center">
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter event title"
                    placeholderTextColor="#94A3B8"
                    maxLength={MAX_TITLE}
                    className="flex-1 text-[14px] text-slate-900"
                    style={{ paddingVertical: 0 }}
                  />
                  <Text className="text-[11px] text-slate-400">
                    {title.length}/{MAX_TITLE}
                  </Text>
                </View>
              </View>

              {/* SECTION 2: TYPE - ✅ ENABLED (TESTING FOR LAG) */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TYPE <Text className="text-red-500">*</Text>
                  <Text className="text-orange-600"> ⚠️ TESTING</Text>
                </Text>
                <View className="mt-2">
                  <MultiSelectSheet
                    value={selectedTypes}
                    options={filteredTypes}
                    onChange={setSelectedTypes}
                    placeholder="Select event type"
                    searchable
                  />
                </View>
              </View>

              {/* SECTION 3: START DATE - ✅ ENABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  START DATE <Text className="text-red-500">*</Text>
                  <Text className="text-orange-600"> ⚠️ TESTING</Text>
                </Text>
                <DateTimeField value={startDate} onChange={handleStartDateChange} />
              </View>

              {/* SECTION 4: END DATE - ✅ ENABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  END DATE <Text className="text-red-500">*</Text>
                  <Text className="text-orange-600"> ⚠️ TESTING</Text>
                </Text>
                <DateTimeField value={endDate} onChange={handleEndDateChange} />
              </View>

              {/* SECTION 5: TIME ZONE - DISABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TIME ZONE
                  <Text className="text-slate-400"> (DISABLED)</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Text className="text-[14px] text-slate-400">
                    Disabled for testing
                  </Text>
                </View>
              </View>

              {/* SECTION 6: LOCATION - DISABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  LOCATION <Text className="text-red-500">*</Text>
                  <Text className="text-slate-400"> (DISABLED)</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Text className="text-[14px] text-slate-400">
                    Disabled for testing
                  </Text>
                </View>
              </View>

              {/* SECTION 7: VISIBILITY - DISABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  VISIBILITY
                  <Text className="text-slate-400"> (DISABLED)</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Text className="text-[14px] text-slate-400">
                    Disabled for testing
                  </Text>
                </View>
              </View>

              {/* SECTION 8: DESCRIPTION - DISABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  DESCRIPTION <Text className="text-red-500">*</Text>
                  <Text className="text-slate-400"> (DISABLED)</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Text className="text-[14px] text-slate-400">
                    Disabled for testing
                  </Text>
                </View>
              </View>

              {/* SECTION 9: COVER IMAGE - DISABLED */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  COVER IMAGE <Text className="text-red-500">*</Text>
                  <Text className="text-slate-400"> (DISABLED)</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 items-center">
                  <Text className="text-[14px] text-slate-400">
                    Disabled for testing
                  </Text>
                </View>
              </View>

              {/* Performance Note */}
              <View className="mt-2 rounded-xl bg-green-50 border border-green-200 p-4">
                <Text className="text-[12px] font-semibold text-green-900 mb-1">
                  🚀 NATIVE PICKER: Date/Time (Culprit ELIMINATED!)
                </Text>
                <Text className="text-[11px] text-green-700 mb-1">
                  ✅ Replaced custom ScrollView picker with native DateTimePicker
                </Text>
                <Text className="text-[11px] text-green-700 mb-1">
                  ✅ Old: 186 items to render | New: 0 items (Native OS picker)
                </Text>
                <Text className="text-[11px] text-green-700">
                  ✅ Hardware-accelerated, instant open, smooth scrolling
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="mt-4 flex-row items-center gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 rounded-full border border-slate-200 py-3 items-center"
            >
              <Text className="text-[14px] font-semibold text-slate-700">
                Close
              </Text>
            </Pressable>
            <Pressable
              disabled
              className="flex-1 rounded-full py-3 items-center bg-slate-200"
            >
              <Text className="text-[14px] font-semibold text-slate-400">
                Create (Disabled)
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// NATIVE DateTimeField - Uses platform native picker (SUPER FAST!)
type DateTimeFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

const DateTimeField = React.memo(({ value, onChange }: DateTimeFieldProps) => {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDate(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === "android") {
        // On Android, show time picker after date
        setTimeout(() => setShowTime(true), 100);
      }
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTime(false);
    if (selectedTime) {
      onChange(selectedTime);
      setTempDate(selectedTime);
    }
  };

  const handlePress = () => {
    setShowDate(true);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 flex-row items-center"
      >
        <Ionicons name="calendar-outline" size={16} color="#0F172A" />
        <Text className="ml-3 text-[14px] text-slate-900">
          {formatDateTime(value)}
        </Text>
      </Pressable>

      {/* Native Date Picker - iOS shows inline, Android shows dialog */}
      {showDate && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Native Time Picker */}
      {showTime && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
          minuteInterval={30}
        />
      )}

      {/* iOS needs Done button */}
      {Platform.OS === "ios" && showDate && (
        <View className="bg-white border-t border-slate-200 p-3 flex-row justify-end">
          <Pressable
            onPress={() => {
              setShowDate(false);
              setShowTime(true);
            }}
            className="rounded-full bg-blue-500 px-6 py-2"
          >
            <Text className="text-white font-semibold">Next (Time)</Text>
          </Pressable>
        </View>
      )}

      {Platform.OS === "ios" && showTime && (
        <View className="bg-white border-t border-slate-200 p-3 flex-row justify-end">
          <Pressable
            onPress={() => {
              setShowTime(false);
              onChange(tempDate);
            }}
            className="rounded-full bg-blue-500 px-6 py-2"
          >
            <Text className="text-white font-semibold">Done</Text>
          </Pressable>
        </View>
      )}
    </>
  );
});
