import { Hotel } from "../types/Hotel";
import { Room } from "../types/Room";

export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  HotelDetails: { hotel: Hotel };
  RoomSelection: { hotel: Hotel };
  Reservation: { hotel: Hotel; room: Room }; 
  ReservationHistory: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;


};

  