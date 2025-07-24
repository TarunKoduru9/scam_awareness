import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { signupUser } from "../../utils/api";

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_code: selectedCountry,
        phone_number: phone,
        date_of_birth: formatDate(date),
        password,
      };
      await signupUser(payload);
      navigation.navigate("otplogin", { email });
    } catch (err) {
      Alert.alert("Signup Failed", err.message || "Try again.");
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

        <Text style={styles.title}>Signup</Text>
        <Text style={styles.subtitle}>
          Signup to Create an account & continue!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.inputIcon}>
          <TextInput
            placeholder="Date of Birth"
            value={formatDate(date)}
            style={styles.flexInput}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <FontAwesome name="calendar" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.phoneRow}>
          <View style={styles.countryPicker}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedCountry(value)}
              items={[
                { label: "🇮🇳 +91", value: "+91" },
                { label: "🇺🇸 +1", value: "+1" },
                { label: "🇬🇧 +44", value: "+44" },
                { label: "🇦🇪 +971", value: "+971" },
                { label: "🇸🇦 +966", value: "+966" },
                { label: "🇨🇦 +1", value: "+1" },
                { label: "🇦🇺 +61", value: "+61" },
                { label: "🇩🇪 +49", value: "+49" },
                { label: "🇸🇬 +65", value: "+65" },
                { label: "🇫🇷 +33", value: "+33" },
              ]}
              placeholder={{ label: "Code", value: null }}
              value={selectedCountry}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
          </View>

          <TextInput
            placeholder="Phone number"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.inputIcon}>
          <TextInput
            placeholder="Password"
            secureTextEntry={secureText}
            style={styles.flexInput}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons
              name={secureText ? "eye-off" : "eye"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.buttonWrapper} onPress={handleSignup}>
          <LinearGradient colors={["#905101", "#EB9E3C"]} style={styles.button}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account?
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("login")}
          >
            {" "}
            Log in
          </Text>
        </Text>
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
    height: 693,
    gap: 5,
  },
  backBtn: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
  },
  subtitle: {
    color: "#6C7278",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  inputIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
    paddingVertical: 14,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  countryPicker: {
    width: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  buttonWrapper: {
    marginTop: 20,
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
  loginText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: "#FFFFFF",
  },
  loginLink: {
    color: "#FFC001",
    fontWeight: "600",
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    paddingVertical: 12,
    color: "#000",
  },
  inputAndroid: {
    fontSize: 14,
    color: "#000",
  },
};
