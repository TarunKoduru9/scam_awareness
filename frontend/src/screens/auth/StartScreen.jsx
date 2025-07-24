import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import logo from "../../../assets/scamlogo.png";
import Googleicon from "../../../assets/google-icon-logo-svgrepo-com.svg";
import Facebookicon from "../../../assets/facebook-3-logo-svgrepo-com.svg";

export default function StartScreen({ navigation }) {
  return (
    <LinearGradient colors={["#FFFFFF00", "#8E1A7B"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logo} resizeMode="contain" style={styles.logo} />

        <Text style={styles.heading}>Signup or Login</Text>

        <View style={styles.subcontainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("signup")}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={["#905101", "#EB9E3C"]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Signup</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.or}>Or</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("login")}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={["#905101", "#EB9E3C"]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.mainline}>
            <View style={styles.line} />
            <Text style={styles.subheading}>Signup Or login with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton}>
              <Googleicon width={18} height={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Facebookicon width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 343,
    top: 251,
    height: 450,
    left: 29,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    padding: 24,
    gap: 5,
  },
  subcontainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 295,
    height: 212,
    gap: 11,
  },
  logo: {
    width: 130,
    height: 80,
    marginBottom: 30,
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 20,
    color: "#111827",
  },
  mainline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  line: {
    width: 94,
    borderWidth: 1,
    borderColor: "#6C7278",
  },
  subheading: {
    fontSize: 8,
    width: 75,
    height: 12,
    fontWeight: "400",
    color: "#6C7278",
    textAlign: "center",
  },
  buttonWrapper: {
    width: 295,
    height: 48,
    borderRadius: 10,
    overflow: "hidden",
  },

  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  or: {
    width: 9,
    height: 12,
    fontSize: 8,
    fontWeight: "400",
    color: "#6C7278",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 48,
    width: 295,
    gap: 15,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EFF0F6",
    borderRadius: 10,
    width: 120,
    height: 48,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 24,
    paddingRight: 24,
    borderWidth: 1,
    gap: 10,
    elevation: 2,
  },
});
