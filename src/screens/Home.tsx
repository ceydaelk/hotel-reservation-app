import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert } from "react-native";
import { fetchHotels } from "../services/api";
import { Hotel } from "../types/Hotel";
import HotelCard from "../components/HotelCard";
import { useFavorites } from "../context/FavoritesContext";
import { auth } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const Home = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const { favoriteHotelIds, addToFavorites, removeFromFavorites } = useFavorites();
  const navigation = useNavigation<HomeNavProp>();

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await fetchHotels();
        setHotels(data);
      } catch (error) {
        console.error("Otel listesi alınamadı:", error);
        Alert.alert("Hata", "Otel listesi yüklenirken bir hata oluştu.");
      }
    };
    loadHotels();
  }, []);

  const toggleFavorite = async (hotelId: string) => {
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

      if (favoriteHotelIds.includes(hotelId)) {
        await removeFromFavorites(hotelId);
      } else {
        await addToFavorites(hotelId);
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Otel Listesi</Text>
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          isFavorite={favoriteHotelIds.includes(hotel.id)}
          onFavoriteToggle={() => toggleFavorite(hotel.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});

export default Home;








