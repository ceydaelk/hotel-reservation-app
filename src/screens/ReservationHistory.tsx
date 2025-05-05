import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";

type Reservation = {
  id: string;
  hotelName: string;
  roomName: string;
  createdAt: any;
  roomImage?: string;
  price: number;
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

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
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reservations.length}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>
        </View>

        {reservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz rezervasyon yok</Text>
            <Text style={styles.emptySubText}>Rezervasyon yaptığınızda burada görünecek</Text>
          </View>
        ) : (
          <View style={styles.reservationList}>
            {reservations.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.hotelInfo}>
                    <Text style={styles.hotelName}>{item.hotelName}</Text>
                    <Text style={styles.roomName}>{item.roomName}</Text>
                    <Text style={styles.price}>{item.guestCount} person</Text>
                    <Text style={styles.price}>Price: {item.totalPrice} ₺</Text>
                    
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReservation(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>
                      {formatDate(item.createdAt?.toDate())}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Onaylandı</Text>
                    </View>
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
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  card: {
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
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  roomName: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  price: {
    
  }
});

export default ReservationHistory;

