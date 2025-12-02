import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import DatabaseService from '../database/DatabaseService';

export default function RecuperarContraseña({ navigation }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      Alert.alert("Error", "Por favor ingresa tu correo y la nueva contraseña");
      return;
    }

    try {
      const user = await DatabaseService.getUserByEmail(email);
      if (!user) {
        Alert.alert("Error", "No existe un usuario con ese correo");
        return;
      }

      const result = await DatabaseService.updateUserPasswordByEmail(email, newPassword);
      if (result) {
        Alert.alert("Éxito", "Tu contraseña ha sido actualizada correctamente");
        navigation.navigate("InicioSesion");
      } else {
        Alert.alert("Error", "No se pudo actualizar la contraseña");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo institucional y una nueva contraseña
      </Text>

      <Text style={styles.label}>Correo Institucional</Text>
      <TextInput
        style={styles.input}
        placeholder="usuario@ejemplo.edu.mx"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Nueva Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Actualizar contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("InicioSesion")}>
        <Text style={styles.link}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const COLOR_PRIMARY = '#BD0A0A';
const COLOR_INACTIVE = '#777';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLOR_INACTIVE,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLOR_PRIMARY,
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: COLOR_PRIMARY,
    textAlign: 'center',
    marginTop: 8,
  },
});