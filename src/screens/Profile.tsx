import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { doc, getDoc } from "firebase/firestore";

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const Profile = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const user = auth.currentUser;
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        console.log("AUTH UID:", user.uid); 
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("USER DATA:", docSnap.data()); 
          setUserData(docSnap.data());
        } else {
          console.log("Kullanıcı Firestore'da bulunamadı!");
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace("Login");
          } catch (error: any) {
            console.error("Çıkış hatası:", error);
            Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
          }
        },
      },
    ]);
  };

  const navigateToLogin = () => navigation.navigate("Login");
  const navigateToRegister = () => navigation.navigate("Register");

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.message}>
          Rezervasyon yapmak ve favorilerinizi kaydetmek için giriş yapın.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={navigateToLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={navigateToRegister}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.info}>Yükleniyor...</Text>
      </View>
    );
  }
  

const initials = userData ? `${userData.firstName?.[0]}${userData.lastName?.[0]}` : "KU";
const fullName = userData ? `${userData.firstName} ${userData.lastName}` : "Kullanıcı";
  const avatarUri = `https://api.dicebear.com/6.x/initials/png?seed=${initials}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.label}>E-posta:</Text>
      <Text style={styles.info}>{user.email}</Text>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 60, flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  label: { fontSize: 16, color: "#555" },
  info: { fontSize: 18, marginBottom: 20, color: "#222", fontWeight: "500" },
  message: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 30, lineHeight: 24 },
  buttonContainer: { gap: 12 },
  button: { padding: 15, borderRadius: 8, alignItems: "center" },
  loginButton: { backgroundColor: "#007AFF" },
  registerButton: { backgroundColor: "#34C759" },
  logoutButton: { backgroundColor: "#FF3B30", marginTop: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default Profile;
