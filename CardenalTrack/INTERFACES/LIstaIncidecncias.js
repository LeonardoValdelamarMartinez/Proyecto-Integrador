import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import DatabaseService from '../database/DatabaseService';

export default function MisReportesScreen() {
  const [reportes, setReportes] = useState([]);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    cargarReportes();
  }, [filtro]);

  const cargarReportes = async () => {
    try {
      const data = await DatabaseService.getAllReportes(); 

      if (filtro === 'Todos') {
        setReportes(data);
      } else {
        setReportes(data.filter(r => r.estado === filtro));
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los reportes");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.detalle}>Sector: {item.sector}</Text>
      <Text style={styles.detalle}>Fecha: {item.fecha}</Text>
      <Text style={styles.estado}>Estado: {item.estado}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mis Reportes</Text>

      <View style={styles.tabs}>
        {['Todos', 'Pendientes', 'En Proceso', 'Resueltos'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filtro === tab && styles.tabActivo]}
            onPress={() => setFiltro(tab)}
          >
            <Text style={[styles.tabText, filtro === tab && styles.tabTextActivo]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reportes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

    </SafeAreaView>
  );
}

const COLOR_PRIMARY = '#B00020';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },
  tabActivo: {
    backgroundColor: COLOR_PRIMARY,
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  tabTextActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
  },
  detalle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  estado: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
    fontStyle: 'italic',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: COLOR_PRIMARY,
  },
});
