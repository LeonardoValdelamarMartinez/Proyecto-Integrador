import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import DatabaseService from "../database/DatabaseService";

export default function DetalleIncidenciaScreen({ route, navigation }) {
  const { incidencia } = route.params; // viene desde la lista
  const [estado, setEstado] = useState(incidencia.estado);

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await DatabaseService.updateReporteEstado(incidencia.id, nuevoEstado);
      setEstado(nuevoEstado);

      Alert.alert("Éxito", "El estado fue actualizado");

      // Regresamos a la lista y refrescamos
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detalle de Incidencia</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Categoría:</Text>
        <Text style={styles.value}>{incidencia.categoria}</Text>

        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.value}>{incidencia.descripcion}</Text>

        <Text style={styles.label}>Ubicación:</Text>
        <Text style={styles.value}>{incidencia.ubicacion}</Text>

        <Text style={styles.label}>Fecha:</Text>
        <Text style={styles.value}>{incidencia.fecha}</Text>

        <Text style={styles.label}>Estado actual:</Text>
        <Text style={styles.estado}>{estado}</Text>
      </View>

      <Text style={styles.subtitle}>Cambiar Estado</Text>
      <View style={styles.buttons}>
        {["pendiente", "proceso", "resuelto"].map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.btn, estado === e && styles.btnActivo]}
            onPress={() => cambiarEstado(e)}
          >
            <Text style={styles.btnText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#f3f4f6", 
        padding: 20, 
    },
    header: { 
        fontSize: 24, 
        fontWeight: "bold", 
        marginBottom: 20, 
        textAlign: "center", 
        color: "#B00020", 
    },
    card: { 
        backgroundColor: "white", 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20, 
    },
    label: { 
        fontSize: 14, 
        fontWeight: "bold", 
        marginTop: 10, 
    },
    value: { 
        fontSize: 14, 
        color: "#333" },
    estado: { 
        fontSize: 16, 
        fontWeight: "bold", 
        marginTop: 10, 
        color: "#2563eb", 
    },
    subtitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        marginBottom: 10, 
    },
    buttons: { 
        flexDirection: "row", 
        justifyContent: "space-around", 
    },
    btn: { 
        backgroundColor: "#e5e7eb", 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderRadius: 8, 
    },
    btnActivo: { 
        backgroundColor: "#2563eb", 
    },
    btnText: { 
        color: "#fff", 
        fontWeight: "bold", 
    },
});