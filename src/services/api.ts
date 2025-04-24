// services/api.ts

import { Hotel } from "../types/Hotel";

const BASE_URL = "https://68067bb5e81df7060eb74d1e.mockapi.io";

/**
 
 * @returns 
 */
export const fetchHotels = async (): Promise<Hotel[]> => {
  try {
    const response = await fetch(`${BASE_URL}/hotels`);
    if (!response.ok) {
      throw new Error("Oteller alınamadı");
    }
    const data: Hotel[] = await response.json();
    return data;
  } catch (error) {
    console.error("API Hatası:", error);
    throw error;
  }
};
