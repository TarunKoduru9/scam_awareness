import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "./Navbar";
import Account from "../../../assets/account.svg";
import Question from "../../../assets/question.svg";
import About from "../../../assets/about.svg";
import Logout from "../../../assets/logout.svg";
import { logoutUser } from "../../utils/api";

const SettingsScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.replace("login");
    } catch (error) {
      Alert.alert("Logout Failed", error.message || "Try again later");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.settingbar}>
        <View style={styles.bars}>
          <Account width={20} height={20} />
          <TouchableOpacity>
            <Text style={styles.text}>Account</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bars}>
          <Question width={20} height={20} />
          <TouchableOpacity>
            <Text style={styles.text}>Help & Support</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bars}>
          <About width={20} height={20} />
          <TouchableOpacity>
            <Text style={styles.text}>About App</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bars}>
          <Logout width={20} height={20} />
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.text}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Navbar />
    </View>
  );
};

export default SettingsScreen;

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
  settingbar: {
    flexDirection: "column",
    width: 171,
    height: 162,
    top: 50,
    left: 27,
    gap: 23,
  },
  bars: {
    alignItems: "center",
    flexDirection: "row",
    gap: 17,
  },
  text: {
    fontSize: 18,
    color: "#0E3173",
    fontWeight: "600",
  },
});
