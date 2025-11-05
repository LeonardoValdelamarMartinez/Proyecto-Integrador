import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
const Cardenal = require('./assets/LogoCardenal.png');

export default function Pantalla_Inicial({ onBack }) {
  return (
    <View style={styles.container}>
      <Image source={Cardenal} style={styles.logo} />
      <Text style={styles.title}>CardenalTrak</Text>

      <Text style={styles.subtitle}>Reporta, limpia y mejora tu espacio</Text>
      <Text style={styles.subtitle}>
        Únete y contribuye a mantener los espacios limpios y seguros.
      </Text>

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>Registrarse</Text>
      </TouchableOpacity>

      {onBack && (
        <TouchableOpacity style={styles.back} onPress={onBack}>
          <Text>← Volver</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    color: '#BD0A0A',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 6,
    color: '#222',
  },
  primaryBtn: {
    backgroundColor: '#BD0A0A',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    width: '80%',
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondaryBtn: {
    backgroundColor: '#F4DDDD',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    width: '80%',
    alignItems: 'center',
  },
  secondaryText: { color: '#BD0A0A', fontSize: 18, fontWeight: '600' },
  back: { position: 'absolute', top: 40, left: 20 },
});
