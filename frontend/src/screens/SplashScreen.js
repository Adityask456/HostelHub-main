import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Animated, ActivityIndicator } from "react-native";

export default function SplashScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <Image
          source={require("../../assets/logo.jpg")}
          style={styles.logo}
        />
        
        {/* App Name */}
        <Text style={styles.appName}>HostelHub</Text>
        <Text style={styles.tagline}>Your Hostel Companion</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8fb3ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f0e7",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#8fb3ff",
    fontWeight: "600",
    fontSize: 14,
  },
});
