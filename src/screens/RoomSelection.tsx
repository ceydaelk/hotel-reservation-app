import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { roomList } from "../data/rooms";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RoomSelectionRouteProp = RouteProp<RootStackParamList, "RoomSelection">;
type RoomSelectionNavProp = NativeStackNavigationProp<RootStackParamList, "RoomSelection">;

const RoomSelection = () => {
  const route = useRoute<RoomSelectionRouteProp>();
  const navigation = useNavigation<RoomSelectionNavProp>();
  const { hotel } = route.params;

  const filteredRooms = roomList.filter((room) => room.hotelId === hotel.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{hotel.name} - Oda Seçimi</Text>

      {filteredRooms.map((room) => (
        <TouchableOpacity
          key={room.id}
          style={styles.card}
          onPress={() => navigation.navigate("Reservation", { hotel, room })}
        >
          <Image source={{ uri: room.image }} style={styles.image} />
          <Text style={styles.name}>{room.name}</Text>
          <Text style={styles.detail}>Kapasite: {room.capacity} kişi</Text>
          <Text style={styles.detail}>Fiyat: {room.price}₺</Text>
        </TouchableOpacity>
      ))}

      {filteredRooms.length === 0 && (
        <Text style={{ marginTop: 20, fontStyle: "italic", color: "#999" }}>
          Bu otele ait oda bulunamadı.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  detail: {
    fontSize: 16,
    color: "#555",
  },
});

export default RoomSelection;


