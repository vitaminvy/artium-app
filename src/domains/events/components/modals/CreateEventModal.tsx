import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Keyboard, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, TimeZoneOption } from "../../types";
import { DEFAULT_TIME_ZONE_ID, TIME_ZONE_OPTIONS } from "../../constants.optimized";
import SelectSheet from "../ui/SelectSheet.optimized";
import MultiSelectSheet from "../ui/MultiSelectSheet";

const MAX_TITLE = 255;
const MAX_VENUE = 255;
const MAX_DESCRIPTION = 10000;

const getDefaultTimeZone = () =>
  TIME_ZONE_OPTIONS.find((option) => option.id === DEFAULT_TIME_ZONE_ID) ??
  TIME_ZONE_OPTIONS[0];


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

  // Memoized handlers for radio buttons to avoid recreating callbacks every render
  const handleInPerson = useCallback(() => setLocationMode("inPerson"), []);
  const handleOnline = useCallback(() => setLocationMode("online"), []);
  const handleVisibilityPublic = useCallback(
    () => setVisibility("public"),
    []
  );
  const handleVisibilityPrivate = useCallback(
    () => setVisibility("private"),
    []
  );

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
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={32}
            enableOnAndroid
            enableAutomaticScroll
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
                    onPress={handleInPerson}
                  />
                  <RadioOption
                    label="Online"
                    selected={locationMode === "online"}
                    onPress={handleOnline}
                  />
                </View>
              </View>

              {locationMode === "inPerson" ? (
                <View className="gap-3">
                  <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <TextInput
                      ref={addressRef}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Search address"
                      placeholderTextColor="#94A3B8"
                      className="text-[14px] text-slate-900"
                      style={{ paddingVertical: 0 }}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => venueRef.current?.focus()}
                    />
                  </View>
                  <View className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 flex-row items-center">
                    <TextInput
                      ref={venueRef}
                      value={venueDetails}
                      onChangeText={setVenueDetails}
                      placeholder="Venue details (Optional)"
                      placeholderTextColor="#94A3B8"
                      maxLength={MAX_VENUE}
                      className="flex-1 text-[14px] text-slate-900"
                      style={{ paddingVertical: 0 }}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => descriptionRef.current?.focus()}
                    />
                    <Text className="text-[11px] text-slate-400">
                      {venueDetails.length}/{MAX_VENUE}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <TextInput
                    ref={websiteRef}
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="https://www.example.com"
                    placeholderTextColor="#94A3B8"
                    className="text-[14px] text-slate-900"
                    style={{ paddingVertical: 0 }}
                    autoCapitalize="none"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => descriptionRef.current?.focus()}
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
                    onPress={handleVisibilityPublic}
                  />
                  <RadioOption
                    label="Private"
                    selected={visibility === "private"}
                    onPress={handleVisibilityPrivate}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  DESCRIPTION <Text className="text-red-500">*</Text>
                </Text>
                <View className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <TextInput
                    ref={descriptionRef}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Tell people a little more about your event"
                    placeholderTextColor="#94A3B8"
                    maxLength={MAX_DESCRIPTION}
                    multiline={false}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={Keyboard.dismiss}
                    className="text-[14px] text-slate-900"
                    style={{ paddingVertical: 4, minHeight: 48 }}
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

// OPTIMIZED: React.memo to prevent unnecessary re-renders + larger hit area
const RadioOption = React.memo(({ label, selected, onPress }: RadioProps) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      className="flex-row items-center gap-2 py-2"
    >
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={18}
        color={selected ? "#0B73FF" : "#94A3B8"}
      />
      <Text className="text-[13px] font-semibold text-slate-800">
        {label}
      </Text>
    </Pressable>
  );
});

type DateTimeFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

function DateTimeField({ value, onChange }: DateTimeFieldProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setPickerVisible(true)}
        className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 flex-row items-center"
      >
        <Ionicons name="calendar-outline" size={16} color="#0F172A" />
        <Text className="ml-3 text-[14px] text-slate-900">
          {value.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        date={value}
        onConfirm={(date) => {
          onChange(date);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
        headerTextIOS="Select date & time"
        confirmTextIOS="Done"
        cancelTextIOS="Cancel"
      />
    </>
  );
}
