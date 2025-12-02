// INTERFACES/InicioDeSesion.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import DatabaseService from "../database/DatabaseService";

export default function InicioDeSesion({ navigation }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  useEffect(() => {
    (async () => {
      await DatabaseService.initialize();
    })();
  }, []);

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert("Campos vacíos", "Por favor completa todos los campos.");
      return;
    }

    try {
      const emailLimpio = correo.trim().toLowerCase();

      const user = await DatabaseService.getUserEmailPassword(
        emailLimpio,
        contrasena.trim()
      );

      if (!user) {
        Alert.alert("Error", "Correo o contraseña incorrectos");
        return;
      }

      // Guardamos usuario actual para usarlo en el resto de la app
      DatabaseService.setCurrentUser(user);

      Alert.alert("Bienvenido", "Inicio de sesión exitoso", [
        {
          text: "OK",
          onPress: () => {
            // 👉 Mandar directo al Dashboard (ruta 'Home' en tu Stack)
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          },
        },
      ]);
    } catch (error) {
      console.log("Error validando login:", error);
      Alert.alert("Error", "No se pudo validar la cuenta.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y nombre app */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/LogoCardenal.png")}
          style={styles.logo}
        />
        <Text style={styles.appName}>CardenalTrak</Text>
      </View>

      {/* Tarjeta de login */}
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <Text style={styles.label}>Correo Institucional</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@ejemplo.edu.mx"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={correo}
          onChangeText={setCorreo}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={contrasena}
          onChangeText={setContrasena}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("RecuperarContraseña")}
        >
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>

      {/* Registro */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
          <Text style={styles.registerLink}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: { alignItems: "center", marginBottom: 10 },
  logo: { width: 50, height: 50, marginBottom: 5 },
  appName: { fontSize: 22, fontWeight: "bold", color: "#B71C1C" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B71C1C",
    marginBottom: 15,
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  forgotPassword: {
    color: "#B71C1C",
    fontSize: 13,
    textDecorationLine: "underline",
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#B71C1C",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registerContainer: { flexDirection: "row", marginTop: 20 },
  registerText: { color: "#333" },
  registerLink: { color: "#B71C1C", fontWeight: "bold" },
});
