import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Keyboard, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export default function LoginScreen() {
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorLog, setErrorLog] = useState('');
    const navigation = useNavigation();
    const [isFocused, setIsFocused] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const iconSize = useRef(new Animated.Value(1)).current; // Initial value for icon animation
    const inputOpacity = useRef(new Animated.Value(1)).current; // Animation for input fields' opacity

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);

            // Smooth animation for opacity when keyboard shows
            Animated.timing(inputOpacity, {
                toValue: 0.8, // Slight fade effect on input fields
                duration: 300, // Smooth duration
                useNativeDriver: true,
            }).start();
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
            setIsFocused(false);

            // Restore the opacity back to normal when keyboard hides
            Animated.timing(inputOpacity, {
                toValue: 1, // Return to full opacity
                duration: 300, // Smooth duration
                useNativeDriver: true,
            }).start();
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleFocus = () => {
        setIsFocused(true); // Set focus when input field is focused
    };

    useEffect(() => {
        fetchIpAddress();
    }, []);


    const storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);

            await AsyncStorage.setItem('token', jsonValue);
        } catch (e) {
            // saving error

        }
    };

    const fetchStoredData = async () => {
        try {
            const storedUsername = await AsyncStorage.getItem('username');
            const storedPassword = await AsyncStorage.getItem('password');
            const storedCompanyEmail = await AsyncStorage.getItem('companyEmail');

            if (storedUsername) setUsername(storedUsername);
            if (storedPassword) setPassword(storedPassword);
            if (storedCompanyEmail) setCompanyEmail(storedCompanyEmail);
        } catch (e) {
            console.error('Error fetching stored data:', e);
        }
    };

    useEffect(() => {
        fetchIpAddress();
        fetchStoredData();
    }, []);

    const fetchIpAddress = async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setIpAddress(response.data.ip);
        } catch (error) {
            console.error('Error fetching IP address:', error);
            logError('IP Fetch Error', error);
            Alert.alert('Error', 'Failed to fetch IP address. Please check your internet connection and try again.');
        }
    };

    const logError = (context, error) => {
        const errorMessage = `
    ${context}:
    Message: ${error.message}
    Stack: ${error.stack}
    Response: ${JSON.stringify(error.response?.data)}
    Status: ${error.response?.status}
    Headers: ${JSON.stringify(error.response?.headers)}
    `;
        console.error(errorMessage);
        setErrorLog(prevLog => prevLog + '\n\n' + errorMessage);
    };

    const checkNetworkStatus = async () => {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected && netInfo.isInternetReachable;
    };

    const handleLogin = async () => {
        if (isLoading || !ipAddress) {  // Check if already loading or if IP is not yet fetched
            return;
          }
        if (!username || !password || !companyEmail) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Store username, password, and companyEmail in AsyncStorage
       
        if (!ipAddress) {
            Alert.alert('Error', 'Failed to get IP address. Please try again.');
            return;
        }

        setIsLoading(true);

        const isNetworkAvailable = await checkNetworkStatus();
        if (!isNetworkAvailable) {
            setIsLoading(false);
            Alert.alert('Network Error', 'Please check your internet connection and try again.');
            return;
        }

        // Alert.alert('API Base URL', api.defaults.baseURL);

        try {
            const response = await api.post(
                '/login/GetUserTmpCode',
                {
                    UserName: username,
                    Pwd: password,
                    CompanyEmail: companyEmail + "@cloudpkerp.com",
                    ip: ipAddress
                },
            );


            setIsLoading(false);
            try {
                await AsyncStorage.setItem('username', username);
                await AsyncStorage.setItem('password', password);
                await AsyncStorage.setItem('companyEmail', companyEmail);
            } catch (e) {
                console.error('Error storing user data:', e);
            }

            if (response.data && response.data.token) {
                console.log("response data", response.data.token)
                setToken(response.data.token[0]);
                storeData(response.data.token[0]);
                navigation.navigate('HomeStack');
            } else {
                Alert.alert('Error', 'Invalid credentials or no token received');
            }
        } catch (error) {
            Alert.alert('Error', JSON.stringify(error));
            setIsLoading(false);
            logError('Login Error', error);

            // Alert.alert(`${api.defaults.baseURL}/login/GetUserTmpCode`);
            // Alert.alert(JSON.stringify(error.request));
            // console.error('Error URL:', errorUrl);
            if (error.code === 'ECONNABORTED') {
                Alert.alert('Timeout Error', 'The request took too long to complete. Please try again.');
            } else if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                Alert.alert('Server Error', `Status: ${error.response.status}\nMessage: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // The request was made but no response was received
                Alert.alert('Network Error', 'No response received from the server. Please check your internet connection and try again.');
            } else {
                // Something happened in setting up the request that triggered an Error
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <View style={styles.topSection}>
                <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconSize }] }]}>
                    <Text style={styles.icon}>🍽️</Text>
                </Animated.View>
                <Text style={styles.appTitle}>Restaurant App</Text>
            </View>

            <Animated.View style={[styles.formContainer, { opacity: inputOpacity }]}>
                {!isKeyboardVisible && (
                    <Text style={[styles.formTitle, { color: isFocused ? '#fff' : '#ff3d00' }]}>
                        Login to your account
                    </Text>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Enter Username"
                    placeholderTextColor="#aaa"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={handleFocus}
                    onBlur={() => setIsFocused(false)}
                    color="black"
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={handleFocus}
                    onBlur={() => setIsFocused(false)}
                    color="black"
                    autoCapitalize='none'

                />
                 <View style={styles.emailContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                        placeholder="Enter Company Email"
                        placeholderTextColor="#aaa"
                        value={companyEmail}
                        onChangeText={setCompanyEmail}
                        keyboardType="email-address"
                        color="black"
                        autoCapitalize="none"
                    />
                    <View style={styles.emailExtensionContainer}>
                        <Text style={styles.emailText}>@cloudpkerp.com</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={isLoading || !ipAddress}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomText}>
                    <Text style={styles.bottomTextContent}>Your IP: {ipAddress || 'Fetching...'}</Text>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    topSection: {
        backgroundColor: '#ff3d00',
        width: '100%',
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    iconWrapper: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 50,
    },
    icon: {
        fontSize: 30,
    },
    appTitle: {
        fontSize: 30,
        color: 'white',
        marginTop: 10,
        fontWeight: 'bold',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 350,
        padding: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 15,
    },
    input: {
        width: "100%",
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
        color: 'black',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    emailExtensionContainer: {
        backgroundColor: '#f9f9f9',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        height: 45,
        justifyContent: 'center',
        paddingHorizontal: 5,
        width: 120,  // Slightly increased width for the extension box
        marginBottom: 15,

    },
    emailText: {
        fontSize: 16,
        color: '#ff3d00',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#ff3d00',
        padding: 10,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomText: {
        alignItems: 'center',
        padding: 20,
        marginBottom: 30,
    },
    bottomTextContent: {
        color: '#ff3d00',
        fontWeight: 'bold',
    },
});