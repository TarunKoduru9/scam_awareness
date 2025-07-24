import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "./Navbar";
import { LinearGradient } from "expo-linear-gradient";
import Gallery from "../../../assets/gallery.svg";
import Gif from "../../../assets/gif.svg";
import Emoji from "../../../assets/emoji.svg";
import * as ImagePicker from "expo-image-picker";
import EmojiPicker from "rn-emoji-keyboard";
import * as DocumentPicker from "expo-document-picker";

const EmergencyScreen = ({ navigation }) => {
  const [complaint, setComplaint] = useState("");
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");

  const handlePost = () => {
    if (complaint.trim()) {
      Alert.alert("Complaint Posted", complaint);
      setComplaint("");
    } else {
      Alert.alert("Error", "Please enter a complaint");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency</Text>
        </View>

        {/* Description */}
        <View style={styles.description}>
          <Text style={styles.subtitle}>
            Report emergencies instantly. Fast, secure, & trackable
          </Text>
          <Text style={styles.subheading}>YOUR SAFETY MATTERS</Text>
        </View>
        <Text style={styles.detail}>
          Submit your complaint now, & we’ll take action immediately!
        </Text>

        {/* Complaint Box */}
        <View style={styles.complaintBox}>
          <TextInput
            placeholder="What’s Happening?"
            placeholderTextColor="#999"
            style={styles.input}
            multiline
            value={complaint}
            onChangeText={setComplaint}
          />
          <View style={styles.inputActions}>
            <View style={styles.icons}>
              <TouchableOpacity onPress={pickImage}>
                <Gallery width={20} height={20} />
              </TouchableOpacity>

              <TouchableOpacity>
                <Gif width={20} height={20} />
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
            <View>
              <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                <Text style={styles.postText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.tline} />

        {/* Call and Message Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callButton}>
            <LinearGradient
              colors={["#905101", "#EB9E3C"]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>CALL</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton}>
            <LinearGradient
              colors={["#905101", "#EB9E3C"]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>MESSAGE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.bline} />

        {/* Raise a Complaint */}
        <TouchableOpacity style={styles.raiseButton}>
          <LinearGradient
            colors={["#83838366", "#FFFFFF"]}
            style={styles.gradientButton}
          >
            <Text style={styles.raiseText}>+ RAISE A COMPLAINT</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.raiseSubtext}>
          Proceed to fill the complaint details
        </Text>
      </View>
      <Navbar />
    </View>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  description: {
    width: 311,
    height: 100,
    left: 25,
    gap: 5,
  },
  subtitle: {
    fontSize: 13,
    color: "#000000",
  },
  subheading: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000000",
  },
  detail: {
    fontSize: 11,
    color: "#333",
    width: 311,
    bottom: 35,
    left: 25,
  },
  complaintBox: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 14,
    width: 360,
    height: 200,
    left: 15,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    height: 100,
    textAlignVertical: "top",
    fontSize: 12,
    top: 10,
    left: 10,
    color: "#000",
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingTop: 50,
    gap: 150,
  },
  icons: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 15,
  },
  postButton: {
    backgroundColor: "#8E1A7B",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  postText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 35,
    top: 25,
  },
  tline: {
    borderColor: "#0E3173",
    width: 350,
    borderWidth: 1,
    left: 20,
    top: 25,
  },
  bline: {
    borderColor: "#0E3173",
    width: 350,
    borderWidth: 1,
    left: 20,
    top: 5,
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  callButton: {
    width: 150,
    bottom: 10,
    height: 45,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  raiseButton: {
    width: 220,
    height: 40,
    top: 40,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#375DFB",
    shadowColor: "#253EA77A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  raiseText: {
    fontWeight: "700",
    color: "#133576",
  },
  raiseSubtext: {
    fontSize: 8,
    color: "#000000",
    top: 50,
    left: 130,
  },
});
