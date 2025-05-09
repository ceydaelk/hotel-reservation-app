import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, SafeAreaView } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { db, auth } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFavorites } from "../context/FavoritesContext";

type HotelDetailsRouteProp = RouteProp<RootStackParamList, "HotelDetails">;
type HotelDetailsNavProp = NativeStackNavigationProp<RootStackParamList, "HotelDetails">;

const HotelDetails = () => {
  const { favoriteHotelIds, addToFavorites, removeFromFavorites } = useFavorites();
  const [guestCount, setGuestCount] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const route = useRoute<HotelDetailsRouteProp>();
  const navigation = useNavigation<HotelDetailsNavProp>();
  const { hotel } = route.params;
  const isFavorite = favoriteHotelIds.includes(hotel.id);

  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      const diff = checkOutDate.getTime() - checkInDate.getTime();
      return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
    }
    return 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * guestCount * Number(hotel.price || 0);

  const handleReservation = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı oturumu yok.");
      return;
    }

    if (!checkInDate || !checkOutDate || nights <= 0) {
      Alert.alert("Hata", "Lütfen geçerli birgiriş ve çıkış tarihi seçin.");
      return;
    }

    try {
      await addDoc(collection(db, "reservations"), {
        userId,
        hotelName: hotel.name,
        guestCount,
        totalPrice,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        createdAt: new Date(),
      });
      Alert.alert("Rezervasyon Başarılı", `Toplam: ${totalPrice}₺`);
      navigation.navigate("ReservationHistory");
    } catch (error: any) {
      console.error("Firestore Hatası:", error);
      Alert.alert("Firestore Hatası", error.message);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Giriş Gerekli",
          "Favorilere eklemek için giriş yapmalısınız.",
          [
            {
              text: "Giriş Yap",
              onPress: () => navigation.navigate("Login"),
            },
            {
              text: "İptal",
              style: "cancel",
            },
          ]
        );
        return;
      }

      if (isFavorite) {
        await removeFromFavorites(hotel.id);
      } else {
        await addToFavorites(hotel.id);
      }
    } catch (error) {
      console.error("Favori işlemi hatası:", error);
      Alert.alert(
        "Hata",
        "Favori işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: hotel.image }} style={styles.image} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={22} color="#222" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{hotel.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.location}>{hotel.location}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]} 
              onPress={handleFavoriteToggle}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#ff4a4a" : "#222"} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.amenitiesRow}>
            <View style={styles.amenityItem}>
              <Ionicons name="bed-outline" size={18} color="#666" />
              <Text style={styles.amenityText}>2 Beds</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="water-outline" size={18} color="#666" />
              <Text style={styles.amenityText}>1 Bath</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="people-outline" size={18} color="#666" />
              <Text style={styles.amenityText}>4 Guest</Text>
            </View>
          </View>

          <View style={styles.datePickerContainer}>
            <Text style={styles.sectionTitle}>Giriş ve Çıkış Tarihi</Text>
            <TouchableOpacity onPress={() => setShowCheckIn(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>Giriş Tarihi: {checkInDate ? checkInDate.toLocaleDateString() : 'Seçilmedi'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCheckOut(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>Çıkış Tarihi: {checkOutDate ? checkOutDate.toLocaleDateString() : 'Seçilmedi'}</Text>
            </TouchableOpacity>
          </View>

          {showCheckIn && (
            <DateTimePicker
              value={checkInDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowCheckIn(false);
                if (selectedDate) {
                  setCheckInDate(selectedDate);
                  
                  if (checkOutDate && selectedDate > checkOutDate) {
                    setCheckOutDate(null);
                  }
                }
              }}
              minimumDate={new Date()}
            />
          )}

          {showCheckOut && (
            <DateTimePicker
              value={checkOutDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowCheckOut(false);
                if (selectedDate) {
                  setCheckOutDate(selectedDate);
                }
              }}
              minimumDate={checkInDate || new Date()}
            />
          )}

          <View style={styles.guestCounterContainer}>
            <Text style={styles.inputLabel}>Kişi Sayısı</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterButton, guestCount === 1 && { opacity: 0.5 }]}
                onPress={() => setGuestCount((prev) => Math.max(1, prev - 1))}
                disabled={guestCount === 1}
              >
                <Ionicons name="remove-circle-outline" size={28} color="#2E7D32" />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{guestCount}</Text>
              <TouchableOpacity
                style={[styles.counterButton, guestCount === 10 && { opacity: 0.5 }]}
                onPress={() => setGuestCount((prev) => Math.min(10, prev + 1))}
                disabled={guestCount === 10}
              >
                <Ionicons name="add-circle-outline" size={28} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {nights > 0
                ? `Toplam Fiyat: ${totalPrice.toLocaleString()}₺ (${nights} gece)`
                : 'Lütfen giriş ve çıkış tarihi seçin'}
            </Text>
          </View>

          <Text style={styles.description}>{hotel.description}</Text>

          <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
            <Text style={styles.reserveButtonText}>Rezerve Et</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.sectionTitle}>Konum</Text>
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: hotel.latitude || 41.0082,
                longitude: hotel.longitude || 28.9784,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: hotel.latitude || 41.0082,
                  longitude: hotel.longitude || 28.9784,
                }}
                title={hotel.name}
                description={hotel.location}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 260,
    backgroundColor: '#eee',
    marginBottom: -30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
  },
  shareButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    color: '#666',
    marginLeft: 4,
  },
  favoriteButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#ffe5e5',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputBox: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  reserveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 160,
  },
  counterButton: {
    padding: 4,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#666',
  },
  guestCounterContainer: {
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestCount: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 32,
    textAlign: 'center',
  },
});

export default HotelDetails;




