import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../services/firebase";

type Reservation = {
  id: string;
  hotelName: string;
  roomName: string;
  createdAt: any;
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
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
      }
    };

    fetchReservations();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rezervasyon Geçmişi</Text>
      {reservations.length === 0 ? (
        <Text style={styles.empty}>Henüz rezervasyon yok.</Text>
      ) : (
        reservations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.name}>{item.hotelName} - {item.roomName}</Text>
            <Text style={styles.date}>Tarih: {item.createdAt?.toDate().toLocaleString()}</Text>
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
});

export default ReservationHistory;

