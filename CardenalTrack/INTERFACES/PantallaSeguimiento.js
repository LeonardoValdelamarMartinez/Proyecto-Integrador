// INTERFACES/PantallaSeguimiento.js
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatabaseService from "../database/DatabaseService";

const PRIMARY_RED = "#B00020";

export default function PantallaSeguimiento({ navigation }) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todos"); // todos | pendiente | en_proceso | resuelto

  const cargarReportes = useCallback(async () => {
    try {
      setError(null);
      const data = await DatabaseService.getAllReportes();
      setReportes(data || []);
    } catch (e) {
      console.log("Error cargando reportes de seguimiento:", e);
      setError("No se pudieron cargar las incidencias");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarReportes();
  };

  const filtrarLista = () => {
    if (filtro === "todos") return reportes;

    return (reportes || []).filter((r) => {
      const estado = (r.estado || "").toLowerCase();
      if (filtro === "pendiente") return estado.includes("pend");
      if (filtro === "en_proceso") return estado.includes("proce");
      if (filtro === "resuelto") return estado.includes("resuel");
      return true;
    });
  };

  const listaFiltrada = filtrarLista();

  const contarPorEstado = () => {
    let p = 0,
      e = 0,
      r = 0;
    reportes.forEach((rep) => {
      const estado = (rep.estado || "").toLowerCase();
      if (estado.includes("pend")) p++;
      else if (estado.includes("proce")) e++;
      else if (estado.includes("resuel")) r++;
    });
    return { pendiente: p, enProceso: e, resuelto: r };
  };

  const { pendiente, enProceso, resuelto } = contarPorEstado();

  const getBadgeStyle = (estado) => {
    const e = (estado || "").toLowerCase();
    if (e.includes("resuel"))
      return { backgroundColor: "#dcfce7", color: "#166534", label: "Resuelto" };
    if (e.includes("proce"))
      return { backgroundColor: "#fef9c3", color: "#854d0e", label: "En proceso" };
    if (e.includes("pend"))
      return { backgroundColor: "#fee2e2", color: "#991b1b", label: "Pendiente" };
    return { backgroundColor: "#e5e7eb", color: "#374151", label: estado || "N/A" };
  };

  const renderItem = ({ item }) => {
    const badge = getBadgeStyle(item.estado);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.titulo || "Incidencia sin título"}</Text>
          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>
          <Text style={styles.cardLabel}>Sector: </Text>
          {item.sector || "Sin sector"}
        </Text>

        <Text style={styles.cardDetail}>
          <Text style={styles.cardLabel}>Categoría: </Text>
          {item.categoria || item.tipo || "Sin categoría"}
        </Text>

        <Text style={styles.cardDetail}>
          <Text style={styles.cardLabel}>Fecha: </Text>
          {item.fecha || item.fecha_reporte || "Sin fecha"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header rojo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="search-outline" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Seguimiento de Incidencias</Text>
        </View>
      </View>

      {/* Resumen superior */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{reportes.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendientes</Text>
          <Text style={[styles.summaryValue, { color: "#b91c1c" }]}>{pendiente}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>En proceso</Text>
          <Text style={[styles.summaryValue, { color: "#ca8a04" }]}>{enProceso}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resueltas</Text>
          <Text style={[styles.summaryValue, { color: "#16a34a" }]}>{resuelto}</Text>
        </View>
      </View>

      {/* Filtros por estado */}
      <View style={styles.filterRow}>
        {[
          { key: "todos", label: "Todos" },
          { key: "pendiente", label: "Pendientes" },
          { key: "en_proceso", label: "En proceso" },
          { key: "resuelto", label: "Resueltos" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filtro === f.key && styles.filterChipActive]}
            onPress={() => setFiltro(f.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filtro === f.key && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de incidencias */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <FlatList
        data={listaFiltrada}
        keyExtractor={(item) => item.id?.toString() || String(item.rowid || Math.random())}
        renderItem={renderItem}
        contentContainerStyle={
          listaFiltrada.length === 0
            ? { flexGrow: 1, justifyContent: "center", alignItems: "center" }
            : { paddingHorizontal: 16, paddingBottom: 16 }
        }
        ListEmptyComponent={
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            No hay incidencias para mostrar.
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_RED]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 8,
    marginHorizontal: 3,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: PRIMARY_RED,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: PRIMARY_RED,
  },
  filterChipText: {
    fontSize: 12,
    color: "#374151",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardDetail: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 2,
  },
  cardLabel: {
    fontWeight: "600",
  },
});
