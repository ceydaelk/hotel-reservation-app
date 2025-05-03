import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { auth } from "../services/firebase";
import { Hotel } from "../types/Hotel";
import { useFavorites } from "../context/FavoritesContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";

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
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate("HotelDetails", { hotel })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: hotel.image }} style={styles.image} />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleToggle}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ff3b30" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{hotel.name}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#666" /> {hotel.location}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.amenities}>
            <View style={styles.amenityItem}>
              <Ionicons name="bed-outline" size={16} color="#666" />
              <Text style={styles.amenityText}>2 Beds</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="water-outline" size={16} color="#666" />
              <Text style={styles.amenityText}>1 Bath</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.amenityText}>4 Guest</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${hotel.price}</Text>
            <Text style={styles.priceUnit}>/night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
  },
  mainInfo: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amenities: {
    flexDirection: "row",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amenityText: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  priceUnit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    marginBottom: 2,
  },
});

export default HotelCard;


