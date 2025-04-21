import React from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const Profile = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login"); 
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      {user ? (
        <>
          <Text style={styles.label}>E-posta:</Text>
          <Text style={styles.info}>{user.email}</Text>
          <Button title="Çıkış Yap" onPress={handleLogout} />
        </>
      ) : (
        <Text>Kullanıcı bulunamadı.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 16, color: "#555" },
  info: {
    fontSize: 18,
    marginBottom: 20,
    color: "#222",
    fontWeight: "500",
  },
});

export default Profile;
