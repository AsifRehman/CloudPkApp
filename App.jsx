import * as React from 'react';
import { useEffect, useState } from 'react';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon
import api from './src/api';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import TodaySales from './src/screens/TodaySales';
import SaleDetails from './src/screens/SaleDetails';
import ProfileScreen from './src/screens/ProfileScreen';
import BlueScreen from './src/screens/BlueScreen';
import AllProducts from './src/screens/AllProducts';
import AllProdTypes from './src/screens/AllProdTypes';
import { AppContext } from './src/AppContext';
import SalesSummary from './src/screens/SalesSummary';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TodaySales" component={TodaySales} />
      <Stack.Screen name="SalesSummary" component={SalesSummary} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Blue" component={BlueScreen} />
      <Stack.Screen name="AllProducts" component={AllProducts} />
      <Stack.Screen name="AllProdTypes" component={AllProdTypes} />
      <Stack.Screen name="SaleDetails" component={SaleDetails} initialParams={{ vocNo: '1' }} />
    </Stack.Navigator>
  );
}

// Custom Drawer Content
function CustomDrawerContent(props) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    props.navigation.dispatch(DrawerActions.closeDrawer());
    props.navigation.navigate('Login');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1 }}>
        <DrawerItem label="Home" onPress={() => props.navigation.navigate('HomeStack')} />
        <DrawerItem label="Today Sales" onPress={() => props.navigation.navigate('TodaySales')} />
        <DrawerItem label="Sales Summary" onPress={() => props.navigation.navigate('SalesSummary')} />
        <DrawerItem label="All Products" onPress={() => props.navigation.navigate('AllProducts')} />
        <DrawerItem label="All ProdTypes" onPress={() => props.navigation.navigate('AllProdTypes')} />
      </View>

      {/* Logout Button */}
      <View style={{ padding: 10, borderTopWidth: 1, borderColor: '#ccc' }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'orange',
            padding: 10,
            borderRadius: 5,
            justifyContent: 'center',
          }}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('https://api.cloudpkerp.com:8081/api/product');
          if (response.status === 200) {
            setInitialRoute('HomeStack');
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            setInitialRoute('Login');
          }
        }
      } else {
        setInitialRoute('Login');
      }
    };
    checkToken();
  }, []);

  const [products, setProducts] = useState([]);
  const [prodTypes, setProdTypes] = useState([]);

  if (initialRoute === null) return null; // Show loading screen or return null until route is set

  return (
    <AppContext.Provider value={{ products, setProducts, prodTypes, setProdTypes }}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen name="Login" component={LoginScreen} options={{ headerTitle: '' }} />
          <Drawer.Screen name="HomeStack" component={HomeStack} options={{ title: 'Home' }} />
          <Drawer.Screen name="Today Sales" component={TodaySales} options={{ title: "Sales" }} />
          <Drawer.Screen name="Sales Summary" component={SalesSummary} options={{ title: "Sales Summary" }} />
        </Drawer.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;
