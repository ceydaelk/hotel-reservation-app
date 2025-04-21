import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";
import Favorites from "../screens/Favorites"; 

// Ekranlar
import Home from "../screens/Home";
import HotelDetails from "../screens/HotelDetails";
import RoomSelection from "../screens/RoomSelection";
import Reservation from "../screens/Reservation";
import ReservationHistory from "../screens/ReservationHistory";
import Profile from "../screens/Profile";
import Login from "../screens/Login";
import Register from "../screens/Register";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// 💅 Home sekmesi içindeki stack
const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={Home} />
    <HomeStack.Screen name="HotelDetails" component={HotelDetails} />
    <HomeStack.Screen name="RoomSelection" component={RoomSelection} />
    <HomeStack.Screen name="Reservation" component={Reservation} />
  </HomeStack.Navigator>
);

// 👑 Ana tabbar menüsü
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName =
          route.name === "HomeStack"
            ? "home-outline"
            : route.name === "ReservationHistory"
            ? "book-outline"
            : "person-outline";
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStackScreen}
      options={{ title: "Home" }}
    />
    <Tab.Screen name="ReservationHistory" component={ReservationHistory} />
    <Tab.Screen name="Profile" component={Profile} />
    <Tab.Screen name="Favorites" component={Favorites} options={{ title: "Favorilerim" }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;



