import React, { useCallback, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, TimeZoneOption } from "../../types";
import MultiSelectSheet from "../ui/MultiSelectSheet";
import SelectSheet from "../ui/SelectSheet.optimized";
import { DEFAULT_TIME_ZONE_ID, TIME_ZONE_OPTIONS } from "../../constants.optimized";

const MAX_TITLE = 255;
const MAX_VENUE = 255;
const MAX_DESCRIPTION = 10000;

type LocationMode = "inPerson" | "online";

// OPTIMIZED: Simple utilities
const formatDateTime = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

const pad = (value: number) => `${value}`.padStart(2, "0");
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// OPTIMIZED: Reduced from 90 → 14 days (2 weeks only)
const generateDateOptions = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 14 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
};

// OPTIMIZED: 1-hour intervals instead of 30min (24 items total)
const generateTimeOptions = () => {
  const options: { hours: number; minutes: number }[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    options.push({ hours: hour, minutes: 0 });
  }
  return options;
};

const DATE_OPTIONS = generateDateOptions();
const TIME_OPTIONS = generateTimeOptions();

const getDefaultTimeZone = () =>
  TIME_ZONE_OPTIONS.find((option) => option.id === DEFAULT_TIME_ZONE_ID) ??
  TIME_ZONE_OPTIONS[0];

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
  const [title, setTitle] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<EventFilterOption[]>([]);
  const filteredTypes = useMemo(
    () => typeOptions.filter((option) => option.id !== "all"),
    [typeOptions]
  );

  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));

  // TEST 5: Time Zone SelectSheet (316 timezones - POTENTIAL LAG)
  const [timeZone, setTimeZone] = useState<TimeZoneOption>(() =>
    getDefaultTimeZone()
  );

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
          <View className="flex-row items-center justify-between mb-4">
            <View className="w-10" />
            <Text className="text-lg font-semibold text-slate-900">
              Create Event
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <View className="gap-4">
              {/* EVENT TITLE */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  EVENT TITLE <Text className="text-red-500">*</Text>
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

              {/* TYPE */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TYPE <Text className="text-red-500">*</Text>
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

              {/* START DATE */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  START DATE <Text className="text-red-500">*</Text>
                </Text>
                <DateTimeField value={startDate} onChange={handleStartDateChange} />
              </View>

              {/* END DATE */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  END DATE <Text className="text-red-500">*</Text>
                </Text>
                <DateTimeField value={endDate} onChange={handleEndDateChange} />
              </View>

              {/* TIME ZONE - OPTIMIZED (50 popular timezones) */}
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TIME ZONE
                  <Text className="text-green-600"> ✓ OPTIMIZED (50 items)</Text>
                </Text>
                <View className="mt-2">
                  <SelectSheet
                    value={timeZone}
                    options={TIME_ZONE_OPTIONS}
                    onChange={setTimeZone}
                    searchable
                    searchPlaceholder="Search time zone"
                    offset={4}
                  />
                </View>
              </View>

              {/* Performance Note */}
              <View className="mt-2 rounded-xl bg-green-50 border border-green-200 p-4">
                <Text className="text-[12px] font-semibold text-green-900 mb-1">
                  ✅ OPTIMIZED: Time Zone (Fixed!)
                </Text>
                <Text className="text-[11px] text-green-700 mb-1">
                  • Reduced: 316 → 50 popular timezones (84% less)
                </Text>
                <Text className="text-[11px] text-green-700">
                  • Fixed: Added KeyboardAvoidingView for search box
                </Text>
              </View>
            </View>
          </ScrollView>

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
                Create
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Lightweight DateTimeField - MINIMAL render
type DateTimeFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

const DateTimeField = React.memo(({ value, onChange }: DateTimeFieldProps) => {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value);
  const [tempTime, setTempTime] = useState({
    hours: value.getHours(),
    minutes: value.getMinutes(),
  });

  const openPicker = () => {
    setTempDate(value);
    setTempTime({ hours: value.getHours(), minutes: value.getMinutes() });
    setOpen(true);
  };

  const applySelection = () => {
    const next = new Date(tempDate);
    next.setHours(tempTime.hours, tempTime.minutes, 0, 0);
    onChange(next);
    setOpen(false);
  };

  const selectedDateKey = dateKey(tempDate);
  const selectedTimeKey = `${pad(tempTime.hours)}:00`;

  return (
    <>
      <Pressable
        onPress={openPicker}
        className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 flex-row items-center"
      >
        <Ionicons name="calendar-outline" size={16} color="#0F172A" />
        <Text className="ml-3 text-[14px] text-slate-900">
          {formatDateTime(value)}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 bg-black/30 justify-center px-4">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View className="rounded-3xl bg-white p-5 shadow-2xl">
            <Text className="text-[15px] font-semibold text-slate-900 text-center">
              Select date & time
            </Text>

            <View className="mt-4 flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[12px] font-semibold text-slate-500 mb-2">
                  Date
                </Text>
                <ScrollView
                  className="rounded-2xl border border-slate-200 bg-white"
                  style={{ maxHeight: 224 }}
                  showsVerticalScrollIndicator={true}
                >
                  <View className="px-3 py-2">
                    {DATE_OPTIONS.map((option) => {
                      const key = dateKey(option);
                      const active = key === selectedDateKey;
                      return (
                        <Pressable
                          key={key}
                          onPress={() => setTempDate(option)}
                          className="py-2 px-2 rounded-xl"
                          style={{ backgroundColor: active ? "#E8F1FF" : "transparent" }}
                        >
                          <Text
                            className="text-[12px] font-semibold"
                            style={{ color: active ? "#0B73FF" : "#0F172A" }}
                          >
                            {option.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View className="w-20">
                <Text className="text-[12px] font-semibold text-slate-500 mb-2">
                  Hour
                </Text>
                <ScrollView
                  className="rounded-2xl border border-slate-200 bg-white"
                  style={{ maxHeight: 224 }}
                  showsVerticalScrollIndicator={true}
                >
                  <View className="px-3 py-2">
                    {TIME_OPTIONS.map((option) => {
                      const key = `${pad(option.hours)}:00`;
                      const active = key === selectedTimeKey;
                      return (
                        <Pressable
                          key={key}
                          onPress={() => setTempTime(option)}
                          className="py-2 px-2 rounded-xl"
                          style={{ backgroundColor: active ? "#E8F1FF" : "transparent" }}
                        >
                          <Text
                            className="text-[12px] font-semibold text-center"
                            style={{ color: active ? "#0B73FF" : "#0F172A" }}
                          >
                            {key}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View className="mt-5 flex-row items-center gap-3">
              <Pressable
                onPress={() => setOpen(false)}
                className="flex-1 rounded-full border border-slate-200 py-3 items-center"
              >
                <Text className="text-[14px] font-semibold text-slate-700">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={applySelection}
                className="flex-1 rounded-full py-3 items-center"
                style={{ backgroundColor: "#0B73FF" }}
              >
                <Text className="text-[14px] font-semibold text-white">
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});
