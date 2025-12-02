import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DatabaseService from "../database/DatabaseService";

export default function PantallaNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = async () => {
    try {
      const userId = DatabaseService.getCurrentUserId();
      if (!userId) {
        Alert.alert("Error", "No hay usuario autenticado");
        return;
      }

      // Traemos incidencias del usuario actual
      const data = await DatabaseService.getIncidenciasByUser(userId);

      // Convertimos cada incidencia en una notificación
      const lista = data.map((item) => ({
        id: item.id.toString(),
        titulo: item.titulo,
        fecha: item.fecha,
        estado: item.estado,
        mensaje: `Se ha creado un nuevo reporte: "${item.titulo}"`,
      }));

      setNotificaciones(lista);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      Alert.alert("Error", "No se pudieron cargar las notificaciones");
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="notifications" size={24} color="#b91c1c" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{item.mensaje}</Text>
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
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Notificaciones</Text>

      {notificaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay notificaciones nuevas</Text>
          <Text style={styles.emptySubtext}>
            Cuando crees un reporte, aparecerá aquí como notificación
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
  item: {
    flexDirection: "row",
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
  iconContainer: {
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: "gray",
    marginBottom: 6,
  },
  itemEstado: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: "flex-start",
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
});