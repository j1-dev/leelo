import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export default function HomeTabBar({ show }: { show: boolean }) {
  const router = useRouter();
  const segments = useSegments();

  const activeTab = `/${segments[segments.length - 1]}`; // Get the current route

  const tabs = [
    {
      name: "Home",
      route: "/home",
      icon: "home",
    },
    {
      name: "Discover",
      route: "/discover",
      icon: "search",
    },
    { name: "Create", route: "/create", icon: "plus-square" },
    { name: "Profile", route: "/profile", icon: "user" },
  ];

  // Animated value to control the tab bar position
  const translateY = useRef(new Animated.Value(80)).current; // Start off-screen

  // Handle show/hide animations
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: show ? 0 : 80, // Smoothly animate to 0 (visible) or 80 (hidden)
      duration: 300, // Same duration for both directions
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [show]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64, // Tab bar height
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e2e2e2",
        flexDirection: "row",
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.push(tab.route)}
        >
          <Feather
            name={tab.icon}
            size={24}
            color={activeTab === tab.route ? "#007AFF" : "#8E8E93"}
          />
          <Text
            style={{
              color: activeTab === tab.route ? "#007AFF" : "#8E8E93",
              fontWeight: activeTab === tab.route ? "bold" : "normal",
            }}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}
