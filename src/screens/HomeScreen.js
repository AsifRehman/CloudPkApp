import React, { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Use Ionicons from react-native-vector-icons

const HomeScreen = ({ navigation }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Control menu visibility
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity for buttons
  const slideAnim = useRef(new Animated.Value(100)).current; // Initial slide animation for buttons

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('token');
      if (value) {
        console.log('user login');
      } else {
        console.log('user not login');
        navigation.navigate('Login');
      }
    } catch (e) {
      console.log('error reading value', e);
    }
  };

  useEffect(() => {
    getData();

    // Animate buttons on mount
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
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={32} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Welcome Back</Text>

        <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
          <Icon name="ellipsis-vertical" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menu}>
            <Pressable
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate('Today Sales');
              }}
            >
              <Text style={styles.menuItem}>Today's Sales</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Buttons with animation */}
      <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity
          style={[styles.button, isHovered && styles.buttonHovered]}
          onPress={() => navigation.navigate('Profile')}
          onPressIn={() => setIsHovered(true)}
          onPressOut={() => setIsHovered(false)}
        >
          <Text style={styles.buttonText}>GO TO MENU</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => navigation.navigate('Blue')}
        >
          <Text style={styles.buttonText}>GO TO BLUE SCREEN</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Add extra content below buttons to fill the page */}
      <Animated.View style={[styles.extraContent, { opacity: fadeAnim }]}>
        <Text style={styles.extraText}>
          Explore more by navigating through the menu.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff3d00', // Match the red background from login page
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5', // White color to match the theme
    backgroundColor: '#ff6347', // Slightly darker red for navbar
    elevation: 5, // Adds shadow to navbar
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white', // White text for header
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '80%', // Ensure both buttons have the same width
    padding: 15,
    backgroundColor: 'white', // White background for buttons
    borderRadius: 30, // Rounded buttons for a modern look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  buttonHovered: {
    backgroundColor: '#ff6347', // Slightly different red when pressed
  },
  buttonText: {
    color: '#ff3d00', // Text color matches the login theme
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for modal
  },
  menu: {
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
    color: '#ff3d00', // Menu item text matches theme
  },
  extraContent: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  extraText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;