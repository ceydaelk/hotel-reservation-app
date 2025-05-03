import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { fetchHotels } from "../services/api";
import HotelCard from "../components/HotelCard";
import { Hotel } from "../types/Hotel";
import { useFavorites } from "../context/FavoritesContext";
import { auth } from "../services/firebase";

const Favorites = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const { favoriteHotelIds, removeFromFavorites } = useFavorites();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const allHotels = await fetchHotels();
        const favHotels = allHotels.filter((h) => favoriteHotelIds.includes(h.id));
        setHotels(favHotels);
      } catch (error) {
        console.error("Favori oteller yüklenemedi:", error);
        Alert.alert("Hata", "Favori oteller yüklenirken bir hata oluştu.");
      }
    };
    loadFavorites();
  }, [favoriteHotelIds]);

  const handleRemoveFavorite = async (hotelId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Hata", "Giriş yapmalısınız.");
        return;
      }
      await removeFromFavorites(hotelId);
    } catch (error) {
      console.error("Favori silinemedi:", error);
      Alert.alert("Hata", "Favori silinirken bir hata oluştu.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Favori Otellerim</Text>
      {hotels.length === 0 ? (
        <Text style={styles.empty}>Henüz favori otel yok 💔</Text>
      ) : (
        hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            isFavorite={true}
            onFavoriteToggle={() => handleRemoveFavorite(hotel.id)}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  empty: { fontSize: 16, color: "#888", textAlign: "center", marginTop: 50 },
});

export default Favorites;







