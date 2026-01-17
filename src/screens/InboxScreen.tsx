import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useInbox } from "@/domains/chat/hooks/useChat";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useProfileContext } from "@/domains/user/contexts/ProfileContext";
import { searchUsers } from "@/domains/user/services/userService";
import { createOrGetChatRoom } from "@/domains/chat/services/chatService";
import { ChatRoom } from "@/domains/chat/types";
import { FollowUser } from "@/domains/user/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

dayjs.extend(relativeTime);

// Define type for search results which might differ slightly from FollowUser
interface SearchUser {
  uid: string;
  id?: string;
  displayName?: string;
  username?: string;
  name?: string;
  photoURL?: string;
  avatarUrl?: string;
}

type InboxNavigationProp = NativeStackNavigationProp<{
  Chat: { chatId: string; otherUserName?: string };
}>;

export default function InboxScreen() {
  const { rooms, loading: roomsLoading, currentUser } = useInbox();
  const { following, refreshProfile } = useProfileContext();
  const navigation = useNavigation<InboxNavigationProp>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const listBottomInset = Math.max(insets.bottom + 24, 64);

  const resolveUserId = (user: SearchUser | FollowUser) => {
    if ("uid" in user && user.uid) return user.uid;
    if ("id" in user && user.id) return user.id;
    return null;
  };

  const resolveUserName = (user: SearchUser | FollowUser) => {
    return (
      user.displayName ||
      ("username" in user ? user.username : undefined) ||
      ("name" in user ? user.name : undefined) ||
      "Unknown"
    );
  };

  const resolveUserHandle = (user: SearchUser | FollowUser) => {
    const username = "username" in user ? user.username : undefined;
    if (!username) return undefined;
    const clean = username.replace(/^@/, "");
    return clean ? `@${clean}` : undefined;
  };

  const resolveUserAvatar = (user: SearchUser | FollowUser) => {
    if ("photoURL" in user && user.photoURL) return user.photoURL;
    if ("avatarUrl" in user && user.avatarUrl) return user.avatarUrl;
    return undefined;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const handleSearch = useCallback(async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(text);
    setSearchResults(results as SearchUser[]);
    setSearching(false);
  }, []);

  const handleUserSelect = async (targetUser: SearchUser | FollowUser) => {
    if (!currentUser) return;
    if (creatingChat) return;

    setCreatingChat(true);
    try {
      const targetUserId = resolveUserId(targetUser);
      if (!targetUserId) {
        console.warn("Target user missing ID", targetUser);
        Alert.alert("Error", "Cannot start chat with this user.");
        return;
      }

      const displayName = resolveUserName(targetUser);
      const photoURL = resolveUserAvatar(targetUser);

      // Create or get chat room
      const chatId = await createOrGetChatRoom(currentUser, targetUserId, {
        displayName,
        photoURL,
      });

      navigation.navigate("Chat", {
        chatId,
        otherUserName: displayName,
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to start conversation.");
    } finally {
      setCreatingChat(false);
    }
  };

  const renderRoomItem = ({ item }: { item: ChatRoom }) => {
    // Find the OTHER participant to display their name/avatar
    const otherUserId = item.participants.find(
      (uid: string) => uid !== currentUser?.uid
    );
    const participantData = item.participantData || {};
    const otherUser = participantData[otherUserId || ""] || {
      displayName: "Unknown User",
    };
    const otherUserName = otherUser.displayName || "Unknown User";
    const otherUserAvatar = otherUser.photoURL;

    return (
      <Pressable
        className="flex-row items-center bg-white px-4 py-3 border-b border-slate-100 active:bg-slate-50"
        onPress={() =>
          navigation.navigate("Chat", {
            chatId: item.id,
            otherUserName: otherUserName,
          })
        }
      >
        <Image
          source={{
            uri:
              otherUserAvatar ||
              "https://ui-avatars.com/api/?name=" + otherUserName,
          }}
          className="h-12 w-12 rounded-full bg-slate-200"
        />
        <View className="ml-3 flex-1">
          <View className="flex-row justify-between">
            <Text className="text-base font-semibold text-slate-900">
              {otherUserName}
            </Text>
            {item.updatedAt && (
              <Text className="text-xs text-slate-500">
                {dayjs(item.updatedAt.toDate()).fromNow()}
              </Text>
            )}
          </View>
          <Text
            className="mt-1 text-sm text-slate-500"
            numberOfLines={1}
          >
            {item.lastMessage?.senderId === currentUser?.uid ? "You: " : ""}
            {item.lastMessage?.text || "No messages yet"}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderUserItem = ({ item }: { item: SearchUser }) => {
    const displayName = resolveUserName(item);
    const handle = resolveUserHandle(item);
    return (
      <Pressable
        className="flex-row items-center px-4 py-3 border-b border-slate-100 active:bg-slate-50"
        onPress={() => handleUserSelect(item)}
      >
        <Image
          source={{
            uri:
              resolveUserAvatar(item) ||
              "https://ui-avatars.com/api/?name=" + displayName,
          }}
          className="h-10 w-10 rounded-full bg-slate-200"
        />
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-slate-900">
            {displayName}
          </Text>
          {handle ? (
            <Text className="text-xs text-slate-500">{handle}</Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const renderFollowingItem = ({ item }: { item: FollowUser }) => (
    <Pressable
      className="items-center w-[68px]"
      onPress={() => handleUserSelect(item)}
    >
      <Image
        source={{
          uri:
            resolveUserAvatar(item) ||
            "https://ui-avatars.com/api/?name=" + item.username,
        }}
        className="h-14 w-14 rounded-full bg-slate-200 border border-white"
      />
      <Text
        className="mt-1 text-[11px] text-center text-slate-600"
        numberOfLines={1}
      >
        {item.displayName || item.username}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
          </Pressable>
          <Text className="ml-3 text-base font-semibold text-slate-900">
            Messages
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-3 pt-3">
        <View className="flex-row items-center rounded-full border border-slate-200 bg-slate-50 px-3">
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search people..."
            placeholderTextColor="#94A3B8"
            className="flex-1 px-2 py-2 text-[12px] text-slate-900"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content Overlay */}
      {creatingChat && (
        <View className="absolute inset-0 bg-white/60 z-50 items-center justify-center">
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      )}

      {!currentUser ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-slate-500 text-center">
            Please sign in to view messages.
          </Text>
        </View>
      ) : (
        <>
          {searchQuery.length > 0 ? (
            // Search Results
            <View className="flex-1 mt-2">
              {searching ? (
                <ActivityIndicator className="mt-10" color="#0F172A" />
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) =>
                    item.uid || item.id || item.username || `${index}`
                  }
                  renderItem={renderUserItem}
                  ListEmptyComponent={
                    <Text className="text-center mt-10 text-slate-500">
                      No users found
                    </Text>
                  }
                  contentContainerStyle={{ paddingBottom: listBottomInset }}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          ) : (
            // Inbox & Following
            <>
              <View className="border-b border-slate-100">
                <View className="px-4 pt-2 pb-1">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
                    Quick chats
                  </Text>
                </View>
                {following.length === 0 ? (
                  <View className="px-4 pb-4 pt-2">
                    <Text className="text-sm text-slate-500">
                      Follow people to start conversations quickly.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={following}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                    ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFollowingItem}
                  />
                )}
              </View>

          {roomsLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(item) => item.id}
              renderItem={renderRoomItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View className="mt-20 items-center px-6">
                  <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                  <Text className="mt-4 text-center text-gray-500">
                    No conversations yet.
                  </Text>
                </View>
              }
            />
          )}
            </>
          )}
        </>
      )}
    </View>
  );
}
