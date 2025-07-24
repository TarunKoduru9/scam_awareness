import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import Navbar from "./Navbar";
import { LinearGradient } from "expo-linear-gradient";
import Edit from "../../../assets/upencil.svg";
import {
  uploadProfileImage,
  uploadCoverImage,
  updateUserProfile,
  getProfile,
  BASE_URL,
} from "../../utils/api";

const ProfileUpdateScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const pickImageAndUpload = async (setImage, uploadFn) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setImage(uri);

      const formData = new FormData();
      formData.append("image", {
        uri,
        name: `image-${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      try {
        await uploadFn(formData);
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert("Upload failed", error.message || "Unknown error");
      }
    }
  };

  const handleConfirm = async () => {
    try {
      await updateUserProfile({ username, email, phone, password });
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.message || "Update failed.");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getProfile();
        setUsername(user.username || "");
        setEmail("");
        setPhone(user.phone_number || "");
        const profileUrl = user.profile_image_url
          ? `${BASE_URL}${user.profile_image_url}`
          : null;
        const coverUrl = user.cover_image_url
          ? `${BASE_URL}${user.cover_image_url}`
          : null;
        setProfileImage(profileUrl);
        setCoverImage(coverUrl);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={
              coverImage
                ? { uri: coverImage }
                : require("../../../assets/scamlogo.png")
            }
            style={styles.coverImage}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Change Cover */}
          <TouchableOpacity
            style={styles.changeCoverBtn}
            onPress={() => pickImageAndUpload(setCoverImage, uploadCoverImage)}
          >
            <Text style={styles.changeCoverText}>Change Cover</Text>
            <Edit width={14} height={14} />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageWrapper}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../../assets/scamlogo.png")
            }
            style={styles.profileImage}
          />

          <TouchableOpacity
            onPress={() =>
              pickImageAndUpload(setProfileImage, uploadProfileImage)
            }
          >
            <Text style={styles.changeProfileText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View>
            <Text style={styles.sectionTitle}>Update Profile Info</Text>
          </View>

          <View style={styles.formadjust}>
            <View style={styles.inputRow}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#ACB5BB"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="User Name"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#1A1C1E"
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#1A1C1E"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  style={{ right: 40 }}
                  color="#ACB5BB"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.formadjust}>
            <View style={styles.inputRow}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#ACB5BB"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Id"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#1A1C1E"
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={phone}
                maxLength={10}
                onChangeText={setPhone}
                placeholderTextColor="#1A1C1E"
              />
            </View>
          </View>

          {/* OTP Row */}
          <View style={styles.otpRow}>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP Here"
              value={otp}
              placeholderTextColor="#1A1C1E"
              onChangeText={setOtp}
            />
            <TouchableOpacity style={styles.otpButton}>
              <LinearGradient
                colors={["#905101", "#EB9E3C"]}
                style={styles.gradientButton}
              >
                <Text style={styles.otpButtonText}>Submit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.otpHint}>Send otp via email</Text>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <LinearGradient
              colors={["#905101", "#EB9E3C"]}
              style={styles.gradientButton}
            >
              <Text style={styles.confirmText}>CONFIRM</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.confirmHint}>confirm to update changes</Text>
        </View>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
};

export default ProfileUpdateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  coverContainer: {
    position: "relative",
    height: 170,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    top: 40,
  },
  coverImage: {
    width: 402,
    height: 137,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  changeCoverBtn: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    top: 10,
    right: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 2,
    gap: 2,
  },
  changeCoverText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0E3173",
  },
  profileImageWrapper: {
    alignItems: "center",
    bottom: 60,
    zIndex: 2,
  },
  profileImage: {
    width: 133,
    height: 133,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: "#8E1A7B",
  },
  changeProfileText: {
    top: 15,
    fontWeight: "700",
    color: "#0E3173",
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 20,
    gap: 10,
    bottom: 6,
  },
  formadjust: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    left: 10,
    bottom: 5,
    color: "#0E3173",
  },
  input: {
    width: 164,
    height: 38,
    color: "#1A1C1E",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0E3173",
    borderRadius: 9,
    width: 164,
    height: 43,
    paddingLeft: 5,
    gap: 5,
  },
  inputIcon: {
    left: 5,
  },
  otpRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0E3173",
    borderRadius: 10,
    left: 7,
    paddingLeft: 10,
    width: 339,
    gap: 10,
  },
  otpInput: {
    flex: 1,
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  otpButton: {
    width: 110,
    left: 1,
  },
  otpButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  otpHint: {
    fontSize: 12,
    left: 15,
    color: "#000000",
  },
  confirmButton: {
    width: 230,
    height: 48,
    left: 72,
    top: 20,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  confirmHint: {
    fontSize: 12,
    top: 16,
    color: "#000000",
    textAlign: "center",
  },
});
