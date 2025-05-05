import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Favorites from "../screens/Favorites"; 
import { View, TouchableOpacity, StyleSheet } from "react-native";
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Ekranlar
import Home from "../screens/Home";
import HotelDetails from "../screens/HotelDetails";
// import RoomSelection from "../screens/RoomSelection";
// import Reservation from "../screens/Reservation";
import ReservationHistory from "../screens/ReservationHistory";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="HotelDetails" component={HotelDetails} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        let iconName =
          route.name === "HomeStack"
            ? "home-outline"
            : route.name === "ReservationHistory"
            ? "calendar-outline"
            : route.name === "Favorites"
            ? "heart-outline"
            : route.name === "Profile"
            ? "settings-outline"
            : "ellipse-outline";

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
              <Ionicons name={iconName as any} size={24} color={isFocused ? '#fff' : '#bbb'} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: "Home" }} />
    <Tab.Screen name="ReservationHistory" component={ReservationHistory} />
    <Tab.Screen name="Favorites" component={Favorites} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 30,
    marginHorizontal: 24,
    marginBottom: 0,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 10,
    borderRadius: 20,
  },
  activeIconWrapper: {
    backgroundColor: '#222',
  },
});

export default MainTabs;

