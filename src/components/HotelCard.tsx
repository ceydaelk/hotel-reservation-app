import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { auth } from "../services/firebase";
import { Hotel } from "../types/Hotel";
import { useFavorites } from "../context/FavoritesContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type HotelCardNavProp = NativeStackNavigationProp<RootStackParamList, "HotelDetails">;

interface HotelCardProps {
  hotel: Hotel;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, isFavorite, onFavoriteToggle }) => {
  const navigation = useNavigation<HotelCardNavProp>();

  const handleToggle = async () => {
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
              text: "Kayıt Ol",
              onPress: () => navigation.navigate("Register"),
            },
            {
              text: "İptal",
              style: "cancel",
            },
          ]
        );
        return;
      }
      await onFavoriteToggle();
    } catch (error) {
      console.error("Favori işlemi hatası:", error);
      Alert.alert(
        "Hata",
        "Favori işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => navigation.navigate("HotelDetails", { hotel })}
      >
        <Image source={{ uri: hotel.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{hotel.name}</Text>
          <Text style={styles.location}>📍 {hotel.location}</Text>
          <Text style={styles.rating}>⭐ {hotel.rating}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleToggle}
        style={styles.favoriteButtonContainer}
      >
        <Text style={[
          styles.favoriteButton,
          isFavorite && styles.favoriteButtonActive
        ]}>
          {isFavorite ? "❤️ Favorilerden Çıkar" : "🤍 Favorilere Ekle"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
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
    marginTop: 4,
  },
  favoriteButtonContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  favoriteButton: {
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
  },
  favoriteButtonActive: {
    color: "#ff3b30",
  },
});

export default HotelCard;

