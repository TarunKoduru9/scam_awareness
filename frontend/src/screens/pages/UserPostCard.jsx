import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Gallery from "../../../assets/gallery.svg";
import File from "../../../assets/file.svg";
import Emoji from "../../../assets/emoji.svg";
import * as ImagePicker from "expo-image-picker";
import EmojiPicker from "rn-emoji-keyboard";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import {
  getProfile,
  BASE_URL,
  postComplaint,
  updateComplaint,
  repost,
} from "../../utils/api";

const UserPostCard = ({ navigation, route }) => {
  const [complaint, setComplaint] = useState("");
  const [open, setOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);

        const postToUse = route.params?.post || route.params?.originalPost;

        if (postToUse) {
          setComplaint(postToUse.text_content || postToUse.text || "");

          const preloadedFiles = postToUse.attachments || postToUse.files || [];
          const formattedFiles = preloadedFiles.map((file) => ({
            uri: `${BASE_URL}/${file.file_url.replace(/\\/g, "/")}`,
            name: file.file_url.split("/").pop(),
            type:
              file.file_type === "image"
                ? "image/jpeg"
                : file.file_type === "video"
                ? "video/mp4"
                : file.file_type === "audio"
                ? "audio/mpeg"
                : "application/octet-stream",
            isRemote: true,
          }));

          setAttachments(formattedFiles);
        }
      } catch (err) {
        console.error("Failed to load user or post", err);
      }
    };

    loadData();
  }, []);

  const handlePost = async () => {
    if (!complaint.trim()) {
      Alert.alert("Error", "Please enter a complaint");
      return;
    }

    const isEdit = route.params?.post && !route.params?.isRepost;
    const isRepost = route.params?.isRepost;

    try {
      if (isEdit) {
        await updateComplaint(route.params.post.id, complaint, attachments);
        Alert.alert("Updated", "Complaint updated successfully");
      } else {
        await postComplaint(complaint, attachments);

        if (isRepost && route.params?.post?.id) {
          await repost(route.params.post.id);
        }

        Alert.alert("Success", isRepost ? "Repost done" : "Complaint posted");
      }

      setComplaint("");
      setAttachments([]);
      navigation.goBack();
    } catch (err) {
      console.error("Post failed", err);
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type === "video" ? "video/mp4" : "image/jpeg",
        },
      ]);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.ms-excel",
          "audio/*",
          "video/*",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (attachments.length >= 5) {
        Alert.alert("Limit Reached", "You can only attach up to 5 files.");
        return;
      }

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const fileUri = asset.uri;
        const fileName = asset.name || `document-${Date.now()}.pdf`;
        const newPath = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({ from: fileUri, to: newPath });
        const fileInfo = await FileSystem.getInfoAsync(newPath);

        if (fileInfo.exists) {
          setAttachments((prev) => [
            ...prev,
            {
              uri: newPath,
              name: fileName,
              type: asset.mimeType || "application/octet-stream",
            },
          ]);
        } else {
          Alert.alert("Error", "Could not attach file.");
        }
      }
    } catch (err) {
      console.error("Document pick error:", err);
      Alert.alert("Error", "Could not pick document.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.complaintBox}>
        <View style={styles.card}>
          <Image
            source={{ uri: `${BASE_URL}${user?.profile_image_url}` }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>
              {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
            </Text>
            <Text style={styles.username}>@{user?.username ?? ""}</Text>
          </View>
        </View>

        <TextInput
          placeholder="What’s Happening?"
          placeholderTextColor="#999"
          style={styles.input}
          multiline
          value={complaint}
          onChangeText={setComplaint}
        />

        <View style={styles.line} />

        <View style={styles.inputActions}>
          <View style={styles.icons}>
            <TouchableOpacity onPress={pickImage}>
              <Gallery width={20} height={20} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickDocument}>
              <File width={30} height={30} />
            </TouchableOpacity>

            <EmojiPicker
              open={open}
              onEmojiSelected={(e) => setComplaint((prev) => prev + e.emoji)}
              onClose={() => setOpen(false)}
            />
            <TouchableOpacity onPress={() => setOpen(true)}>
              <Emoji width={20} height={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postText}>Post</Text>
          </TouchableOpacity>
        </View>

        {attachments.map((file, index) => (
          <Text
            key={index}
            style={{
              marginTop: 8,
              marginLeft: 12,
              color: "gray",
              fontSize: 12,
            }}
          >
            📎 {file.name}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};
export default UserPostCard;

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
  card: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    width: 386,
    height: 52,
    top: 10,
    left: 8,
    gap: 10,
  },
  avatar: { width: 37.12, height: 37.12, borderRadius: 20 },
  userInfo: {
    flexDirection: "column",
    bottom: 15,
    width: 282.08,
    height: 18,
    gap: 5,
  },
  name: { fontWeight: "700", fontSize: 14.85 },
  username: { color: "gray", fontSize: 14.85 },
  complaintBox: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 14,
    width: 375,
    height: 338,
    top: 10,
    left: 9,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    height: 100,
    textAlignVertical: "top",
    fontSize: 20,
    top: 10,
    left: 10,
    color: "#000",
  },
  line: {
    borderColor: "#cccccc31",
    width: 350,
    borderWidth: 1,
    left: 20,
    top: 110,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    top: 130,
    gap: 90,
  },
  icons: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  postButton: {
    backgroundColor: "#8E1A7B",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 6,
  },
  postText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
