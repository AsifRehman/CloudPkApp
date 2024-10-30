import React, { useRef, useEffect } from 'react';
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const ProfileScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in animation
    const slideAnim = useRef(new Animated.Value(100)).current; // For slide-up animation

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
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.centeredView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.text}>Welcome to Your Profile</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>Go to Home</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ff3d00', // Red background to match theme
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white', // White card-like container
        borderRadius: 15, // Rounded corners for modern look
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // Shadow for Android
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff3d00', // Red text to match the theme
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ff3d00', // Red background to match theme
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30, // Rounded button
        marginTop: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5, // Shadow effect for the button
    },
    buttonText: {
        color: 'white', // White text color for contrast
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
