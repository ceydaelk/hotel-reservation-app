import React from "react";
import { View, Text, Image, StyleSheet, Button, Alert } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { db, auth } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ReservationRouteProp = RouteProp<RootStackParamList, "Reservation">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Reservation">;

const Reservation = () => {
  const route = useRoute<ReservationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { hotel, room } = route.params;

  const handleReservation = async () => {
    Alert.alert("Butona basıldı!");
    const userId = auth.currentUser?.uid;
  
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı oturumu yok.");
      return;
    }
  
    try {
      console.log("Firestore'a gönderilecek veri:", {
        userId,
        hotelName: hotel.name,
        roomName: room.name,
      });
  
      const docRef = await addDoc(collection(db, "reservations"), {
        userId,
        hotelName: hotel.name,
        roomName: room.name,
        createdAt: new Date(),
      });
  
      Alert.alert("Rezervasyon Başarılı", `ID: ${docRef.id}`);
      navigation.navigate("ReservationHistory");
    } catch (error: any) {
      console.error("Firestore Hatası:", error);
      Alert.alert("Firestore Hatası", error.message);
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

