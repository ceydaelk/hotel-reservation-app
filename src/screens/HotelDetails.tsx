import React from "react";
import { View, Text, Image, StyleSheet, Button, ScrollView, Dimensions, SafeAreaView } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

type HotelDetailsRouteProp = RouteProp<RootStackParamList, "HotelDetails">;
type HotelDetailsNavProp = NativeStackNavigationProp<RootStackParamList, "HotelDetails">;

const HotelDetails = () => {
  const route = useRoute<HotelDetailsRouteProp>();
  const navigation = useNavigation<HotelDetailsNavProp>();
  const { hotel } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Image source={{ uri: hotel.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{hotel.location}</Text>
          </View>
          
          <Text style={styles.description}>{hotel.description}</Text>
          
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Konum</Text>
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: hotel.latitude || 41.0082,
                  longitude: hotel.longitude || 28.9784,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: hotel.latitude || 41.0082,
                    longitude: hotel.longitude || 28.9784,
                  }}
                  title={hotel.name}
                  description={hotel.location}
                />
              </MapView>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Odaları Gör"
              onPress={() => navigation.navigate("RoomSelection", { hotel })}
            />
          </View>
        </View>
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
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 200,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default HotelDetails;



