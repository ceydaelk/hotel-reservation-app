import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Hotel } from "../types/Hotel";

interface HotelCardProps {
  hotel: Hotel;
  isFavorite: boolean;
  onToggleFavorite: (hotelId: string) => void;
  onPress?: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, isFavorite, onToggleFavorite, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: hotel.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>📍 {hotel.location}</Text>
        <View style={styles.row}>
          <Text style={styles.rating}>⭐ {hotel.rating}</Text>
          <TouchableOpacity onPress={() => onToggleFavorite(hotel.id)}>
            <Text style={styles.favoriteText}>
              {isFavorite ? "🗑️ Favoriden Çıkar" : "❤️ Favorilere Ekle"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  image: {
    width: "100%",
    height: 160,
  },
  cardContent: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#888",
  },
  rating: {
    fontSize: 14,
    color: "#f5a623",
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  favoriteText: {
    color: "#e63946",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default HotelCard;