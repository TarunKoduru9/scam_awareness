import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Home from "../../../assets/Home.svg";
import Search from "../../../assets/search.svg";
import Noti from "../../../assets/Noti.svg";
import Danger from "../../../assets/Danger.svg";
import Profile from "../../../assets/Profile.svg";

export default function Navbar() {
  const navigation = useNavigation();
  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={["#8E1A7B", "#280723"]} style={styles.gradient}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.navigate("dashboard")}>
            <Home width={29.92} height={29.92} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("search")}>
            <Search width={29.92} height={29.92} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("notifications")}
          >
            <Noti width={29.92} height={29.92} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("emergency")}>
            <Danger width={29.92} height={29.92} />
          </TouchableOpacity>
         <TouchableOpacity onPress={() => navigation.navigate("profile")}>
            <Profile width={29.92} height={29.92} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  gradient: {
    flex: 1,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 402,
    height: 60,
    gap: 15,
    padding: 15,
    bottom: 0,
  },
});
