import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert, View, TextInput, TouchableOpacity, ImageBackground, SafeAreaView } from "react-native";
import { fetchHotels } from "../services/api";
import { Hotel } from "../types/Hotel";
import HotelCard from "../components/HotelCard";
import { useFavorites } from "../context/FavoritesContext";
import { auth, db } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const Home = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const { favoriteHotelIds, addToFavorites, removeFromFavorites } = useFavorites();
  const navigation = useNavigation<HomeNavProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userInitials, setUserInitials] = useState("CE");

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Firestore'dan kullanıcı bilgilerini al
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const initials = `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`;
          setUserInitials(initials.toUpperCase());
        }
      }
    });
    return () => unsubscribe();
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
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {currentUser ? `Hello, ${currentUser.displayName}` : 'Hello, Guest'}
              </Text>
              <Text style={styles.subtitle}>Get Best Room!</Text>
            </View>
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
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B3DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingVertical: 0,
  },
  filterSection: {
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "space-between",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  halfWidth: {
    flex: 1,
  },
  filterButtonText: {
    fontSize: 16,
    color: "#666666",
    flex: 1,
    marginLeft: 12,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    padding: 0,
  },
  searchButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  hotelList: {
    padding: 24,
    paddingTop: 8,
    gap: 16,
  },
});

export default Home;















