// src/screens/SettingsScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons for icons


const SettingsScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in animation
  const slideAnim = useRef(new Animated.Value(100)).current; // Slide-up animation

  useEffect(() => {
    // Run animations when screen loads
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Icon */}
        <Icon name="settings" size={64} color="white" style={styles.icon} />

        {/* Title */}
        <Text style={styles.title}>Settings</Text>

        {/* Description or extra text */}
        <Text style={styles.description}>
          Manage your preferences and application settings here.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff3d00', // Red background to match theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
});

export default SettingsScreen;
