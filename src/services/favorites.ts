import { db, auth } from "./firebase";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";

export const addToFavorites = async (hotelId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  await addDoc(collection(db, "favorites"), {
    userId,
    hotelId,
    createdAt: new Date()
  });
};

export const removeFromFavorites = async (hotelId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const q = query(
    collection(db, "favorites"),
    where("userId", "==", userId),
    where("hotelId", "==", hotelId)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    deleteDoc(doc(db, "favorites", docSnap.id));
  });
};

export const getFavoriteHotelIds = async (): Promise<string[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(collection(db, "favorites"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().hotelId);
};
