import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

type Reservation = {
  id: string;
  hotelName: string;
  roomName: string;
  createdAt: any;
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = async () => {
    try {
      const q = query(
        collection(db, "reservations"),
        where("userId", "==", auth.currentUser?.uid),
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rezervasyon Geçmişi</Text>
      {reservations.length === 0 ? (
        <Text style={styles.empty}>Henüz rezervasyon yok.</Text>
      ) : (
        reservations.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.hotelName} - {item.roomName}</Text>
              <Text style={styles.date}>Tarih: {item.createdAt?.toDate().toLocaleString()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteReservation(item.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️ Sil</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
  card: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#ff3b30",
    fontWeight: "bold",
  },
});

export default ReservationHistory;

