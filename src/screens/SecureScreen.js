// SecureScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Animated  } from 'react-native';
import api from '../api'; // Import your Axios instance

const SecureScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in animation
  const slideAnim = useRef(new Animated.Value(100)).current; // Slide-up animation

  const fetchData = async () => {
    try {
      const response = await api.get('/products');
      setData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch secure data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     // Start animations after data is loaded
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
    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <Animated.FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.name}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'white', // White background for each item
    borderRadius: 10, // Rounded corners for a professional look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Text color
  },
});

export default SecureScreen;