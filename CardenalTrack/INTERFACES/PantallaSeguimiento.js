// screens/PantallaSeguimiento.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import DatabaseService from "../database/DatabaseService";

export default function PantallaSeguimiento() {
  const [incidencias, setIncidencias] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const cargarIncidencias = async () => {
    const userId = DatabaseService.getCurrentUserId();
    if (!userId) return;

    const data = await DatabaseService.getIncidenciasByUser(userId);
    setIncidencias(data);
  };

  const agregarIncidencia = async () => {
    if (!titulo || !descripcion) return;

    const userId = DatabaseService.getCurrentUserId();
    await DatabaseService.crearIncidencia(userId, titulo, descripcion);

    setTitulo("");
    setDescripcion("");

    cargarIncidencias();
  };

  useEffect(() => {
    cargarIncidencias();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reporte de Incidencias</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Título de la incidencia"
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          placeholder="Descripción"
          style={styles.inputLarge}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <TouchableOpacity style={styles.btn} onPress={agregarIncidencia}>
          <Text style={styles.btnText}>Agregar Incidencia</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Historial</Text>

      <FlatList
        data={incidencias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.titulo}</Text>
            <Text style={styles.itemDesc}>{item.descripcion}</Text>
            <Text style={styles.itemDate}>{item.fecha}</Text>
            <Text style={styles.itemEstado}>Estado: {item.estado}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 20, marginTop: 20, marginBottom: 10 },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    elevation: 4,
  },

  input: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputLarge: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    height: 80,
  },

  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  item: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDesc: {
    fontSize: 14,
    marginVertical: 5,
  },
  itemDate: {
    fontSize: 12,
    color: "gray",
  },
  itemEstado: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
});
