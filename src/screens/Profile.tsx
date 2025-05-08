import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView } from "react-native";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const Profile = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const user = auth.currentUser;
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="person-circle-outline" size={100} color="#2E7D32" />
            <Text style={styles.title}>Profil</Text>
          </View>
          <Text style={styles.message}>
            Rezervasyon yapmak ve favorilerinizi kaydetmek için giriş yapın.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={navigateToLogin}>
              <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={navigateToRegister}>
              <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const initials = userData ? `${userData.firstName?.[0]}${userData.lastName?.[0]}` : "KU";
  const fullName = userData ? `${userData.firstName} ${userData.lastName}` : "Kullanıcı";
  const avatarUri = `https://api.dicebear.com/6.x/initials/png?seed=${initials}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text style={styles.name}>{fullName}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>E-posta:</Text>
          <Text style={styles.info}>{user.email}</Text>
        </View>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  infoContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  info: {
    fontSize: 18,
    color: "#222",
    fontWeight: "500",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "80%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: "gray",
  },
  registerButton: {
    backgroundColor: "#2E7D32",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutIcon: {
    marginRight: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default Profile;
