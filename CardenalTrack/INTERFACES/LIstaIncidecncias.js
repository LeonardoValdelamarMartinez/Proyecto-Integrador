import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const reportes = [
  {
    id: '1',
    titulo: 'Fuga de agua en baño',
    sector: 'Edificio A, Piso 2',
    fecha: '15/10/2025',
  },
  {
    id: '2',
    titulo: 'Falla eléctrica',
    sector: 'Laboratorio C',
    fecha: '18/10/2025',
  },
  {
    id: '3',
    titulo: 'Puerta trabada',
    sector: 'Biblioteca',
    fecha: '10/10/2025',
  },
  {
    id: '4',
    titulo: 'Aire acondicionado averiado',
    sector: 'Aula 304',
    fecha: '20/10/2025',
  },
  {
    id: '5',
    titulo: 'Problemas de conectividad',
    sector: 'Sala de profesores',
    fecha: '22/10/2025',
  },
];

export default function MisReportesScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.detalle}>Sector: {item.sector}</Text>
      <Text style={styles.detalle}>Fecha: {item.fecha}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mis Reportes</Text>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Todos</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Pendientes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>En Proceso</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Resueltos</Text></TouchableOpacity>
      </View>

      <FlatList
        data={reportes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navText}>Inicio</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navText}>Reportes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navText}>Seguimiento</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Text style={styles.navText}>Perfil</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B00020',
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
  tabText: {
    fontSize: 14,
    color: '#333',
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
    color: '#B00020',
  },
  detalle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
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
    color: '#B00020',
  },
});