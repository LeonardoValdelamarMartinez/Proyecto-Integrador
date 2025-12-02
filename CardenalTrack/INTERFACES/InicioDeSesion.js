import React, { useState, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";

import DatabaseService from "../database/DatabaseService";

const Logo = require("../assets/LogoCardenal.png");

export default function InicioSesion({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    DatabaseService.initialize();
  }, []);

  const onContinue = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campo vacío", "Ingresa tu correo y contraseña.");
      return;
    }

    try {
      const user = await DatabaseService.getUserEmailPassword(
        email.trim(),
        password.trim()
      );

      if (!user) {
        Alert.alert("Error", "Correo o contraseña incorrectos");
        return;
      }

      DatabaseService.setCurrentUser(user);
      navigation.replace("MainTabs");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo validar tu cuenta.");
    }
  };

  const goRecuperar = () => {
    navigation.navigate("RecuperarContraseña");
  };

  const goRegistro = () => {
    navigation.navigate("Registro");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* LOGO */}
        <Image source={Logo} style={styles.logo} />

        <Text style={styles.title}>CardenalTrak</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {/* CORREO */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@dominio.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* CONTRASEÑA */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="*************"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* BOTÓN INICIAR SESIÓN */}
        <TouchableOpacity style={styles.primaryBtn} onPress={onContinue}>
          <Text style={styles.primaryText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* OPCIÓN PARA RECUPERAR CONTRASEÑA */}
        <TouchableOpacity onPress={goRecuperar}>
          <Text style={styles.recoverText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* REGISTRO */}
        <TouchableOpacity style={styles.secondaryBtn} onPress={goRegistro}>
          <Text style={styles.secondaryText}>Crear una cuenta</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    justifyContent: "center",
  },

  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    color: "#BD0A0A",
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },

  label: {
    width: "100%",
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    fontSize: 15,
  },

  primaryBtn: {
    width: "60%",
    backgroundColor: "#BD0A0A",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 26,
  },

  primaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  recoverText: {
    marginTop: 14,
    color: "#BD0A0A",
    fontSize: 15,
    textDecorationLine: "underline",
  },

  secondaryBtn: {
    width: "60%",
    backgroundColor: "#F4DDDD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },

  secondaryText: {
    color: "#BD0A0A",
    fontSize: 18,
    fontWeight: "600",
  },
});
