import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import DatabaseService from '../database/DatabaseService';

export default function InicioDeSesion({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setCargando(true);
      
      if (!correo.includes('@')) {
        Alert.alert('Error', 'Por favor ingresa un correo válido');
        setCargando(false);
        return;
      }

      const usuario = await DatabaseService.getUserEmailPassword(correo, contrasena);
      
      if (usuario) {
        DatabaseService.setCurrentUser(usuario);
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', 'Correo o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Ocurrió un problema al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/LogoCardenal.png')}
                style={styles.logo}
              />
              <Text style={styles.appName}>CardenalTrak</Text>
              <Text style={styles.tagline}>
                Reporta, limpia y mejora tu espacio universitario
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.subtitle}>
                Ingresa con tu correo institucional
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Correo Institucional</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@universidad.edu.mx"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={correo}
                  onChangeText={setCorreo}
                  editable={!cargando}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={contrasena}
                  onChangeText={setContrasena}
                  editable={!cargando}
                />
              </View>

              <TouchableOpacity 
                onPress={() => navigation.navigate("RecuperarContraseña")}
                disabled={cargando}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, cargando && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={cargando}
              >
                <Text style={styles.buttonText}>
                  {cargando ? 'Cargando...' : 'Ingresar'}
                </Text>
              </TouchableOpacity>

              <View style={styles.separatorContainer}>
                <View style={styles.line} />
                <Text style={styles.separatorText}>o</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Registro")}
                  disabled={cargando}
                >
                  <Text style={styles.registerLink}>Regístrate aquí</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Esta aplicación es exclusiva para la comunidad universitaria.
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © 2024 CardenalTrak - Sistema de Reportes Universitarios
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  formGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    fontSize: 15,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPassword: {
    color: '#B71C1C',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#B71C1C',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#D32F2F',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  separatorText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#333',
    fontSize: 15,
  },
  registerLink: {
    color: '#B71C1C',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    marginTop: 30,
    padding: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});