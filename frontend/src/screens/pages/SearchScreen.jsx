import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Search from "../../../assets/searchbutton.svg";
import { LinearGradient } from "expo-linear-gradient";
import Navbar from "../pages/Navbar";
import PlusButton from "./PlusButton";
import {
  BASE_URL,
  searchUsersByName,
  fetchExploreUsers,
  followUser,
  unfollowUser,
  getProfile,
} from "../../utils/api";

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUserAndExplore();
      return () => {};
    }, [])
  );

  const loadUserAndExplore = async () => {
    try {
      const profile = await getProfile();
      setCurrentUserId(profile.id);
      const data = await fetchExploreUsers();
      setNewUsers(data.newUsers);
      setRecommendedUsers(data.recommendedUsers);
    } catch (err) {
      console.error("Failed to load profile or explore users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    try {
      const results = await searchUsersByName(searchText.trim());
      setSearchResults(results);

      setRecentSearches((prev) => {
        const uniqueUsers = results.filter(
          (newUser) => newUser.id !== currentUserId
        );

        const updated = uniqueUsers
          .map((user) => {
            return prev.find((u) => u.id === user.id)
              ? prev.filter((u) => u.id !== user.id)
              : prev;
          })
          .flat();

        return [
          ...results,
          ...updated.filter((u) => !results.some((r) => r.id === u.id)),
        ];
      });
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleLiveSearch = async (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsersByName(text.trim());
      setSearchResults(results);
    } catch (err) {
      console.error("Live search failed:", err);
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const handleFollowToggle = async (user) => {
    try {
      if (user.is_following) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }

      const updateList = (list) =>
        list.map((u) =>
          u.id === user.id ? { ...u, is_following: !u.is_following } : u
        );

      setRecommendedUsers(updateList);
      setSearchResults(updateList);
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  const goToProfile = (user, fromSearchResults = false) => {
    if (fromSearchResults && user.id !== currentUserId) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((u) => u.id !== user.id);
        return [user, ...filtered];
      });
    }

    navigation.navigate("profile", { userId: user.id });
  };

  const renderUserRow = (item) => (
    <View style={styles.recommendationRow}>
      <TouchableOpacity
        onPress={() => goToProfile(item)}
        style={styles.profileTouch}
      >
        <Image
          source={{ uri: `${BASE_URL}${item.profile_image_url}` }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
      {item.id !== currentUserId && (
        <TouchableOpacity
          onPress={() => handleFollowToggle(item)}
          style={styles.followBtn}
        >
          <Text style={styles.followText}>
            {item.is_following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#8E1A7B", "#FFFFFF"]} style={styles.gradient}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search by name"
            style={styles.input}
            value={searchText}
            onChangeText={handleLiveSearch}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.icon} onPress={handleSearch}>
            <Search width={18} height={18} />
          </TouchableOpacity>
        </View>

        {/* Explore Section */}
        <View>
          {searchText.trim() === "" && (
            <View style={styles.exploreSection}>
              <Text style={styles.sectionTitle}>
                Try Searching People, Topics or Keywords
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.storyScroll}
              >
                {newUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => goToProfile(user)}
                    style={styles.storyWrapper}
                  >
                    <Image
                      source={{ uri: `${BASE_URL}${user.profile_image_url}` }}
                      style={styles.storyImage}
                    />
                    <Text
                      style={styles.name}
                    >{`${user.first_name} ${user.last_name}`}</Text>
                    <Text style={styles.username}>@{user.username}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Recommendations Section */}
        <View>
          {searchText.trim() === "" && (
            <View style={styles.recommendSection}>
              <Text style={styles.recommendTitle}>Recommendations</Text>
              <FlatList
                data={recommendedUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderUserRow(item)}
                ListEmptyComponent={
                  loading && <ActivityIndicator color="#8E1A7B" size="large" />
                }
              />
            </View>
          )}
        </View>

        {/* Search Results Section */}
        <View style={styles.recentblox}>
          {searchResults.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.recommendationRow}>
                    <TouchableOpacity
                      onPress={() => goToProfile(item, true)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Image
                        source={{ uri: `${BASE_URL}${item.profile_image_url}` }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.name}>
                          {item.first_name} {item.last_name}
                        </Text>
                        <Text style={styles.username}>@{item.username}</Text>
                      </View>
                    </TouchableOpacity>
                    {item.id !== currentUserId && (
                      <TouchableOpacity
                        onPress={() => handleFollowToggle(item)}
                        style={styles.followBtn}
                      >
                        <Text style={styles.followText}>
                          {item.is_following ? "Following" : "Follow"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            </>
          )}

          {/* Recent Searches shown only after search and not when input is empty */}
          {searchText.trim().length > 0 &&
            searchResults.length > 0 &&
            recentSearches.length > 0 && (
              <View style={styles.recentSearchContainer}>
                <View style={styles.recentHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={handleClearRecent}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={recentSearches}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.recommendationRow}>
                      <TouchableOpacity
                        onPress={() => goToProfile(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <Image
                          source={{
                            uri: `${BASE_URL}${item.profile_image_url}`,
                          }}
                          style={styles.avatar}
                        />
                        <View>
                          <Text style={styles.name}>
                            {item.first_name} {item.last_name}
                          </Text>
                          <Text style={styles.username}>@{item.username}</Text>
                        </View>
                      </TouchableOpacity>
                      {item.id !== currentUserId && (
                        <TouchableOpacity
                          onPress={() => handleFollowToggle(item)}
                          style={styles.followBtn}
                        >
                          <Text style={styles.followText}>
                            {item.is_following ? "Following" : "Follow"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>
            )}
        </View>
      </LinearGradient>
      <PlusButton />
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, width: "100%", alignSelf: "stretch" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEFDFE",
    width: 360,
    height: 46,
    top: 50,
    left: 15,
    borderRadius: 23,
  },
  icon: {
    right: 20,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    color: "black",
  },
  recentblox: {
    top: 70,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  recentSearchContainer: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  recentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearText: {
    color: "red",
    fontSize: 12,
    fontWeight: "500",
    paddingRight:10
  },

  exploreSection: {
    top: 60,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingLeft: 4,
  },
  storyScroll: {
    marginTop: 10,
    paddingLeft: 15,
  },
  storyWrapper: {
    alignItems: "center",
    marginRight: 12,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    paddingLeft:15,
  },
  recommendTitle: {
    fontWeight: "600",
    fontSize: 15,
    paddingLeft: 20,
    paddingBottom: 10,
    color: "#141619",
  },
  recommendSection: {
    top: 80,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  recommendationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  profileTouch: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    left: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontWeight: "400",
    fontSize: 13,
    color: "#333",
  },
  username: {
    fontSize: 13,
    fontWeight: "400",
    color: "#687684",
  },
  followBtn: {
    backgroundColor: "#5C1150",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});

export default SearchScreen;
