import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, resendOtp } from "../../utils/api";
import { AuthContext } from "../../utils/AuthContext";


export default function OtpLoginScreen({ navigation, route }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const { setLoggedIn } = useAuth();
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = text;
      setOtp(updatedOtp);

      // Move to next input
      if (index < 5) {
        inputs.current[index + 1].focus();
      }
    } else if (text === "") {
      const updatedOtp = [...otp];
      updatedOtp[index] = "";
      setOtp(updatedOtp);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otpCode);
      setLoggedIn(true);
    } catch (err) {
      Alert.alert("OTP Failed", err.message || "Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF00", "#8E1A7B"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>OTP</Text>
          <Text style={styles.subtitle}>Verification Code</Text>
          <Text style={styles.description}>
            We have sent the code to
            <Text style={styles.bold}>{email}</Text>
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
              />
            ))}
          </View>

          <Text style={styles.resendText}>
            Didn’t receive a code?{" "}
            <Text
              style={styles.resendLink}
              onPress={async () => {
                try {
                  await resendOtp(email);
                  Alert.alert(
                    "OTP Sent",
                    "A new OTP has been sent to your email."
                  );
                } catch (err) {
                  Alert.alert("Resend Failed", err.message || "Try again.");
                }
              }}
            >
              Resend code
            </Text>
          </Text>

          <TouchableOpacity style={styles.buttonWrapper} onPress={handleVerify}>
            <LinearGradient
              colors={["#905101", "#EB9E3C"]}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Confirm</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
    padding: 24,
    paddingTop: 70,
    flexGrow: 1,
  },
  backBtn: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginTop: 4,
  },
  description: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    marginBottom: 30,
  },
  bold: {
    fontWeight: "600",
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#F3F3F3",
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  resendText: {
    textAlign: "center",
    fontSize: 14,
    color: "#444",
    marginBottom: 24,
  },
  resendLink: {
    color: "#EB9E3C",
    fontWeight: "600",
  },
  buttonWrapper: {
    borderRadius: 10,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
