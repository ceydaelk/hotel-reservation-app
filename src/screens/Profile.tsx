import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, ImageBackground } from "react-native";
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
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetched user data:", data); // Debug log
            setUserData(data);
          } else {
            console.log("No user document found!"); // Debug log
            // Eğer Firestore'da veri yoksa, displayName'i parçalayarak gösterelim
            if (user.displayName) {
              const [firstName, ...lastNameParts] = user.displayName.split(" ");
              const lastName = lastNameParts.join(" ");
              setUserData({
                firstName: firstName || "",
                lastName: lastName || "",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

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
      <ImageBackground
        source={{ uri: "https://images.pexels.com/photos/24877175/pexels-photo-24877175/free-photo-of-ucus-peyzaj-manzara-gokyuzu.jpeg" }}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
          <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            <View style={styles.header}>
              <Ionicons name="person-circle-outline" size={100} color="#fff" />
              <Text style={[styles.title, { color: '#fff' }]}>Profil</Text>
            </View>
            <Text style={[styles.message, { color: '#fff' }]}>
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
      </ImageBackground>
    );
  }

  const initials = userData ? `${userData.firstName?.[0]}${userData.lastName?.[0]}` : "KU";
  const fullName = userData ? `${userData.firstName} ${userData.lastName}` : "Kullanıcı";
  const avatarUri = `https://api.dicebear.com/6.x/initials/png?seed=${initials}`;

  return (
    <ImageBackground
      source={{ uri: "https://images.pexels.com/photos/24877175/pexels-photo-24877175/free-photo-of-ucus-peyzaj-manzara-gokyuzu.jpeg" }}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
          <View style={styles.header}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <Text style={[styles.name, { color: '#fff' }]}>
              {userData?.firstName} {userData?.lastName}
            </Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <View style={styles.menuContainer}>
            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={22} color="#fff" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Profil Bilgileri</Text>
                <Text style={styles.menuSubtitle}>{userData?.firstName} {userData?.lastName}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate("ReservationHistory")}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="bookmark-outline" size={22} color="#fff" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Rezervasyonlarım</Text>
                <Text style={styles.menuSubtitle}>Tüm rezervasyonlarınızı görüntüleyin</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate("Favorites")}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="heart-outline" size={22} color="#fff" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Favorilerim</Text>
                <Text style={styles.menuSubtitle}>Favori otellerinizi görüntüleyin</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  message: {
    fontSize: 16,
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default Profile;
