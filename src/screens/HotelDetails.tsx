import React from "react";
import { View, Text, Image, StyleSheet, Button } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type HotelDetailsRouteProp = RouteProp<RootStackParamList, "HotelDetails">;
type HotelDetailsNavProp = NativeStackNavigationProp<RootStackParamList, "HotelDetails">;

const HotelDetails = () => {
  const route = useRoute<HotelDetailsRouteProp>();
  const navigation = useNavigation<HotelDetailsNavProp>();
  const { hotel } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: hotel.image }} style={styles.image} />
      <Text style={styles.name}>{hotel.name}</Text>
      <Text style={styles.location}>{hotel.location}</Text>
      <Text style={styles.rating}>⭐ {hotel.rating}</Text>
   
      <Button
        title="Odaları Gör"
        onPress={() => navigation.navigate("RoomSelection", { hotel })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    color: "#666",
    marginBottom: 4,
  },
  rating: {
    fontSize: 18,
    color: "#e5a200",
    marginBottom: 16,
  },
});

export default HotelDetails;


