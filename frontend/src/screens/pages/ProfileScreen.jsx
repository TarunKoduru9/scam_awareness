import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Navbar from "../pages/Navbar";
import PostCard from "../pages/PostCard";
import PlusButton from "./PlusButton";
import Settings from "../../../assets/settings.svg";
import Edit from "../../../assets/pencil.svg";
import {
  getProfile,
  BASE_URL,
  fetchMyComplaints,
  getUserProfileById,
  fetchComplaintFeedByUser,
  fetchLikedComplaint,
  followUser,
  unfollowUser,
} from "../../utils/api";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

const ComplaintRoute = () => (
  <View style={styles.placeholder}>
    <Text>No Complaints</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const route = useRoute();
  const viewedUserId = route.params?.userId || null;
  const [currentUserId, setCurrentUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);

  const isOwnProfile = !viewedUserId || viewedUserId === currentUserId;

  const loadData = async () => {
    try {
      const myProfile = await getProfile();
      setCurrentUserId(myProfile.id);

      const userData =
        !viewedUserId || viewedUserId === myProfile.id
          ? myProfile
          : await getUserProfileById(viewedUserId);

      setUser(userData);
      setIsFollowing(userData.is_following ?? false);

      const userPosts =
        userData.id === myProfile.id
          ? await fetchMyComplaints()
          : await fetchComplaintFeedByUser(userData.id);

      setPosts(userPosts);

      if (isOwnProfile) {
        const myLiked = await fetchLikedComplaint();
        setLikedPosts(myLiked);
      }
    } catch (err) {
      console.error("Failed to load profile or posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [viewedUserId])
  );

  useEffect(() => {
    loadData();
  }, [viewedUserId]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Follow toggle failed:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        return (
          <View style={{ flex: 1 }}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="red"
                style={styles.loader}
              />
            ) : (
              <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <PostCard
                    post={item}
                    isMenuOpen={openMenuId === item.id}
                    onToggleMenu={() =>
                      setOpenMenuId(openMenuId === item.id ? null : item.id)
                    }
                    insideProfile={true}
                    onDelete={() => {
                      setPosts((prev) => prev.filter((p) => p.id !== item.id));
                    }}
                  />
                )}
                contentContainerStyle={styles.feed}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      loadData();
                    }}
                  />
                }
              />
            )}
          </View>
        );
      case "Liked":
        return (
          <View style={{ flex: 1 }}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="red"
                style={styles.loader}
              />
            ) : (
              <FlatList
                data={likedPosts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <PostCard
                    post={item}
                    isMenuOpen={openMenuId === item.id}
                    onToggleMenu={() =>
                      setOpenMenuId(openMenuId === item.id ? null : item.id)
                    }
                  />
                )}
                contentContainerStyle={styles.feed}
              />
            )}
          </View>
        );

      case "Complaint Status":
        return <ComplaintRoute />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: `${BASE_URL}${user?.cover_image_url}` }}
          style={styles.headerBackground}
        />

        {isOwnProfile && (
          <TouchableOpacity
            onPress={() => navigation.navigate("settings")}
            style={styles.settingsIcon}
          >
            <Settings width={25} height={25} />
          </TouchableOpacity>
        )}

        <View style={styles.profileRow}>
          <Image
            source={{ uri: `${BASE_URL}${user?.profile_image_url}` }}
            style={styles.profileImage}
          />

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("editprofile")}
            >
              <Text style={styles.editText}>Edit Profile</Text>
              <Edit width={14} height={14} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.name}>{user?.username ?? ""}</Text>
        <Text style={styles.bio}>{user?.bio ?? ""}</Text>
        <Text style={styles.followInfo}>
          {user?.following ?? 0} Following • {user?.followers ?? 0} Followers
        </Text>

        {!isOwnProfile && (
          <TouchableOpacity
            onPress={handleFollowToggle}
            style={{
              backgroundColor: isFollowing ? "#ddd" : "#8E1A7B",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              alignSelf: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: isFollowing ? "#000" : "#fff" }}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabWrapper}>
        <View style={styles.tabRow}>
          {["Posts", "Liked", "Complaint Status"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabButton}
            >
              <Text style={styles.tabButtonText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.fullUnderline} />
      </View>

      <View style={{ flex: 1 }}>{renderContent()}</View>

      <PlusButton />
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 200,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },

  headerBackground: {
    width: 402,
    height: 137,
    top: 49,
    resizeMode: "cover",
  },

  settingsIcon: {
    position: "absolute",
    top: 55,
    right: 16,
    zIndex: 2,
    padding: 6,
  },

  profileRow: {
    position: "absolute",
    top: 119,
    left: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 120,
    zIndex: 3,
  },

  profileImage: {
    width: 113,
    height: 113,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: "#8E1A7B",
  },

  editButton: {
    backgroundColor: "#8E1A7B",
    flexDirection: "row",
    top: 30,
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  userInfo: {
    padding: 16,
    backgroundColor: "white",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    top: 15,
    left: 5,
  },
  bio: {
    color: "#666",
    top: 16,
    left: 5,
  },
  followInfo: {
    color: "#999",
    top: 18,
    left: 5,
  },
  placeholder: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  feed: {
    gap: 10,
    paddingBottom: 100,
  },
  tabWrapper: {
    backgroundColor: "#fff",
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },

  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  tabButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000000",
  },
  fullUnderline: {
    height: 2,
    backgroundColor: "#0E3173",
    width: "100%",
  },
});

export default ProfileScreen;
