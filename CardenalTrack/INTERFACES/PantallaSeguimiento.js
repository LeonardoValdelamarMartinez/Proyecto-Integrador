import React, { useEffect, useState } from "react";
import {View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView} from "react-native";
import DatabaseService from "../database/DatabaseService";

export default function PantallaSeguimiento({ navigation }) {
  const [incidencias, setIncidencias] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const cargarIncidencias = async () => {
    try {
      const userId = DatabaseService.getCurrentUserId();
      if (!userId) {
        Alert.alert("Error", "No hay usuario autenticado");
        return;
      }

      const data = await DatabaseService.getIncidenciasByUser(userId);
      setIncidencias(data);
    } catch (error) {
      console.error("Error al cargar incidencias:", error);
      Alert.alert("Error", "No se pudieron cargar las incidencias");
    }
  };

  const agregarIncidencia = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      const userId = DatabaseService.getCurrentUserId();
      if (!userId) {
        Alert.alert("Error", "No hay usuario autenticado");
        return;
      }

      await DatabaseService.crearIncidencia(userId, titulo, descripcion);

      Alert.alert(
        "¡Éxito!", 
        "Incidencia reportada correctamente",
        [
          { 
            text: "Ver mis reportes", 
            onPress: () => navigation.navigate('MisReportes') 
          },
          { 
            text: "Continuar", 
            style: "cancel" 
          }
        ]
      );

      // Limpiar campos
      setTitulo("");
      setDescripcion("");

      // Recargar lista
      cargarIncidencias();
    } catch (error) {
      console.error("Error al crear incidencia:", error);
      Alert.alert("Error", "No se pudo crear la incidencia");
    }
  };

  useEffect(() => {
    cargarIncidencias();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reporte de Incidencias</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Título de la incidencia</Text>
        <TextInput
          placeholder="Ej: Fuga de agua en baño"
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          placeholder="Describe el problema en detalle..."
          style={styles.inputLarge}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.btn} onPress={agregarIncidencia}>
          <Text style={styles.btnText}>Reportar Incidencia</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Historial de Reportes</Text>

      {incidencias.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay reportes registrados</Text>
          <Text style={styles.emptySubtext}>
            Crea tu primer reporte usando el formulario arriba
          </Text>
        </View>
      ) : (
        <FlatList
          data={incidencias}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.titulo}</Text>
              <Text style={styles.itemDesc}>{item.descripcion}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.itemDate}>{item.fecha}</Text>
                <Text style={[
                  styles.itemEstado,
                  item.estado === 'Resueltos' && styles.estadoResuelto,
                  item.estado === 'En Proceso' && styles.estadoProceso,
                  item.estado === 'Pendientes' && styles.estadoPendiente
                ]}>
                  {item.estado}
                </Text>
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f3f4f6", 
    padding: 20 
  },
  header: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#B91C1C",
    marginBottom: 20,
    textAlign: "center"
  },
  subtitle: { 
    fontSize: 20, 
    marginTop: 30, 
    marginBottom: 15,
    color: "#333",
    fontWeight: "600"
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  inputLarge: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
  },
  btn: {
    backgroundColor: "#B91C1C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  item: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemDesc: {
    fontSize: 14,
    color: "#666",
    marginVertical: 8,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  itemDate: {
    fontSize: 12,
    color: "gray",
  },
  itemEstado: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  estadoResuelto: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  estadoProceso: {
    backgroundColor: "#cce5ff",
    color: "#004085",
  },
  estadoPendiente: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
});