// INTERFACES/EstadisticasIncidencias.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatabaseService from "../database/DatabaseService";

const PRIMARY_RED = "#B00020";

// Colores asociados a cada estado (solo se mostrarán si hay incidencias)
const STATE_COLORS = {
  resuelto: "#16a34a",
  enProceso: "#facc15",
  pendiente: "#dc2626",
};

export default function EstadisticasIncidencias({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [reportes, setReportes] = useState([]);
  const [error, setError] = useState(null);

  // Estadísticas calculadas
  const [totalIncidencias, setTotalIncidencias] = useState(0);
  const [porcentajeResueltas, setPorcentajeResueltas] = useState(0);
  const [promedioDias, setPromedioDias] = useState(0);
  const [sectorMasActivo, setSectorMasActivo] = useState("-");

  // Estados fijos (pendiente, en proceso, resuelto)
  const [conteoEstados, setConteoEstados] = useState({
    pendiente: 0,
    enProceso: 0,
    resuelto: 0,
  });

  const [conteoTipos, setConteoTipos] = useState({}); // por categoría / tipo

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await DatabaseService.getAllReportes();
        const lista = data || [];
        setReportes(lista);

        // Total
        const total = lista.length;
        setTotalIncidencias(total);

        // Conteos
        let pendientes = 0;
        let enProceso = 0;
        let resueltas = 0;
        const tiposMap = {};
        const sectoresMap = {};

        let sumaDiasResueltas = 0;
        let numResueltasConFecha = 0;
        const hoy = new Date();

        lista.forEach((r) => {
          const estado = (r.estado || "").toLowerCase();

          if (estado.includes("pend")) pendientes++;
          else if (estado.includes("proce")) enProceso++;
          else if (estado.includes("resuel")) resueltas++;

          const tipo = r.categoria || r.tipo || "Otro";
          tiposMap[tipo] = (tiposMap[tipo] || 0) + 1;

          if (r.sector) {
            sectoresMap[r.sector] = (sectoresMap[r.sector] || 0) + 1;
          }

          if (estado.includes("resuel") && r.fecha) {
            const fechaR = new Date(r.fecha);
            if (!isNaN(fechaR)) {
              const diffMs = hoy - fechaR;
              const diffDias = diffMs / (1000 * 60 * 60 * 24);
              sumaDiasResueltas += diffDias;
              numResueltasConFecha++;
            }
          }
        });

        setConteoEstados({
          pendiente: pendientes,
          enProceso: enProceso,
          resuelto: resueltas,
        });

        setConteoTipos(tiposMap);

        const pctResueltas =
          total > 0 ? Math.round((resueltas * 100) / total) : 0;
        setPorcentajeResueltas(pctResueltas);

        let maxSector = "-";
        let maxValor = 0;
        Object.entries(sectoresMap).forEach(([sector, count]) => {
          if (count > maxValor) {
            maxValor = count;
            maxSector = sector;
          }
        });
        setSectorMasActivo(
          maxSector === "-" ? "-" : `${maxSector} (${maxValor} incidencias)`
        );

        const promedio =
          numResueltasConFecha > 0
            ? (sumaDiasResueltas / numResueltasConFecha).toFixed(1)
            : 0;
        setPromedioDias(promedio);
      } catch (e) {
        console.log("Error cargando estadísticas:", e);
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const getPct = (n) =>
    totalIncidencias > 0 ? Math.round((n * 100) / totalIncidencias) : 0;

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={PRIMARY_RED} />
        <Text style={{ marginTop: 10, color: "#4b5563" }}>
          Cargando estadísticas...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header rojo con logo y nombre */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>CardenalTrak</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Título y subtítulo */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Estadísticas de Incidencias</Text>
          <Text style={styles.subtitle}>
            Panel exclusivo para administradores
          </Text>
          {error && (
            <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {error}
            </Text>
          )}
        </View>

        {/* FILA 1: Total / Resueltas */}
        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Total Incidencias</Text>
            <Text style={styles.cardValueRed}>{totalIncidencias}</Text>
            <Text style={styles.cardSubNeutral}>
              Basado en la lista de reportes
            </Text>
          </View>

          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Resueltas</Text>
            <Text style={styles.cardValueGreen}>{porcentajeResueltas}%</Text>
            <Text style={styles.cardSubNeutral}>
              {conteoEstados.resuelto} de {totalIncidencias}
            </Text>
          </View>
        </View>

        {/* FILA 2: Tiempo promedio / Sector más activo */}
        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Tiempo Promedio</Text>
            <Text style={styles.cardValueRed}>{promedioDias} días</Text>
            <Text style={styles.cardSubNeutral}>
              Calculado sobre incidencias resueltas
            </Text>
          </View>

          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Sector Más Activo</Text>
            <Text style={styles.cardValueRed}>
              {sectorMasActivo === "-" ? "Sin datos" : sectorMasActivo}
            </Text>
            <Text style={styles.cardSubNeutral}>
              Sector con más incidencias
            </Text>
          </View>
        </View>

        {/* Incidencias por estado (círculo neutro + leyenda dinámica) */}
        <View style={styles.cardLarge}>
          <Text style={styles.cardTitle}>Incidencias por Estado</Text>
          <View style={styles.chartPieContainer}>
            {/* Círculo neutro, sin colores fijos */}
            <View style={styles.pieChart}>
              <Text style={styles.pieCenterText}>{totalIncidencias}</Text>
            </View>

            {/* Leyenda: solo se muestran estados que tengan incidencias */}
            <View style={styles.legend}>
              {["resuelto", "enProceso", "pendiente"].map((key) => {
                const count = conteoEstados[key];
                if (!count) return null; // si no hay incidencias en ese estado, no se muestra

                const label =
                  key === "resuelto"
                    ? "Resueltas"
                    : key === "enProceso"
                    ? "En proceso"
                    : "Pendientes";

                return (
                  <View key={key} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: STATE_COLORS[key] || "#9ca3af" },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      {label}: {count} ({getPct(count)}%)
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Incidencias por tipo (categoría) */}
        <View style={styles.cardLarge}>
          <Text style={styles.cardTitle}>Incidencias por Tipo</Text>

          {Object.keys(conteoTipos).length === 0 ? (
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              No hay datos de categorías/tipos.
            </Text>
          ) : (
            Object.entries(conteoTipos).map(([tipo, count]) => {
              const porcentaje = getPct(count);
              return (
                <View key={tipo} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {tipo} ({count}) - {porcentaje}%
                  </Text>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(porcentaje, 8)}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Botón para volver al dashboard principal */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backButtonText}>Volver al Dashboard Principal</Text>
        </TouchableOpacity>
      </ScrollView>
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
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff33",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  appName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titleBlock: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: PRIMARY_RED,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  cardValueRed: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_RED,
  },
  cardValueGreen: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },
  cardSubNeutral: {
    fontSize: 11,
    marginTop: 4,
    color: "#6b7280",
  },
  cardLarge: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  chartPieContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Círculo ahora neutro, sin slices de colores
  pieChart: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  pieCenterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_RED,
  },
  legend: {
    flex: 1,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#4b5563",
  },
  barRow: {
    marginTop: 8,
  },
  barLabel: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 4,
  },
  barBackground: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e5e7eb",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: PRIMARY_RED,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: PRIMARY_RED,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
