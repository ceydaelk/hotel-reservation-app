import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Reservation = {
  id: string;
  userId: string;
  hotelName: string;
  guestCount: number;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  createdAt: any;
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const user = auth.currentUser;

  const fetchReservations = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setReservations([]);
        return;
      }
      const q = query(
        collection(db, "reservations"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const results: Reservation[] = [];

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        } as Reservation);
      });

      setReservations(results);
    } catch (error: any) {
      console.error("Rezervasyonlar alınamadı:", error.message);
      Alert.alert("Hata", "Rezervasyonlar yüklenirken bir hata oluştu.");
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      Alert.alert(
        "Rezervasyonu Sil",
        "Bu rezervasyonu silmek istediğinizden emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              await deleteDoc(doc(db, "reservations", reservationId));
              await fetchReservations();
              Alert.alert("Başarılı", "Rezervasyon başarıyla silindi.");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Rezervasyon silinemedi:", error.message);
      Alert.alert("Hata", "Rezervasyon silinirken bir hata oluştu.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rezervasyonlarım</Text>
          {user && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{reservations.length}</Text>
                <Text style={styles.statLabel}>Toplam</Text>
              </View>
            </View>
          )}
        </View>

        {!user ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Giriş Yapın</Text>
            <Text style={styles.emptySubText}>Rezervasyonlarınızı görmek için giriş yapın veya kayıt olun</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.loginButton]} 
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.buttonText}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.registerButton]}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : reservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz rezervasyon yok</Text>
            <Text style={styles.emptySubText}>Rezervasyon yaptığınızda burada görünecek</Text>
          </View>
        ) : (
          <View style={styles.reservationList}>
            {reservations.map((reservation) => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.hotelName}>{reservation.hotelName}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteReservation(reservation.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF5252" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>
                      {new Date(reservation.checkIn).toLocaleDateString('tr-TR')} - {new Date(reservation.checkOut).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{reservation.guestCount} Misafir</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{reservation.totalPrice}₺</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
    padding: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  reservationList: {
    padding: 20,
  },
  reservationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: 'gray',
  },
  registerButton: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReservationHistory;

