import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { doc, setDoc } from "firebase/firestore";

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      console.log("Kullanıcı kaydı başlatılıyor...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Firebase Auth kaydı başarılı, UID:", userCredential.user.uid);
      
      
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      console.log("Kullanıcı profili güncellendi");

    
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");

     
      try {
        console.log("Firestore'a kullanıcı verisi kaydediliyor...");
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userData = {
          email: email,
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uid: userCredential.user.uid
        };
        
        await setDoc(userDocRef, userData, { merge: true });
        console.log("Firestore'a kullanıcı verisi başarıyla kaydedildi");
        
        navigation.replace("Main");
      } catch (firestoreError: any) {
        console.error("Firestore kayıt hatası:", JSON.stringify(firestoreError));
        Alert.alert(
          "Uyarı",
          "Hesabınız oluşturuldu ancak profil bilgileriniz kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
        navigation.replace("Main");
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: "https://images.pexels.com/photos/24877163/pexels-photo-24877163/free-photo-of-restoran-gun-dogumu-safak-fotografcilik.jpeg" }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Kayıt Ol</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginText}>Zaten hesabınız var mı? Giriş yapın</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  formContainer: {
    padding: 20,
    width: "90%",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 25,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 15,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  registerButton: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loginButton: {
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default Register;

