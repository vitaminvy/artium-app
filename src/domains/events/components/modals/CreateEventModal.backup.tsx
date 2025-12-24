import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, TimeZoneOption } from "../../types";
import { DEFAULT_TIME_ZONE_ID, TIME_ZONE_OPTIONS } from "../../constants";
import SelectSheet from "../ui/SelectSheet";
import MultiSelectSheet from "../ui/MultiSelectSheet";

const MAX_TITLE = 255;
const MAX_VENUE = 255;
const MAX_DESCRIPTION = 10000;

const formatDateTime = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

const getDefaultTimeZone = () =>
  TIME_ZONE_OPTIONS.find((option) => option.id === DEFAULT_TIME_ZONE_ID) ??
  TIME_ZONE_OPTIONS[0];

const pad = (value: number) => `${value}`.padStart(2, "0");
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;


type LocationMode = "inPerson" | "online";

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
  // Refs for keyboard navigation
  const titleRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const venueRef = useRef<TextInput>(null);
  const websiteRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<EventFilterOption[]>([]);
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));
  const [timeZone, setTimeZone] = useState<TimeZoneOption>(() =>
    getDefaultTimeZone()
  );
  const [locationMode, setLocationMode] = useState<LocationMode>("inPerson");
  const [address, setAddress] = useState("");
  const [venueDetails, setVenueDetails] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState({
    title: "",
    type: "",
    location: "",
    description: "",
    cover: "",
  });

  useEffect(() => {
    if (!visible) {
      setTitle("");
      setSelectedTypes([]);
      const now = new Date();
      setStartDate(now);
      setEndDate(new Date(now.getTime() + 60 * 60 * 1000));
      setTimeZone(getDefaultTimeZone());
      setLocationMode("inPerson");
      setAddress("");
      setVenueDetails("");
      setWebsiteUrl("");
      setVisibility("public");
      setDescription("");
      setCoverImage(null);
      setErrors({
        title: "",
        type: "",
        location: "",
        description: "",
        cover: "",
      });
    }
  }, [visible]);

  const filteredTypes = useMemo(
    () => typeOptions.filter((option) => option.id !== "all"),
    [typeOptions]
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

  const pickCoverImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setCoverImage(result.assets[0].uri);
    }
  }, []);

  // Memoize validation để tránh tính toán lại mỗi render
  const canCreate = useMemo(() => {
    const hasType = selectedTypes.length > 0;
    const hasTitle = title.trim().length > 0;
    const hasLocation =
      locationMode === "inPerson"
        ? address.trim().length > 0
        : websiteUrl.trim().length > 0;
    const hasDescription = description.trim().length > 0;
    const hasCover = !!coverImage;
    const endAfterStart = endDate.getTime() >= startDate.getTime();

    return (
      hasTitle &&
      hasType &&
      endAfterStart &&
      hasLocation &&
      hasDescription &&
      hasCover
    );
  }, [
    selectedTypes,
    title,
    locationMode,
    address,
    websiteUrl,
    description,
    coverImage,
    startDate,
    endDate,
  ]);

  const validateForm = useCallback(() => {
    const newErrors = {
      title: "",
      type: "",
      location: "",
      description: "",
      cover: "",
    };

    if (!title.trim()) {
      newErrors.title = "Event title is required";
    }
    if (selectedTypes.length === 0) {
      newErrors.type = "Please select at least one event type";
    }
    if (locationMode === "inPerson" && !address.trim()) {
      newErrors.location = "Address is required for in-person events";
    }
    if (locationMode === "online" && !websiteUrl.trim()) {
      newErrors.location = "Website URL is required for online events";
    }
    if (!description.trim()) {
      newErrors.description = "Event description is required";
    }
    if (!coverImage) {
      newErrors.cover = "Cover image is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [title, selectedTypes, locationMode, address, websiteUrl, description, coverImage]);

  const handleCreate = useCallback(() => {
    if (!canCreate || !validateForm()) return;

    const now = new Date().toISOString();
    const typeLabels = selectedTypes.map((item) => item.label);
    const locationValue =
      locationMode === "online" ? websiteUrl.trim() : address.trim();

    // Format datetime cho EventCard
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();

    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: title.trim(),
      location: locationValue,
      datetime: startDateTime,
      endDatetime: endDateTime,
      createdAt: now,
      timeZone: timeZone.label,
      locationType: locationMode,
      visibility,
      description: description.trim(),
      venueDetails: venueDetails.trim() || undefined,
      websiteUrl: locationMode === "online" ? websiteUrl.trim() : undefined,
      image: coverImage || "",
      category: typeLabels.join(", "),
      eventType: typeLabels[0] || "Exhibition",
      attendees: 0,
      status: "upcoming",
      rsvpLabel: "RSVP",
      // Thêm các field cần thiết cho EventCard
      timeLabel: startDate.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    onCreate(newEvent);
    onClose();
  }, [
    canCreate,
    validateForm,
    selectedTypes,
    locationMode,
    websiteUrl,
    address,
    title,
    startDate,
    endDate,
    timeZone,
    visibility,
    description,
    venueDetails,
    coverImage,
    onCreate,
    onClose,
  ]);

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
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10" />
            <Text className="text-lg font-semibold text-slate-900">
              Create Event
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </Pressable>
          </View>

          <KeyboardAwareScrollView
            enableOnAndroid
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <View className="gap-4">
              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  EVENT TITLE <Text className="text-red-500">*</Text>
                </Text>
                <View className={`mt-2 rounded-2xl border ${errors.title ? "border-red-300" : "border-slate-200"} bg-white px-4 py-2.5 flex-row items-center`}>
                  <TextInput
                    ref={titleRef}
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    placeholder="Enter event title"
                    placeholderTextColor="#94A3B8"
                    maxLength={MAX_TITLE}
                    className="flex-1 text-[14px] text-slate-900"
                    style={{ paddingVertical: 0 }}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      if (locationMode === "inPerson") {
                        addressRef.current?.focus();
                      } else {
                        websiteRef.current?.focus();
                      }
                    }}
                  />
                  <Text className="text-[11px] text-slate-400">
                    {title.length}/{MAX_TITLE}
                  </Text>
                </View>
                {errors.title ? (
                  <Text className="mt-1 text-[11px] text-red-500">{errors.title}</Text>
                ) : null}
              </View>

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

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  START DATE <Text className="text-red-500">*</Text>
                </Text>
                <DateTimeField value={startDate} onChange={handleStartDateChange} />
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  END DATE <Text className="text-red-500">*</Text>
                </Text>
                <DateTimeField value={endDate} onChange={handleEndDateChange} />
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TIME ZONE
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

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  LOCATION <Text className="text-red-500">*</Text>
                </Text>
                <View className="mt-2 flex-row items-center gap-6">
                  <RadioOption
                    label="In-person"
                    selected={locationMode === "inPerson"}
                    onPress={() => setLocationMode("inPerson")}
                  />
                  <RadioOption
                    label="Online"
                    selected={locationMode === "online"}
                    onPress={() => setLocationMode("online")}
                  />
                </View>
              </View>

              {locationMode === "inPerson" ? (
                <View className="gap-3">
                  <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <TextInput
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Search address"
                      placeholderTextColor="#94A3B8"
                      className="text-[14px] text-slate-900"
                      style={{ paddingVertical: 0 }}
                    />
                  </View>
                  <View className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 flex-row items-center">
                    <TextInput
                      value={venueDetails}
                      onChangeText={setVenueDetails}
                      placeholder="Venue details (Optional)"
                      placeholderTextColor="#94A3B8"
                      maxLength={MAX_VENUE}
                      className="flex-1 text-[14px] text-slate-900"
                      style={{ paddingVertical: 0 }}
                    />
                    <Text className="text-[11px] text-slate-400">
                      {venueDetails.length}/{MAX_VENUE}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <TextInput
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="https://www.example.com"
                    placeholderTextColor="#94A3B8"
                    className="text-[14px] text-slate-900"
                    style={{ paddingVertical: 0 }}
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  VISIBILITY
                </Text>
                <View className="mt-2 flex-row items-center gap-6">
                  <RadioOption
                    label="Public"
                    selected={visibility === "public"}
                    onPress={() => setVisibility("public")}
                  />
                  <RadioOption
                    label="Private"
                    selected={visibility === "private"}
                    onPress={() => setVisibility("private")}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  DESCRIPTION <Text className="text-red-500">*</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Tell people a little more about your event"
                    placeholderTextColor="#94A3B8"
                    maxLength={MAX_DESCRIPTION}
                    multiline
                    className="text-[14px] text-slate-900"
                    style={{ minHeight: 120, textAlignVertical: "top" }}
                  />
                  <Text className="text-[11px] text-slate-400 text-right mt-2">
                    {description.length}/{MAX_DESCRIPTION}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  COVER IMAGE <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={pickCoverImage}
                  className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 items-center"
                >
                  {coverImage ? (
                    <View className="w-full">
                      <Image
                        source={{ uri: coverImage }}
                        className="w-full h-40 rounded-2xl"
                        resizeMode="cover"
                      />
                      <View className="mt-3 rounded-full border border-slate-200 px-4 py-2 self-center">
                        <Text className="text-[12px] font-semibold text-slate-700">
                          Change image
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View className="h-10 w-10 rounded-xl border border-slate-200 items-center justify-center bg-slate-50">
                        <Ionicons name="image-outline" size={20} color="#0F172A" />
                      </View>
                      <Text className="mt-3 text-[13px] font-semibold text-slate-900">
                        Upload image from device
                      </Text>
                      <Text className="mt-1 text-[11px] text-slate-400 text-center">
                        Supported formats: PNG, JPG. Max: 2MB.
                      </Text>
                      <Text className="text-[11px] text-slate-400 text-center">
                        A high-resolution image is recommended.
                      </Text>
                      <View className="mt-3 rounded-full border border-slate-200 px-4 py-2">
                        <Text className="text-[12px] font-semibold text-slate-700">
                          Upload image
                        </Text>
                      </View>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAwareScrollView>

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
              onPress={handleCreate}
              disabled={!canCreate}
              className="flex-1 rounded-full py-3 items-center"
              style={{ backgroundColor: canCreate ? "#0B73FF" : "#E2E8F0" }}
            >
              <Text
                className="text-[14px] font-semibold"
                style={{ color: canCreate ? "#FFFFFF" : "#94A3B8" }}
              >
                Create
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type RadioProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function RadioOption({ label, selected, onPress }: RadioProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-2">
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={16}
        color={selected ? "#0B73FF" : "#94A3B8"}
      />
      <Text className="text-[13px] font-semibold text-slate-800">
        {label}
      </Text>
    </Pressable>
  );
}

type DateTimeFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

// Memoize date/time options OUTSIDE component để tránh re-calculate
const generateDateOptions = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 90 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
};

const generateTimeOptions = () => {
  const options: { hours: number; minutes: number }[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      options.push({ hours: hour, minutes: minute });
    }
  }
  return options;
};

const DATE_OPTIONS = generateDateOptions();
const TIME_OPTIONS = generateTimeOptions();

function DateTimeField({ value, onChange }: DateTimeFieldProps) {
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
  const selectedTimeKey = `${pad(tempTime.hours)}:${pad(tempTime.minutes)}`;

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
                              year: "numeric",
                            })}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View className="w-24">
                <Text className="text-[12px] font-semibold text-slate-500 mb-2">
                  Time
                </Text>
                <ScrollView
                  className="rounded-2xl border border-slate-200 bg-white"
                  style={{ maxHeight: 224 }}
                  showsVerticalScrollIndicator={true}
                >
                  <View className="px-3 py-2">
                    {TIME_OPTIONS.map((option) => {
                      const key = `${pad(option.hours)}:${pad(option.minutes)}`;
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
}
