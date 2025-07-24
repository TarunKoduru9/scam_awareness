import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StartScreen from "../screens/auth/StartScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import OtpLoginScreen from "../screens/auth/OtpLoginScreen";
import FeedScreen from "../screens/pages/FeedScreen";
import SearchScreen from "../screens/pages/SearchScreen";
import NotificationsScreen from "../screens/pages/NotificationsScreen";
import EmergencyScreen from "../screens/pages/EmergencyScreen";
import ProfileScreen from "../screens/pages/ProfileScreen";
import ProfileUpdateScreen from "../screens/pages/ProfileUpdateScreen";
import SettingsScreen from "../screens/pages/SettingsScreen";
import UserPostCard from "../screens/pages/UserPostCard";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="start" component={StartScreen} />
    <Stack.Screen name="login" component={LoginScreen} />
    <Stack.Screen name="signup" component={SignupScreen} />
    <Stack.Screen name="otplogin" component={OtpLoginScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="dashboard" component={FeedScreen} />
    <Stack.Screen name="search" component={SearchScreen} />
    <Stack.Screen name="notifications" component={NotificationsScreen} />
    <Stack.Screen name="emergency" component={EmergencyScreen} />
    <Stack.Screen name="profile" component={ProfileScreen} />
    <Stack.Screen name="editprofile" component={ProfileUpdateScreen} />
    <Stack.Screen name="settings" component={SettingsScreen} />
    <Stack.Screen name="post" component={UserPostCard} />
  </Stack.Navigator>
);

const AppNavigator = ({ loading, loggedIn }) => {
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8E1A7B" />
      </View>
    );
  }

  return loggedIn ? <AppStack /> : <AuthStack />;
};

export default AppNavigator;
