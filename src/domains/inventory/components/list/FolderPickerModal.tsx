import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Folder } from "../../types";

type Props = {
  visible: boolean;
  folders: Folder[];
  activeFolder: string | null;
  creatingFolder: boolean;
  newFolderName: string;
  onClose: () => void;
  onSelectFolder: (folderName: string) => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onConfirmCreate: () => void;
  onChangeFolderName: (text: string) => void;
  getFolderCount: (name: string) => number;
  mode?: "filter" | "move";
};

export function FolderPickerModal({
  visible,
  folders,
  activeFolder,
  creatingFolder,
  newFolderName,
  onClose,
  onSelectFolder,
  onStartCreate,
  onCancelCreate,
  onConfirmCreate,
  onChangeFolderName,
  getFolderCount,
  mode = "filter",
}: Props) {
  const title = mode === "move" ? "Move to folder" : "Choose folder";
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/25" onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="absolute left-4 right-4"
        style={{ top: "24%", maxHeight: "70%" }}
      >
        <View className="rounded-3xl bg-white p-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-slate-900">
              {title}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color="#0F172A" />
            </Pressable>
          </View>
          <ScrollView
            className="mt-2"
            contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {folders.map((folder) => {
              const count = getFolderCount(folder.name);
              const selected = activeFolder === folder.name;
              return (
                <Pressable
                  key={folder.id}
                  onPress={() => onSelectFolder(folder.name)}
                  className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                    selected
                      ? "border-[#0B73FF] bg-[#E0F2FE]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="h-10 w-10 rounded-full items-center justify-center bg-slate-50">
                      <Ionicons name="folder-outline" size={18} color="#0F172A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {folder.name}
                      </Text>
                      <Text className="text-xs text-slate-500">
                        {count} item(s)
                      </Text>
                    </View>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={20} color="#0B73FF" />
                  ) : null}
                </Pressable>
              );
            })}
            {creatingFolder ? (
              <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Text className="text-sm font-semibold text-slate-900 mb-2">
                  Name your folder
                </Text>
                <View className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <TextInput
                    value={newFolderName}
                    onChangeText={onChangeFolderName}
                    placeholder="Your Collection's Name"
                    placeholderTextColor="#94A3B8"
                    className="text-slate-900"
                    style={{ paddingVertical: 0, textAlignVertical: "center" }}
                    autoFocus
                  />
                </View>
                <View className="mt-3 flex-row items-center gap-2">
                  <Pressable
                    onPress={onCancelCreate}
                    className="flex-1 rounded-full border border-slate-200 py-2 items-center"
                  >
                    <Text className="text-sm font-semibold text-slate-700">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onConfirmCreate}
                    className="flex-1 rounded-full bg-[#0B73FF] py-2 items-center active:opacity-90"
                  >
                    <Text className="text-sm font-semibold text-white">
                      Create
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={onStartCreate}
                className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <Ionicons name="add-circle-outline" size={18} color="#0F172A" />
                <Text className="text-sm font-semibold text-slate-800">
                  Create new folder
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
