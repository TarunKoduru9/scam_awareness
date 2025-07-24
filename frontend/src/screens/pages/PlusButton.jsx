import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PlusButton = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("post")}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    top: 720,
    left: 320,
    backgroundColor: "#8E1A7B",
    width: 46.85,
    height: 45.85,
    borderRadius: 22.92,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default PlusButton;
