import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Keyboard, Modal, Platform, Pressable, Text, TextInput, View, type LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, TimeZoneOption } from "../../types";
import { DEFAULT_TIME_ZONE_ID, TIME_ZONE_OPTIONS } from "../../constants.optimized";
import SelectSheet from "../ui/SelectSheet.optimized";
import MultiSelectSheet from "../ui/MultiSelectSheet";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { useProfileContext } from "@/domains/user/contexts/ProfileContext";

const MAX_TITLE = 255;
const MAX_VENUE = 255;
const MAX_DESCRIPTION = 10000;
type ErrorKey = "title" | "type" | "date" | "location" | "description" | "cover";
const INITIAL_ERRORS: Record<ErrorKey, string> = {
  title: "",
  type: "",
  date: "",
  location: "",
  description: "",
  cover: "",
};

const getDefaultTimeZone = () =>
  TIME_ZONE_OPTIONS.find((option) => option.id === DEFAULT_TIME_ZONE_ID) ??
  TIME_ZONE_OPTIONS[0];


type LocationMode = "inPerson" | "online";

type Props = {
  visible: boolean;
  typeOptions: EventFilterOption[];
  onClose: () => void;
  onCreate: (event: EventItem) => Promise<boolean | void> | boolean | void;
};

export default function CreateEventModal({
  visible,
  typeOptions,
  onClose,
  onCreate,
}: Props) {
  const { currentUser } = useAuth();
  const { editProfile } = useProfileContext();
  // Refs for keyboard navigation
  const titleRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const venueRef = useRef<TextInput>(null);
  const websiteRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  // Store initial values to compare changes
  const initialStartDateRef = useRef<Date>(new Date());
  const initialEndDateRef = useRef<Date>(new Date(Date.now() + 60 * 60 * 1000));
  const initialTimeZoneRef = useRef<TimeZoneOption>(getDefaultTimeZone());

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
  const [isCreating, setIsCreating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<ErrorKey, string>>(() => ({ ...INITIAL_ERRORS }));
  const fieldPositions = useRef<Partial<Record<ErrorKey, number>>>({});

  const markDirty = useCallback(() => {
    setHasChanges(true);
  }, []);

  useEffect(() => {
    if (visible) {
      // When modal opens, store initial values
      const now = new Date();
      const endDateTime = new Date(now.getTime() + 60 * 60 * 1000);
      const defaultTz = getDefaultTimeZone();

      initialStartDateRef.current = now;
      initialEndDateRef.current = endDateTime;
      initialTimeZoneRef.current = defaultTz;

      setStartDate(now);
      setEndDate(endDateTime);
      setTimeZone(defaultTz);
    } else {
      // When modal closes, reset everything
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
      setShowExitConfirm(false);
      setErrors({ ...INITIAL_ERRORS });
      setHasChanges(false);
      setIsCreating(false);
      fieldPositions.current = {};
    }
  }, [visible]);

  const filteredTypes = useMemo(
    () => typeOptions.filter((option) => option.id !== "all"),
    [typeOptions]
  );

  const registerFieldPosition = useCallback(
    (key: ErrorKey) => (event: LayoutChangeEvent) => {
      fieldPositions.current[key] = event.nativeEvent.layout.y;
    },
    []
  );

  const scrollToField = useCallback((key: ErrorKey) => {
    const y = fieldPositions.current[key];
    if (y === undefined) return;

    const targetY = Math.max(y - 12, 0);
    const node = scrollRef.current as any;
    if (typeof node?.scrollToPosition === "function") {
      node.scrollToPosition(0, targetY, true);
    } else if (typeof node?.scrollTo === "function") {
      node.scrollTo({ x: 0, y: targetY, animated: true });
    }
  }, []);

  const focusField = useCallback(
    (key: ErrorKey) => {
      if (key === "title") {
        titleRef.current?.focus();
        return;
      }
      if (key === "location") {
        if (locationMode === "inPerson") {
          addressRef.current?.focus();
        } else {
          websiteRef.current?.focus();
        }
        return;
      }
      if (key === "description") {
        descriptionRef.current?.focus();
      }
    },
    [locationMode]
  );

  const handleStartDateChange = useCallback((date: Date) => {
    setStartDate(date);
    setEndDate((prevEnd) => {
      if (date > prevEnd) {
        return new Date(date.getTime() + 60 * 60 * 1000);
      }
      return prevEnd;
    });
    setErrors((prev) => ({ ...prev, date: "" }));
    markDirty();
  }, [markDirty]);

  const handleEndDateChange = useCallback((date: Date) => {
    setEndDate(date);
    setErrors((prev) => ({ ...prev, date: "" }));
    markDirty();
  }, [markDirty]);

  // Memoized handlers for radio buttons to avoid recreating callbacks every render
  const handleInPerson = useCallback(() => {
    setLocationMode("inPerson");
    setErrors((prev) => ({ ...prev, location: "" }));
    markDirty();
  }, [markDirty]);
  const handleOnline = useCallback(() => {
    setLocationMode("online");
    setErrors((prev) => ({ ...prev, location: "" }));
    markDirty();
  }, [markDirty]);
  const handleVisibilityPublic = useCallback(
    () => {
      setVisibility("public");
      markDirty();
    },
    [markDirty]
  );
  const handleVisibilityPrivate = useCallback(
    () => {
      setVisibility("private");
      markDirty();
    },
    [markDirty]
  );

  const pickCoverImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setCoverImage(result.assets[0].uri);
      setErrors((prev) => ({ ...prev, cover: "" }));
      markDirty();
    }
  }, [markDirty]);
  
  const handleCloseAttempt = useCallback(() => {
    // Check directly if form has changes
    const hasTextChanges =
      title.trim() !== "" ||
      selectedTypes.length > 0 ||
      address.trim() !== "" ||
      venueDetails.trim() !== "" ||
      websiteUrl.trim() !== "" ||
      description.trim() !== "" ||
      coverImage !== null;

    // Check if date/timezone has changed from initial values
    const hasDateChanges =
      startDate.getTime() !== initialStartDateRef.current.getTime() ||
      endDate.getTime() !== initialEndDateRef.current.getTime() ||
      timeZone.id !== initialTimeZoneRef.current.id;

    const formHasChanges = hasTextChanges || hasDateChanges;

    if (formHasChanges && !isCreating) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  }, [title, selectedTypes, address, venueDetails, websiteUrl, description, coverImage, startDate, endDate, timeZone, isCreating, onClose]);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    onClose();
  }, [onClose]);

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

  const isCreateEnabled = canCreate && !isCreating;

  const validateForm = useCallback(() => {
    const newErrors: Record<ErrorKey, string> = {
      ...INITIAL_ERRORS,
    };
    const missing: ErrorKey[] = [];

    if (!title.trim()) {
      newErrors.title = "Please enter an event title";
      missing.push("title");
    }
    if (selectedTypes.length === 0) {
      newErrors.type = "Please select at least one event type";
      missing.push("type");
    }
    if (endDate.getTime() < startDate.getTime()) {
      newErrors.date = "End date must be after the start date";
      missing.push("date");
    }
    if (locationMode === "inPerson" && !address.trim()) {
      newErrors.location = "Please add an address for in-person events";
      missing.push("location");
    }
    if (locationMode === "online" && !websiteUrl.trim()) {
      newErrors.location = "Please add a website URL for online events";
      missing.push("location");
    }
    if (!description.trim()) {
      newErrors.description = "Please add a short description";
      missing.push("description");
    }
    if (!coverImage) {
      newErrors.cover = "Please upload a cover image";
      missing.push("cover");
    }

    setErrors(newErrors);
    return { isValid: missing.length === 0, missing };
  }, [title, selectedTypes, locationMode, address, websiteUrl, description, coverImage, endDate, startDate]);

  const handleCreate = useCallback(async () => {
    if (!isCreateEnabled) return;

    const { isValid, missing } = validateForm();
    if (!isValid) {
      const firstErrorKey = missing.find(Boolean);
      if (firstErrorKey) {
        scrollToField(firstErrorKey);
        focusField(firstErrorKey);
      }
      return;
    }

    setIsCreating(true);

    const now = new Date().toISOString();
    const typeLabels = selectedTypes.map((item) => item.label);
    const locationValue =
      locationMode === "online" ? websiteUrl.trim() : address.trim();

    // Format datetime cho EventCard
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();

    const newEvent: any = {
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
      timeLabel: startDate.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      // Inject Organizer Info
      organizerId: currentUser?.uid,
      organizerSnapshot: {
        name: currentUser?.displayName || "Unknown Organizer",
        handle: editProfile?.username || "user",
        avatar: currentUser?.photoURL || "",
        verified: false,
      },
    };

    try {
      const result = await onCreate(newEvent as EventItem);
      if (result !== false) {
        onClose();
        setHasChanges(false);
      }
    } finally {
      setIsCreating(false);
    }
  }, [
    isCreateEnabled,
    validateForm,
    scrollToField,
    focusField,
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
    currentUser
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseAttempt}
    >
      <View className="flex-1 bg-black/30 justify-center px-4">
        <Pressable className="absolute inset-0" onPress={handleCloseAttempt} />

        <View
          className="rounded-3xl bg-white p-5 shadow-2xl"
          style={{ maxHeight: "90%" }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-10" />
            <Text className="text-lg font-semibold text-slate-900">
              Create Event
            </Text>
            <Pressable onPress={handleCloseAttempt} hitSlop={8}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </Pressable>
          </View>

          <KeyboardAwareScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={32}
            enableOnAndroid
            enableAutomaticScroll
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <View className="gap-4">
              <View onLayout={registerFieldPosition("title")}>
                <Text className="text-[11px] font-semibold text-slate-500">
                  EVENT TITLE <Text className="text-red-500">*</Text>
                </Text>
                <View className={`mt-2 rounded-2xl border ${errors.title ? "border-red-300" : "border-slate-200"} bg-white px-4 py-2.5 flex-row items-center`}>
                  <TextInput
                    ref={titleRef}
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      markDirty();
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

              <View onLayout={registerFieldPosition("type")}>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TYPE <Text className="text-red-500">*</Text>
                </Text>
                <View className="mt-2">
                  <MultiSelectSheet
                    value={selectedTypes}
                    options={filteredTypes}
                    onChange={(next) => {
                      setSelectedTypes(next);
                      markDirty();
                      if (errors.type) setErrors((prev) => ({ ...prev, type: "" }));
                    }}
                    placeholder="Select event type"
                    searchable
                    hasError={!!errors.type}
                  />
                </View>
                {errors.type ? (
                  <Text className="mt-1 text-[11px] text-red-500">{errors.type}</Text>
                ) : null}
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  START DATE <Text className="text-red-500">*</Text>
                </Text>
                <DateTimeField value={startDate} onChange={handleStartDateChange} />
              </View>

              <View onLayout={registerFieldPosition("date")}>
                <Text className="text-[11px] font-semibold text-slate-500">
                  END DATE <Text className="text-red-500">*</Text>
                </Text>
                <DateTimeField value={endDate} onChange={handleEndDateChange} hasError={!!errors.date} />
                {errors.date ? (
                  <Text className="mt-1 text-[11px] text-red-500">{errors.date}</Text>
                ) : null}
              </View>

              <View>
                <Text className="text-[11px] font-semibold text-slate-500">
                  TIME ZONE
                </Text>
                <View className="mt-2">
                  <SelectSheet
                    value={timeZone}
                    options={TIME_ZONE_OPTIONS}
                    onChange={(value) => {
                      setTimeZone(value);
                      markDirty();
                    }}
                    searchable
                    searchPlaceholder="Search time zone"
                    offset={4}
                  />
                </View>
              </View>

              <View onLayout={registerFieldPosition("location")}>
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
                  <View className={`rounded-2xl border ${errors.location ? "border-red-300" : "border-slate-200"} bg-white px-4 py-3`}>
                    <TextInput
                      ref={addressRef}
                      value={address}
                      onChangeText={(text) => {
                        setAddress(text);
                        markDirty();
                        if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
                      }}
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
                      onChangeText={(text) => {
                        setVenueDetails(text);
                        markDirty();
                      }}
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
                <View className={`rounded-2xl border ${errors.location ? "border-red-300" : "border-slate-200"} bg-white px-4 py-3`}>
                  <TextInput
                    ref={websiteRef}
                    value={websiteUrl}
                    onChangeText={(text) => {
                      setWebsiteUrl(text);
                      markDirty();
                      if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
                    }}
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
              {errors.location ? (
                <Text className="mt-1 text-[11px] text-red-500">{errors.location}</Text>
              ) : null}

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

              <View onLayout={registerFieldPosition("description")}>
                <Text className="text-[11px] font-semibold text-slate-500">
                  DESCRIPTION <Text className="text-red-500">*</Text>
                </Text>
                <View className={`mt-2 rounded-2xl border ${errors.description ? "border-red-300" : "border-slate-200"} bg-white px-4 py-3`}>
                  <TextInput
                    ref={descriptionRef}
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      markDirty();
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                    }}
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
                {errors.description ? (
                  <Text className="mt-1 text-[11px] text-red-500">{errors.description}</Text>
                ) : null}
              </View>

              <View onLayout={registerFieldPosition("cover")}>
                <Text className="text-[11px] font-semibold text-slate-500">
                  COVER IMAGE <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={pickCoverImage}
                  className={`mt-2 rounded-2xl ${errors.cover ? "border border-red-300" : "border border-dashed border-slate-300"} bg-white px-4 py-4 items-center`}
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
                {errors.cover ? (
                  <Text className="mt-1 text-[11px] text-red-500">{errors.cover}</Text>
                ) : null}
              </View>
            </View>
          </KeyboardAwareScrollView>

          <View className="mt-4 flex-row items-center gap-3">
            <Pressable
              onPress={handleCloseAttempt}
              className="flex-1 rounded-full border border-slate-200 py-3 items-center"
            >
              <Text className="text-[14px] font-semibold text-slate-700">
                Close
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              disabled={!isCreateEnabled}
              className="flex-1 rounded-full py-3 items-center flex-row justify-center gap-2"
              style={{ backgroundColor: isCreateEnabled || isCreating ? "#0B73FF" : "#E2E8F0" }}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : null}
              <Text
                className="text-[14px] font-semibold"
                style={{ color: isCreateEnabled || isCreating ? "#FFFFFF" : "#94A3B8" }}
              >
                Create
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitConfirm(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full rounded-[28px] bg-white p-6">
            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setShowExitConfirm(false)}
                hitSlop={12}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </Pressable>
            </View>

            <View className="mt-2 mb-5">
              <Text className="text-2xl font-bold text-slate-900 text-center">
                Discard changes?
              </Text>
              <Text className="mt-3 text-base text-slate-500 text-center">
                You have unsaved changes. Are you sure you want to discard them?
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={handleConfirmExit}
                className="rounded-full border border-rose-500 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-rose-500">
                  Discard changes
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowExitConfirm(false)}
                className="rounded-full border border-slate-200 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-slate-700">
                  Keep editing
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  hasError?: boolean;
};

function DateTimeField({ value, onChange, hasError = false }: DateTimeFieldProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const iosMajorVersion =
    Platform.OS === "ios"
      ? typeof Platform.Version === "string"
        ? Number.parseInt(Platform.Version, 10)
        : Platform.Version
      : 0;
  const iosDisplay =
    Platform.OS === "ios" && iosMajorVersion >= 14 ? "inline" : "spinner";

  return (
    <>
      <Pressable
        onPress={() => setPickerVisible(true)}
        className={`mt-2 rounded-2xl border ${hasError ? "border-red-300" : "border-slate-200"} bg-white px-4 py-3 flex-row items-center`}
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
        display={Platform.OS === "ios" ? iosDisplay : undefined}
        onConfirm={(date) => {
          onChange(date);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
        confirmTextIOS="Done"
        cancelTextIOS="Cancel"
      />
    </>
  );
}
