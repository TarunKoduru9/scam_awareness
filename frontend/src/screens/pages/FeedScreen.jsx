import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import Navbar from "../pages/Navbar";
import PostCard from "../pages/PostCard";
import { LinearGradient } from "expo-linear-gradient";
import PlusButton from "./PlusButton";
import { fetchComplaintFeed } from "../../utils/api";
import { useFocusEffect } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const FeedScreen = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const translateX = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    const scroll = () => {
      translateX.setValue(screenWidth);
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 8000,
        useNativeDriver: true,
      }).start(() => scroll());
    };

    scroll();
  }, [translateX]);
  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchComplaintFeed();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load complaints:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient colors={["#8E1A7B", "#FFFFFF"]} style={styles.gradient}>
          <View style={styles.marqueecontainer}>
            <Animated.Text
              style={[styles.marqueetext, { transform: [{ translateX }] }]}
            >
              Never share your OTP with anyone – even if they say they're from
              your bank.
            </Animated.Text>
          </View>

          <View>
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
                    onDelete={() => {
                      setPosts((prev) => prev.filter((p) => p.id !== item.id));
                    }}
                  />
                )}
                contentContainerStyle={styles.feed}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              />
            )}
          </View>
        </LinearGradient>
      </View>
      <PlusButton />
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    top: 40,
  },
  container: {
    flex: 1,
  },

  marqueecontainer: {
    backgroundColor: "#000000",
    width: 1020,
    height: 38,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    padding: 10,
    gap: 10,
    overflow: "hidden",
    justifyContent: "center",
  },
  marqueetext: {
    width: 1000,
    height: 18,
    color: "#FFFFFF",
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 17.15,
    lineHeight: 17.15,
    verticalAlign: "middle",
    letterSpacing: 0,
  },
  feed: {
    paddingBottom: 150,
  },
});

export default FeedScreen;
