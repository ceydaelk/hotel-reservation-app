import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
  const navigation = useNavigation<any>(); // 👈 Burayı 'any' yapıyoruz
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // 👇 Reset yerine replace daha güvenli burada
      navigation.replace("Main");
      
      // Alternatif olarak: navigation.reset(...) de olur ama yukarıdaki daha temiz
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

      <TextInput
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button title="Giriş Yap" onPress={handleLogin} />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        Hesabın yok mu? Kayıt ol
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  link: {
    marginTop: 16,
    color: "#007bff",
    textAlign: "center",
  },
});

export default Login;
