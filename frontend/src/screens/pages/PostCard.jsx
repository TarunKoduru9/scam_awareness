import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Comment from "../../../assets/comment.svg";
import Heart from "../../../assets/heart.svg";
import Repost from "../../../assets/repost.svg";
import Vector from "../../../assets/Vector.svg";
import {
  BASE_URL,
  getProfile,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  followUser,
  unfollowUser,
  repost,
  getComments,
  addComment,
  deleteComplaint,
} from "../../utils/api";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer } from "expo-audio";

const PostCard = ({
  post,
  isMenuOpen,
  onToggleMenu,
  insideProfile = false,
  onDelete,
}) => {
  const navigation = useNavigation();

  const [isLiked, setIsLiked] = useState(!!post.liked);
  const [isSaved, setIsSaved] = useState(!!post.saved);
  const [isFollowing, setIsFollowing] = useState(!!post.user?.is_following);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [repostCount, setRepostCount] = useState(post.reposts || 0);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [currentUserId, setCurrentUserId] = useState(null);
  const isOwnPost = currentUserId === post.user.id;

  const handleNavigateToProfile = () => {
    navigation.navigate("profile", { userId: post.user.id });
  };

  const VideoPlayer = ({ uri }) => {
    const player = useVideoPlayer(uri, (player) => {
      player.loop = true;
    });

    return (
      <VideoView
        style={styles.postImage}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        useNativeControls
        resizeMode="contain"
      />
    );
  };

  const AudioPlayer = ({ uri }) => {
    const player = useAudioPlayer({ uri });

    return (
      <View style={styles.audioPlayer}>
        <TouchableOpacity
          onPress={() => player.play()}
          style={styles.callButton}
        >
          <LinearGradient
            colors={["#905101", "#EB9E3C"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Play</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => player.pause()}
          style={styles.callButton}
        >
          <LinearGradient
            colors={["#905101", "#EB9E3C"]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(post.user.id);
      } else {
        await followUser(post.user.id);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(post.id);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const loadComments = async () => {
    try {
      const data = await getComments(post.id);
      setComments(data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(post.id, newComment);
      setNewComment("");
      loadComments();
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await unsavePost(post.id);
      } else {
        await savePost(post.id);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleRepost = async () => {
    navigation.navigate("post", {
      post,
      isRepost: true,
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComplaint(post.id);
            Alert.alert("Deleted", "Your post has been deleted.");

            if (typeof onToggleMenu === "function") {
              onToggleMenu();
              onDelete?.();
            }
          } catch (err) {
            console.error("Delete error:", err);
            Alert.alert("Error", "Could not delete the post.");
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      const text = post.text_content || "Check out this post!";
      const url =
        post.files && post.files.length > 0
          ? `${BASE_URL}/${post.files[0].file_url.replace(/\\/g, "/")}`
          : "";

      const message = url ? `${text}\n${url}` : text;

      await Share.share({
        message,
      });

      onToggleMenu();
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getProfile();
        setCurrentUserId(profile.id);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };

    fetchUser();
  }, []);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.subheader}>
          <TouchableOpacity onPress={handleNavigateToProfile}>
            <Image
              source={{ uri: BASE_URL + post.user.profile_image_url }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.usermain}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={handleNavigateToProfile}>
                <Text
                  style={styles.name}
                >{`${post.user.first_name} ${post.user.last_name}`}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNavigateToProfile}>
                <Text style={styles.username}>@{post.user.username}</Text>
              </TouchableOpacity>

              {!insideProfile &&
                currentUserId !== null &&
                currentUserId !== post.user.id && (
                  <TouchableOpacity
                    onPress={handleFollow}
                    style={styles.callButton}
                  >
                    <LinearGradient
                      colors={["#905101", "#EB9E3C"]}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>
                        {isFollowing ? "Following" : "Follow"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
            </View>
            <Text style={styles.description}>{post.text_content}</Text>

            {post.files?.map((file, index) => {
              const uri = `${BASE_URL}/${file.file_url
                .replace(/\\/g, "/")
                .replace(/^\/?/, "")}`;

              switch (file.file_type) {
                case "image":
                  return (
                    <Image
                      key={`img-${index}`}
                      source={{ uri }}
                      style={styles.postImage}
                    />
                  );
                case "video":
                  return <VideoPlayer key={`vid-${index}`} uri={uri} />;
                case "audio":
                  return (
                    <View key={`aud-${index}`} style={styles.audioBox}>
                      <Text style={styles.fileLabel}>🎧 Audio:</Text>
                      <AudioPlayer uri={uri} />
                    </View>
                  );
                default:
                  return (
                    <TouchableOpacity
                      key={`doc-${index}`}
                      onPress={() => Linking.openURL(uri)}
                      style={styles.docBox}
                    >
                      <LinearGradient
                        colors={["#905101", "#EB9E3C"]}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.buttonText}>Document</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
              }
            })}
          </View>
        </View>

        <TouchableOpacity onPress={onToggleMenu}>
          <Feather name="more-vertical" size={20} />
        </TouchableOpacity>

        {isMenuOpen && (
          <View style={styles.menu}>
            {isOwnPost ? (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("post", { post })}
                >
                  <Text style={styles.menuItem}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDelete}>
                  <Text style={styles.menuItem}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShare}>
                  <Text style={styles.menuItem}>Share</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleNavigateToProfile}>
                  <Text style={styles.menuItem}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare}>
                  <Text style={styles.menuItem}>Share</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          <Heart width={22.27} height={22.27} fill={isLiked ? "red" : "none"} />
        </TouchableOpacity>
        <Text>{likeCount}</Text>

        <TouchableOpacity
          onPress={() => {
            setIsCommentsOpen(true);
            loadComments();
          }}
        >
          <Comment width={22.27} height={22.27} />
        </TouchableOpacity>
        <Text>{post.comments}</Text>

        <TouchableOpacity onPress={handleRepost}>
          <Repost width={22.27} height={22.27} />
        </TouchableOpacity>
        <Text>{repostCount}</Text>

        <TouchableOpacity onPress={handleSave}>
          <Vector width={22.27} height={22.27} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isCommentsOpen}
        animationType="slide"
        onRequestClose={() => setIsCommentsOpen(false)}
        transparent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.commentModal}>
            <Text style={styles.modalTitle}>Comments</Text>
            <FlatList
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUser}>{item.username}:</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={80}
              style={styles.commentInputRow}
            >
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={handleAddComment}>
                <Text style={styles.sendButton}>Send</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>

            <TouchableOpacity
              onPress={() => setIsCommentsOpen(false)}
              style={styles.closeButton}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    width: 370,
    marginVertical: 10,
    alignSelf: "center",
    borderRadius: 14.85,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    alignItems: "flex-start",
  },
  subheader: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  avatar: { width: 37, height: 37, borderRadius: 20 },
  usermain: { flex: 1 },
  userInfo: { flexDirection: "row", gap: 5, alignItems: "center" },
  name: { fontWeight: "700", fontSize: 14.85 },
  username: { color: "gray", fontSize: 14.85 },
  description: {
    marginVertical: 6,
    fontSize: 14,
    color: "#000",
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginTop: 8,
  },
  audioBox: {
    marginTop: 10,
  },
  audioPlayer: {
    height: 60,
    width: "100%",
    marginTop: 4,
  },
  audioPlayer: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  fileLabel: {
    color: "#555",
    fontWeight: "500",
  },
  docBox: {
    marginTop: 10,
  },
  docLink: {
    color: "#007bff",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 30,
    padding: 10,
    left: 50,
  },
  menu: {
    position: "absolute",
    top: 30,
    right: 10,
    width: 100,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 4,
    zIndex: 10,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  callButton: {
    flex: 1,
    marginHorizontal: 5,
  },

  gradientButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  commentModal: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginVertical: 6,
  },
  commentUser: {
    fontWeight: "bold",
    marginRight: 6,
  },
  commentText: {
    flexShrink: 1,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    color: "#EB9E3C",
    fontWeight: "bold",
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "#EB9E3C",
    padding: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});

export default PostCard;
