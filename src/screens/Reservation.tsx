import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { db, auth } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';

type ReservationRouteProp = RouteProp<RootStackParamList, "Reservation">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Reservation">;



const Reservation = () => {

  const [guestCount, setGuestCount] = useState("1");
const [nightCount, setNightCount] = useState("1");

  const route = useRoute<ReservationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { hotel, room } = route.params;

  const handleReservation = async () => {
    const userId = auth.currentUser?.uid;
  
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı oturumu yok.");
      return;
    }
  
    const totalPrice = Number(room.price) * Number(nightCount);
  
    try {
      const docRef = await addDoc(collection(db, "reservations"), {
        userId,
        hotelName: hotel.name,
        roomName: room.name,
        guestCount: Number(guestCount),
        nightCount: Number(nightCount),
        totalPrice,
        createdAt: new Date(),
        
      });
  
      Alert.alert("Rezervasyon Başarılı", `Toplam: ${totalPrice}₺`);
      navigation.navigate("ReservationHistory");
    } catch (error: any) {
      console.error("Firestore Hatası:", error);
      Alert.alert("Firestore Hatası", error.message);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.image }} style={styles.image} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.roomName}>{room.name}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Kapasite</Text>
              <Text style={styles.detailValue}>{room.capacity} Kişi</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="bed-outline" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Oda Tipi</Text>
              <Text style={styles.detailValue}>{room.name}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Müsaitlik</Text>
              <Text style={styles.detailValue}>Hemen</Text>
            </View>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View>
            <Text style={styles.priceLabel}>Toplam Fiyat</Text>
            <Text style={styles.price}>{room.price}₺</Text>
          </View>
          <Text style={styles.perNight}>gecelik</Text>
        </View>


        <View style={{ marginBottom: 16 }}>
  <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
    Kişi Sayısı
  </Text>
  <TextInput
    value={guestCount}
    onChangeText={setGuestCount}
    placeholder="Kaç kişi kalacak?"
    keyboardType="numeric"
    style={{
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    }}
  />

  <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
    Gece Sayısı
  </Text>
  <TextInput
    value={nightCount}
    onChangeText={setNightCount}
    placeholder="Kaç gece kalınacak?"
    keyboardType="numeric"
    style={{
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
    }}
  />
          <TouchableOpacity 
          style={styles.reserveButton}
          onPress={handleReservation}
        >
          <Text style={styles.reserveButtonText}>Rezerve Et</Text>
        </TouchableOpacity>
</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#fff',
    marginTop: -30,
  },
  header: {
    marginBottom: 24,
  },
  hotelName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 18,
    color: '#666',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  perNight: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reserveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Reservation;

