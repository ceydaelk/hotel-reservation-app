import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, SafeAreaView } from "react-native";
import { fetchHotels } from "../services/api";
import HotelCard from "../components/HotelCard";
import { Hotel } from "../types/Hotel";
import { useFavorites } from "../context/FavoritesContext";
import { auth } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorilerim</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{hotels.length}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>
        </View>

        {hotels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz favori otel yok</Text>
            <Text style={styles.emptySubText}>Beğendiğiniz oteller burada görünecek</Text>
          </View>
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
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});

export default Favorites;







