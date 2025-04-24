import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
      Alert.alert(
        "Çıkış Yap",
        "Çıkış yapmak istediğinizden emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Çıkış Yap",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut(auth);
               
              } catch (error: any) {
                console.error("Çıkış hatası:", error);
                Alert.alert(
                  "Hata",
                  "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin."
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Çıkış işlemi hatası:", error);
      Alert.alert(
        "Hata",
        "Çıkış işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.message}>
          Rezervasyon yapmak ve favorilerinizi kaydetmek için giriş yapın.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={navigateToLogin}
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={navigateToRegister}
          >
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.label}>E-posta:</Text>
      <Text style={styles.info}>{user.email}</Text>
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    marginTop: 60,
    flex: 1,
    backgroundColor: "#fff"
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16 
  },
  label: { 
    fontSize: 16, 
    color: "#555" 
  },
  info: {
    fontSize: 18,
    marginBottom: 20,
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
    gap: 12,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#007AFF",
  },
  registerButton: {
    backgroundColor: "#34C759",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Profile;
