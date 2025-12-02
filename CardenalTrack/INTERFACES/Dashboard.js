import React from 'react';
import {StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import DatabaseService from '../database/DatabaseService';

export default function Dashboard({ navigation }) {
  
  const handleReportarIncidencia = () => {
    navigation.navigate('Seguimiento');
  };

  const handleMisReportes = () => {
    navigation.navigate('MisReportes');
  };

  const handleSeguimiento = () => {
    navigation.navigate('Seguimiento');
  };

  const handlePerfil = () => {
    navigation.navigate('Perfil');
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'InicioSesion' }],
              });
            } catch (error) {
              console.error('Error en logout:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="dove" size={24} color="white" />
          <Ionicons name="settings-outline" size={18} color="white" style={{ position: 'absolute', bottom: -2, right: -5 }} />
        </View>
        <Text style={styles.headerText}>CardenalTrak</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Dashboard Principal</Text>

        <MenuCard 
          title="Reportar incidencia"
          subtitle="Registra nuevos problemas de seguridad"
          icon="warning"
          iconColor="#dc2626"
          bgColor="#fee2e2"
          onPress={handleReportarIncidencia}
        />

        <MenuCard 
          title="Mis reportes"
          subtitle="Consulta el estado de tus reportes"
          icon="assignment"
          iconColor="#b91c1c"
          bgColor="#fee2e2"
          onPress={handleMisReportes}
        />

        <MenuCard 
          title="Seguimiento"
          subtitle="Monitorea incidentes en tu zona"
          icon="search"
          iconColor="#b91c1c"
          bgColor="#fee2e2"
          onPress={handleSeguimiento}
        />

        <MenuCard 
          title="Notificaciones"
          subtitle="Actualizaciones y alertas importantes"
          icon="notifications-none"
          iconColor="#b91c1c"
          bgColor="#fee2e2"
          onPress={() => navigation.navigate("PantallaNotificaciones")}
        />

        <MenuCard 
          title="Mi Perfil"
          subtitle="Gestiona tu información personal"
          icon="person-outline"
          iconColor="#b91c1c"
          bgColor="#fee2e2"
          onPress={handlePerfil}
        />

        <MenuCard 
          title="Cerrar Sesión"
          subtitle="Salir de tu cuenta"
          icon="exit-to-app"
          iconColor="#b91c1c"
          bgColor="#fee2e2"
          onPress={handleCerrarSesion}
        />

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estadísticas recientes</Text>
          <View style={styles.chartContainer}>
            <ChartBar height={40} tealHeight={20} />
            <ChartBar height={20} tealHeight={20} />
            <ChartBar height={60} tealHeight={25} />
            <ChartBar height={50} tealHeight={10} />
            <ChartBar height={80} tealHeight={15} />
            <ChartBar height={25} tealHeight={10} />
            <ChartBar height={30} tealHeight={20} />
            <ChartBar height={85} tealHeight={12} />
          </View>
          <View style={styles.chartBaseLine} />
        </View>

        <View style={{ height: 40 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuCard = ({ title, subtitle, icon, iconColor, bgColor, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
    </View>
  </TouchableOpacity>
);

const ChartBar = ({ height, tealHeight }) => (
  <View style={styles.barColumn}>
    <View style={[styles.barTop, { height: height, backgroundColor: '#b91c1c' }]} />
    <View style={[styles.barBottom, { height: tealHeight, backgroundColor: '#0d9488' }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  header: {
    backgroundColor: '#B91C1C', 
    paddingTop: 40, 
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    marginRight: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#B91C1C',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 10,
  },
  barColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: 20, 
  },
  barTop: {
    width: '100%',
    marginBottom: 2, 
  },
  barBottom: {
    width: '100%',
  },
  chartBaseLine: {
    height: 2,
    backgroundColor: '#374151',
    marginTop: 0,
    width: '100%',
  },
});