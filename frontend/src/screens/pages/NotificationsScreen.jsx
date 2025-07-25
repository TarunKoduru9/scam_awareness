import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchNotifications } from "../../utils/api";
import Navbar from "./Navbar";
import Downarrow from "../../../assets/downarrow.svg";
import { BASE_URL } from "../../utils/api";

const NotificationsScreen = () => {
  const [newPosts, setNewPosts] = useState([]);
  const [todayPosts, setTodayPosts] = useState([]);
  const [showAllToday, setShowAllToday] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { new: newSection, today } = await fetchNotifications();
      setNewPosts(newSection);
      setTodayPosts(today);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const renderNotification = (item, showBadge = false, badgeCount = 0) => {
    const user = item.user || {};

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.notificationCard}
        onPress={() =>
          navigation.navigate("profile", { complaintId: item.id })
        }
      >
        <View style={styles.avatarContainer}>
          {user.profile_image_url ? (
            <Image
              source={{ uri: `${BASE_URL}${user.profile_image_url}` }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: "#ccc" }]} />
          )}

          {showBadge && badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.title}>
            {user.first_name || "Unknown"} {user.last_name || ""}
          </Text>
          {user.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}

          <Text style={styles.description} numberOfLines={2}>
            {item.text}
          </Text>
        </View>
        {item.file && (
          <Image
            source={{ uri: `${BASE_URL}${item.file}` }}
            style={styles.thumbnail}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* New Section */}
        {newPosts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>New</Text>
            {newPosts.map((item) =>
              renderNotification(item, true, newPosts.length)
            )}
          </>
        )}

        <View style={styles.line} />

        {/* Today Section */}
        <Text style={styles.sectionTitle}>Today</Text>
        {(showAllToday ? todayPosts : todayPosts.slice(0, 4)).map((item) =>
          renderNotification(item)
        )}

        {!showAllToday && todayPosts.length > 4 && (
          <TouchableOpacity
            onPress={() => setShowAllToday(true)}
            style={styles.showMore}
          >
            <View style={styles.showbar}>
              <Text style={styles.showMoreText}>Show More</Text>
              <Downarrow />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 16,
    color: "#000000",
  },
  line: {
    borderColor: "#000000",
    width: 350,
    borderWidth: 1,
    left: 20,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  avatarContainer: {
    position: "relative",
    width: 48,
    height: 48,
    marginRight: 12,
  },

  badge: {
    position: "absolute",
    top: -9,
    right: -9,
    backgroundColor: "#F8A435",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2.29,
    borderColor: "#142356",
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
    color: "#173878",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#173878",
  },
  thumbnail: {
    width: 45,
    height: 45,
    borderRadius: 4,
    marginLeft: 8,
  },
  showMore: {
    alignItems: "center",
    width: 84,
    height: 20,
    top: 10,
    left: 159,
  },
  showbar: {
    flexDirection: "row",
    gap: "5",
  },
  showMoreText: {
    color: "#0E3173",
    fontWeight: "600",
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
