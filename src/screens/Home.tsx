import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Hotel } from "../types/Hotel";
import { fetchHotels } from "../services/api";
import { auth, db } from "../services/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
} from "firebase/firestore";

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [favoriteHotelIds, setFavoriteHotelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const hotelData = await fetchHotels();
      setHotels(hotelData);
      await fetchFavorites();
      setLoading(false);
    };
    load();
  }, []);

  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const ids = snapshot.docs.map((doc) => doc.data().hotelId);
    setFavoriteHotelIds(ids);
  };

  const toggleFavorite = async (hotelId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid),
      where("hotelId", "==", hotelId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      await deleteDoc(doc(db, "favorites", snapshot.docs[0].id));
      setFavoriteHotelIds((prev) => prev.filter((id) => id !== hotelId));
    } else {
      await addDoc(collection(db, "favorites"), { userId: user.uid, hotelId });
      setFavoriteHotelIds((prev) => [...prev, hotelId]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Otel Listesi</Text>
      {hotels.map((hotel) => {
        const isFavorite = favoriteHotelIds.includes(hotel.id);
        return (
          <View key={hotel.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => navigation.navigate("HotelDetails", { hotel })}
            >
              <Image source={{ uri: hotel.image }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.name}>{hotel.name}</Text>
                <Text style={styles.location}>📍 {hotel.location}</Text>
                <Text style={styles.rating}>⭐ {hotel.rating}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(hotel.id)}>
              <Text style={styles.favoriteButton}>
                {isFavorite ? "🗑️ Favoriden Çıkar" : "❤️ Favorilere Ekle"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
  },
  image: { width: "100%", height: 160 },
  cardContent: { padding: 12 },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  location: { fontSize: 14, color: "#888" },
  rating: { fontSize: 14, color: "#f5a623", marginTop: 4 },
  favoriteButton: { marginTop: 10, color: "red", fontWeight: "bold", textAlign: "center" },
});

export default Home;

