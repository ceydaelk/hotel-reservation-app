import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert, View, TextInput, TouchableOpacity, ImageBackground, SafeAreaView } from "react-native";
import { fetchHotels } from "../services/api";
import { Hotel } from "../types/Hotel";
import HotelCard from "../components/HotelCard";
import { useFavorites } from "../context/FavoritesContext";
import { auth } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const Home = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const { favoriteHotelIds, addToFavorites, removeFromFavorites } = useFavorites();
  const navigation = useNavigation<HomeNavProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await fetchHotels();
        setHotels(data);
        setFilteredHotels(data);
      } catch (error) {
        console.error("Otel listesi alınamadı:", error);
        Alert.alert("Hata", "Otel listesi yüklenirken bir hata oluştu.");
      }
    };
    loadHotels();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, minPrice, maxPrice);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    applyFilters(searchQuery, min, max);
  };

  const applyFilters = (search: string, min: string, max: string) => {
    let filtered = [...hotels];

   
    if (search.trim() !== "") {
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.location.toLowerCase().includes(search.toLowerCase())
      );
    }

   
    if (min.trim() !== "") {
      filtered = filtered.filter(hotel => hotel.price >= parseFloat(min));
    }
    if (max.trim() !== "") {
      filtered = filtered.filter(hotel => hotel.price <= parseFloat(max));
    }

    setFilteredHotels(filtered);
  };

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Get Best Room!</Text>
          <View style={styles.userIcon}>
            <Ionicons name="person-circle-outline" size={32} color="#333" />
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search address, city, zip"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          
          <View style={styles.filterSection}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.filterButtonText}>Check In - Check Out</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.filterRow}>
              <View style={[styles.filterButton, styles.halfWidth]}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min Price"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={(value) => handlePriceChange(value, maxPrice)}
                />
              </View>
              
              <View style={[styles.filterButton, styles.halfWidth]}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max Price"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={(value) => handlePriceChange(minPrice, value)}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hotelList}>
          {filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isFavorite={favoriteHotelIds.includes(hotel.id)}
              onFavoriteToggle={() => toggleFavorite(hotel.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  userIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    padding: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  filterSection: {
    gap: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 15,
  },
  halfWidth: {
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginLeft: 5,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    padding: 0,
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hotelList: {
    padding: 20,
    paddingTop: 0,
  },
});

export default Home;















