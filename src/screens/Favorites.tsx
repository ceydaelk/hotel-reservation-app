import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { fetchHotels } from "../services/api";
import { Hotel } from "../types/Hotel";

const Favorites = () => {
  const [favorites, setFavorites] = useState<Hotel[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const allHotels = await fetchHotels();

        // AsyncStorage ile saklanan favori ID'leri alınabilir
        const favHotels = allHotels.filter((hotel) => favoriteIds.includes(hotel.id));
        setFavorites(favHotels);
      } catch (err) {
        console.error("Veriler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [favoriteIds]);

  const toggleFavorite = (hotel: Hotel) => {
    if (favoriteIds.includes(hotel.id)) {
      setFavoriteIds((prev) => prev.filter((id) => id !== hotel.id));
      setFavorites((prev) => prev.filter((h) => h.id !== hotel.id));
    } else {
      setFavoriteIds((prev) => [...prev, hotel.id]);
      setFavorites((prev) => [...prev, hotel]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Favori Otellerim</Text>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Henüz favori otel yok 💔</Text>
      ) : (
        favorites.map((hotel) => (
          <View key={hotel.id} style={styles.card}>
            <Image source={{ uri: hotel.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{hotel.name}</Text>
              <Text style={styles.location}>📍 {hotel.location}</Text>
              <Text style={styles.rating}>⭐ {hotel.rating}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(hotel)}>
                <Text style={styles.removeButton}>
                  {favoriteIds.includes(hotel.id)
                    ? "🗑️ Favoriden Çıkar"
                    : "❤️ Favorilere Ekle"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  empty: { fontSize: 16, color: "#888", textAlign: "center", marginTop: 50 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: { width: "100%", height: 160 },
  cardContent: { padding: 12 },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  location: { fontSize: 14, color: "#888" },
  rating: { fontSize: 14, color: "#f5a623", marginTop: 4 },
  removeButton: { color: "#e63946", fontWeight: "bold", marginTop: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});

export default Favorites;
