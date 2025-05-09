import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert, View, TextInput, TouchableOpacity, ImageBackground, SafeAreaView, Modal, Platform, StatusBar } from "react-native";
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
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

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
  const [userInitials, setUserInitials] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState({});

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
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const initials = `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`;
            if (initials.trim()) {
              setUserInitials(initials.toUpperCase());
            } else if (user.displayName) {
             
              const names = user.displayName.split(' ');
              const displayNameInitials = `${names[0]?.[0] || ''}${names[names.length - 1]?.[0] || ''}`;
              setUserInitials(displayNameInitials.toUpperCase());
            }
          } else if (user.displayName) {
         
            const names = user.displayName.split(' ');
            const displayNameInitials = `${names[0]?.[0] || ''}${names[names.length - 1]?.[0] || ''}`;
            setUserInitials(displayNameInitials.toUpperCase());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
         
          if (user.displayName) {
            const names = user.displayName.split(' ');
            const displayNameInitials = `${names[0]?.[0] || ''}${names[names.length - 1]?.[0] || ''}`;
            setUserInitials(displayNameInitials.toUpperCase());
          }
        }
      } else {
        setUserInitials(""); 
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

  const handleDateSelect = (day: any) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
     
      const startDate = day.dateString;
      setSelectedStartDate(startDate);
      setSelectedEndDate(null);
      setMarkedDates({
        [startDate]: { startingDay: true, color: '#2E7D32', textColor: 'white' }
      });
    } else {
    
      const endDate = day.dateString;
      if (moment(endDate).isBefore(selectedStartDate)) {
        Alert.alert('Hata', 'Çıkış tarihi giriş tarihinden önce olamaz.');
        return;
      }
      setSelectedEndDate(endDate);

 
      const range = getDateRange(selectedStartDate, endDate);
      setMarkedDates(range);
      
      
      setTimeout(() => setShowDatePicker(false), 500);
    }
  };

  const getDateRange = (startDate: string, endDate: string) => {
    const range: any = {};
    let currentDate = moment(startDate);
    const lastDate = moment(endDate);

    while (currentDate.isSameOrBefore(lastDate)) {
      const dateString = currentDate.format('YYYY-MM-DD');
      if (dateString === startDate) {
        range[dateString] = { startingDay: true, color: '#2E7D32', textColor: 'white' };
      } else if (dateString === endDate) {
        range[dateString] = { endingDay: true, color: '#2E7D32', textColor: 'white' };
      } else {
        range[dateString] = { color: '#2E7D32', textColor: 'white' };
      }
      currentDate = currentDate.add(1, 'days');
    }
    return range;
  };

  const formatDateRange = () => {
    if (selectedStartDate && selectedEndDate) {
      return `${moment(selectedStartDate).format('DD MMM')} - ${moment(selectedEndDate).format('DD MMM')}`;
    }
    return 'Check In - Check Out';
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <SafeAreaView style={styles.safeTop} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.filterButtonText}>{formatDateRange()}</Text>
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

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tarih Seçin</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                markingType="period"
                minDate={moment().format('YYYY-MM-DD')}
                theme={{
                  todayTextColor: '#2E7D32',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 16,
                }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeTop: {
    flex: 0,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#498a4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 20,
    gap: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    padding: 20,
    paddingTop: 4,
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default Home;















