import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Favorites from "../screens/Favorites"; 

// Ekranlar
import Home from "../screens/Home";
import HotelDetails from "../screens/HotelDetails";
import RoomSelection from "../screens/RoomSelection";
import Reservation from "../screens/Reservation";
import ReservationHistory from "../screens/ReservationHistory";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="HotelDetails" component={HotelDetails} />
    <Stack.Screen name="RoomSelection" component={RoomSelection} />
    <Stack.Screen name="Reservation" component={Reservation} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
            let iconName =
              route.name === "HomeStack"
                ? "home-outline"
                : route.name === "ReservationHistory"
                ? "book-outline"
                : route.name === "Favorites"
                ? "heart-outline"
                : "person-outline";
          
            return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStack}
      options={{ title: "Home" }}
    />
    <Tab.Screen name="ReservationHistory" component={ReservationHistory} />
    <Tab.Screen name="Profile" component={Profile} />
    <Tab.Screen name="Favorites" component={Favorites} />
  </Tab.Navigator>
);

export default MainTabs;

