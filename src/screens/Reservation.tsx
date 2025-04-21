import React from "react";
import { View, Text, Image, StyleSheet, Button, Alert } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ReservationRouteProp = RouteProp<RootStackParamList, "Reservation">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Reservation">;

const Reservation = () => {
  const route = useRoute<ReservationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { hotel, room } = route.params;

  const handleReservation = async () => {
    try {
      await addDoc(collection(db, "reservations"), {
        userId: auth.currentUser?.uid,
        hotelName: hotel.name,
        roomName: room.name,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Rezervasyon Başarılı", `${hotel.name} - ${room.name}`);
      navigation.navigate("ReservationHistory");
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: room.image }} style={styles.image} />
      <Text style={styles.name}>{hotel.name} - {room.name}</Text>
      <Text style={styles.info}>Kapasite: {room.capacity} kişi</Text>
      <Text style={styles.info}>Fiyat: {room.price}₺</Text>
      <Button title="Rezerve Et" onPress={handleReservation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default Reservation;

