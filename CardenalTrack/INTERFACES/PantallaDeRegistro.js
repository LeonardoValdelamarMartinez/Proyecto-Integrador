import React, { useState } from "react";
import {Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Image} from "react-native";

import DatabaseService from "../database/DatabaseService";

const Logo = require("../assets/LogoCardenal.png");

export default function Registro({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const validar = () => {
    if (!fullName || !email || !username || !password || !confirm) {
      Alert.alert("Campos incompletos");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Correo inválido");
      return false;
    }
    if (password !== confirm) {
      Alert.alert("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const onRegister = async () => {
    if (!validar()) return;

    try {
      await DatabaseService.registerUser(
        fullName.trim(),
        email.trim(),
        username.trim(),
        password.trim()
      );

      Alert.alert("Cuenta creada", "Tu cuenta ha sido registrada.", [
        { text: "OK", onPress: () => navigation.replace("InicioSesion") },
      ]);
    } catch (err) {
      if (err.message === "Datos duplicados") {
        Alert.alert("Error", "El correo o usuario ya existen");
      } else {
        Alert.alert("Error", "No se pudo crear la cuenta");
      }
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={Logo} style={styles.logo} />

        <Text style={styles.title}>Crear Cuenta</Text>

        {/* NOMBRE COMPLETO */}
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          keyboardType="default"   
          autoCapitalize="words"
        />

        {/* CORREO */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"   
          autoCapitalize="none"
        />

        {/* USUARIO */}
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          keyboardType="default"
          autoCapitalize="none"     
        />

        {/* CONTRASEÑA */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          keyboardType="default"    
        />

        {/* CONFIRMAR CONTRASEÑA */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          keyboardType="default"
        />

        {/* BOTÓN */}
        <TouchableOpacity style={styles.primaryBtn} onPress={onRegister}>
          <Text style={styles.primaryText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 1, alignItems: "center", padding: 28 },
  logo: { width: 110, height: 110, marginBottom: 10 },
  title: { fontSize: 30, fontWeight: "bold", color: "#BD0A0A" },
  label: { width: "100%", marginTop: 16, fontWeight: "600" },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
  },
  primaryBtn: {
    width: "60%",
    backgroundColor: "#BD0A0A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  linkText: { marginTop: 16, color: "#BD0A0A", textDecorationLine: "underline" },
});
