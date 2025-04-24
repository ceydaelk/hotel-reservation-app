// src/context/FavoritesContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, getDocs, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";

interface FavoritesContextType {
  favoriteHotelIds: string[];
  refreshFavorites: () => void;
  addToFavorites: (hotelId: string) => Promise<void>;
  removeFromFavorites: (hotelId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteHotelIds: [],
  refreshFavorites: () => {},
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteHotelIds, setFavoriteHotelIds] = useState<string[]>([]);

  const fetchFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setFavoriteHotelIds([]);
        return;
      }

      const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const ids = snapshot.docs.map(doc => doc.data().hotelId);
      setFavoriteHotelIds(ids);
    } catch (error) {
      console.error("Favoriler alınamadı:", error);
      setFavoriteHotelIds([]);
    }
  };

  const addToFavorites = async (hotelId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Kullanıcı giriş yapmamış");

      // Önce favori zaten ekli mi kontrol et
      if (favoriteHotelIds.includes(hotelId)) {
        return;
      }

      // Firestore'a ekle
      await addDoc(collection(db, "favorites"), {
        userId: user.uid,
        hotelId,
        createdAt: new Date()
      });

      // State'i güncelle
      setFavoriteHotelIds(prev => [...prev, hotelId]);
    } catch (error) {
      console.error("Favori eklenemedi:", error);
      throw error;
    }
  };

  const removeFromFavorites = async (hotelId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Kullanıcı giriş yapmamış");

      // Firestore'dan sil
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", user.uid),
        where("hotelId", "==", hotelId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, "favorites", snapshot.docs[0].id));
        // State'i güncelle
        setFavoriteHotelIds(prev => prev.filter(id => id !== hotelId));
      }
    } catch (error) {
      console.error("Favori silinemedi:", error);
      throw error;
    }
  };

  // Kullanıcı değiştiğinde favorileri yeniden yükle
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchFavorites();
      } else {
        setFavoriteHotelIds([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Favoriler koleksiyonunu dinle
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.data().hotelId);
      setFavoriteHotelIds(ids);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FavoritesContext.Provider 
      value={{ 
        favoriteHotelIds, 
        refreshFavorites: fetchFavorites,
        addToFavorites,
        removeFromFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};