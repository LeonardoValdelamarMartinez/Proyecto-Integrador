import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import DatabaseService from "../database/DatabaseService";

// Listado de categorías de incidencia
const CATEGORIAS = [
  "Mantenimiento",
  "Infraestructura",
  "Tecnología",
  "Seguridad",
  "Limpieza",
  "Material didáctico",
  "Servicios generales",
  "Electricidad",
  "Plomería",
  "Mobiliario",
  "Accesibilidad",
  "Otro",
];

// 12 lugares de ejemplo
const LUGARES = [
  "Edificio A",
  "Edificio B",
  "Laboratorio 1",
  "Laboratorio 2",
  "Biblioteca",
  "Cancha",
  "Dirección",
  "Coordinación",
  "Área Psicopedagógica",
  "Baños Hombres",
  "Baños Mujeres",
  "Estacionamiento",
];

// Componente reutilizable de desplegable
function Dropdown({ etiqueta, valorSeleccionado, onSelect, opciones }) {
  const [abierto, setAbierto] = useState(false);

  const handleSelect = (opcion) => {
    onSelect(opcion);
    setAbierto(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{etiqueta}</Text>

      {/* Campo desplegable */}
      <TouchableOpacity
        style={styles.dropdownInput}
        onPress={() => setAbierto(!abierto)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownText,
            !valorSeleccionado && { color: "#A0A0A0" },
          ]}
        >
          {valorSeleccionado || `Selecciona ${etiqueta.toLowerCase()}...`}
        </Text>
        <Text style={styles.dropdownArrow}>{abierto ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Lista de opciones */}
      {abierto && (
        <View style={styles.dropdownList}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
            {opciones.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                style={styles.dropdownItem}
                onPress={() => handleSelect(opcion)}
              >
                <Text style={styles.dropdownItemText}>{opcion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function NuevoReporteScreen({ navigation }) {
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  useEffect(() => {
    DatabaseService.initialize();
  }, []);

  const handleEnviar = async () => {
    if (!categoria || !ubicacion || !descripcion.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Selecciona una categoría, una ubicación y escribe una descripción."
      );
      return;
    }

    try {
      // Guardar reporte y obtener el objeto con su id
      const nuevoReporte = await DatabaseService.addReporteIncidencia({
        categoria,
        descripcion: descripcion.trim(),
        ubicacion,
        fecha: new Date().toISOString(),
        estado: "pendiente",
      });

      Alert.alert(
        "Reporte enviado",
        "Tu reporte ha sido registrado correctamente.",
        [
          {
            text: "OK",
            onPress: () => {
              // Limpiar campos
              setCategoria("");
              setDescripcion("");
              setUbicacion("");

              // Ir a la pantalla de confirmación pasando el id
              navigation.replace("PantallaConfirmación", {
                reportId: nuevoReporte.id,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error al guardar reporte:", error);
      Alert.alert(
        "Error",
        "No se pudo registrar el reporte. Verifica la conexión o inténtalo de nuevo."
      );
    }
  };

  const handleCancelar = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CardenalTrak</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Nuevo Reporte</Text>
        <Text style={styles.subtitle}>
          Completa la información para registrar una incidencia.
        </Text>

        {/* Desplegable de Categoría */}
        <Dropdown
          etiqueta="Categoría*"
          valorSeleccionado={categoria}
          onSelect={setCategoria}
          opciones={CATEGORIAS}
        />

        {/* Desplegable de Ubicación */}
        <Dropdown
          etiqueta="Ubicación*"
          valorSeleccionado={ubicacion}
          onSelect={setUbicacion}
          opciones={LUGARES}
        />

        {/* Descripción */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción de la incidencia*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe detalladamente lo sucedido..."
            placeholderTextColor="#A0A0A0"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Botones */}
        <TouchableOpacity style={styles.btnEnviar} onPress={handleEnviar}>
          <Text style={styles.btnEnviarText}>Enviar reporte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
          <Text style={styles.btnCancelarText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#BD0A0A",
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#BD0A0A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  // Estilos para el desplegable
  dropdownInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownArrow: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  btnEnviar: {
    backgroundColor: "#BD0A0A",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnEnviarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnCancelar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#BD0A0A",
    marginBottom: 20,
  },
  btnCancelarText: {
    color: "#BD0A0A",
    fontSize: 16,
    fontWeight: "bold",
  },
});
