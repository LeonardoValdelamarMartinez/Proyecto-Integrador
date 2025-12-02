// screens/ConfirmationScreen.js - VERSIÓN ACTUALIZADA CON BASE DE DATOS
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatabaseService from '../database/DatabaseService';

const ConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  // Obtener datos del reporte recién creado
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Obtener el reportId de los parámetros de navegación
        const { reportId } = route.params || {};
        
        if (reportId) {
          // Si tenemos un reportId, buscamos el reporte en la base de datos
          const report = await DatabaseService.getReportById(reportId);
          
          if (report) {
            // Formatear los datos del reporte
            setReportData({
              id: `#INC-${new Date(report.fecha_completa).getFullYear()}${String(new Date(report.fecha_completa).getMonth() + 1).padStart(2, '0')}${String(new Date(report.fecha_completa).getDate()).padStart(2, '0')}-${String(report.id).padStart(3, '0')}`,
              date: report.fecha_reporte,
              time: report.hora_reporte,
              titulo: report.titulo,
              categoria: report.categoria,
              prioridad: report.prioridad,
              estado: report.estado
            });
          } else {
            // Si no encontramos el reporte, usamos datos de ejemplo
            const fechaMX = DatabaseService.getNowMexicoDateTime();
            setReportData({
              id: DatabaseService.generateReportId(),
              date: fechaMX.date,
              time: fechaMX.time,
              titulo: route.params?.titulo || 'Reporte de incidencia',
              categoria: route.params?.categoria || 'General',
              prioridad: route.params?.prioridad || 'Media',
              estado: 'pendiente'
            });
          }
        } else {
          // Si no hay reportId, usamos datos de ejemplo
          const fechaMX = DatabaseService.getNowMexicoDateTime();
          setReportData({
            id: DatabaseService.generateReportId(),
            date: fechaMX.date,
            time: fechaMX.time,
            titulo: 'Reporte de incidencia',
            categoria: 'General',
            prioridad: 'Media',
            estado: 'pendiente'
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del reporte:', err);
        setError('Error al cargar los datos del reporte');
        
        // Datos de respaldo en caso de error
        const fechaMX = DatabaseService.getNowMexicoDateTime();
        setReportData({
          id: DatabaseService.generateReportId(),
          date: fechaMX.date,
          time: fechaMX.time,
          titulo: 'Reporte de incidencia',
          categoria: 'General',
          prioridad: 'Media',
          estado: 'pendiente'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [route.params]);

  const handleViewMyReports = () => {
    navigation.navigate('MyReports');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Cargando confirmación...</Text>
      </SafeAreaView>
    );
  }

  if (!reportData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la información del reporte</Text>
          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={handleGoHome}
          >
            <Text style={styles.buttonSecondaryText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Encabezado con logo/icono */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>CardenalTrak</Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <Text style={styles.title}>¡Reporte Enviado!</Text>
          
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✓</Text>
            </View>
            <Text style={styles.successText}>
              Su reporte ha sido recibido exitosamente y está siendo procesado.
            </Text>
          </View>

          {/* Información del reporte */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ID de Reporte:</Text>
            <Text style={styles.infoValue}>{reportData.id}</Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.infoLabel}>Fecha y hora:</Text>
            <Text style={styles.infoValue}>
              {reportData.date} - {reportData.time}
            </Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.infoLabel}>Título:</Text>
            <Text style={styles.infoValue}>{reportData.titulo}</Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.infoLabel}>Categoría:</Text>
            <Text style={styles.infoValue}>{reportData.categoria}</Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.infoLabel}>Prioridad:</Text>
            <Text style={[styles.infoValue, 
              reportData.prioridad === 'Alta' ? styles.highPriority :
              reportData.prioridad === 'Media' ? styles.mediumPriority :
              styles.lowPriority
            ]}>
              {reportData.prioridad}
            </Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.infoLabel}>Estado:</Text>
            <View style={[
              styles.statusBadge,
              reportData.estado === 'resuelto' ? styles.statusResolved :
              reportData.estado === 'en_proceso' ? styles.statusInProgress :
              styles.statusPending
            ]}>
              <Text style={styles.statusText}>
                {reportData.estado === 'pendiente' ? 'Pendiente' :
                 reportData.estado === 'en_proceso' ? 'En Proceso' :
                 reportData.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <TouchableOpacity 
            style={styles.buttonPrimary}
            onPress={handleViewMyReports}
          >
            <Text style={styles.buttonPrimaryText}>Ver mis reportes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={handleGoHome}
          >
            <Text style={styles.buttonSecondaryText}>Volver al inicio</Text>
          </TouchableOpacity>

          {/* Sección de siguientes pasos */}
          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsTitle}>¿Qué sigue?</Text>
            
            <View style={styles.stepItem}>
              <View style={styles.checkbox}>
                <Text style={styles.checkboxText}>✓</Text>
              </View>
              <Text style={styles.stepText}>
                Recibirá notificaciones sobre el estado de su reporte
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.checkbox}>
                <Text style={styles.checkboxText}>✓</Text>
              </View>
              <Text style={styles.stepText}>
                Puede consultar el estado en la sección "Reportes"
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.checkbox}>
                <Text style={styles.checkboxText}>✓</Text>
              </View>
              <Text style={styles.stepText}>
                Un agente podría contactarle para más información
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MyReports')}
        >
          <Text style={styles.navText}>Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Tracking')}
        >
          <Text style={styles.navText}>Seguimiento</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  headerDivider: {
    height: 3,
    width: 60,
    backgroundColor: '#e53935',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 20,
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 15,
  },
  highPriority: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  mediumPriority: {
    color: '#f57c00',
    fontWeight: 'bold',
  },
  lowPriority: {
    color: '#388e3c',
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  statusPending: {
    backgroundColor: '#ffecb3',
  },
  statusInProgress: {
    backgroundColor: '#bbdefb',
  },
  statusResolved: {
    backgroundColor: '#c8e6c9',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#1a237e',
  },
  buttonSecondaryText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '600',
  },
  nextStepsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#1a237e',
    fontWeight: '500',
  },
});

export default ConfirmationScreen;