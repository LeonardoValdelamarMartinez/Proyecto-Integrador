import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  // Datos del usuario (en producción vendrían de la base de datos o contexto)
  const userData = {
    name: 'Cantosa Mendozza',
    role: 'Estudiante',
    email: 'carlos.mendoza@ucardenal.edu.mx',
    faculty: 'Ingeniería en Sistemas',
    studentId: 'A012345678',
    semester: '6to',
    totalReports: 12,
    resolvedReports: 8,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData.name.charAt(0)}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userRole}>{userData.role}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Sección de Estadísticas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userData.totalReports}</Text>
                <Text style={styles.statLabel}>Reportes totales</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userData.resolvedReports}</Text>
                <Text style={styles.statLabel}>Reportes resueltos</Text>
              </View>
            </View>
          </View>

          {/* Sección de Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información personal</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Facultad</Text>
                <Text style={styles.infoValue}>{userData.faculty}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Matrícula</Text>
                <Text style={styles.infoValue}>{userData.studentId}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Semestre</Text>
                <Text style={styles.infoValue}>{userData.semester}</Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="edit" size={20} color="#ffffff" style={styles.editIcon} />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Icon name="dashboard" size={20} color="#1a237e" style={styles.actionIcon} />
              <Text style={styles.actionButtonText}>Volver al Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]}
              onPress={() => {
                // Lógica para cerrar sesión
                navigation.navigate('Login');
              }}
            >
              <Icon name="logout" size={20} color="#d32f2f" style={styles.actionIcon} />
              <Text style={[styles.actionButtonText, styles.logoutText]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="home" size={24} color="#1a237e" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MyReports')}
        >
          <Icon name="assignment" size={24} color="#1a237e" />
          <Text style={styles.navText}>Reportes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Tracking')}
        >
          <Icon name="track-changes" size={24} color="#1a237e" />
          <Text style={styles.navText}>Seguimiento</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="person" size={24} color="#1a237e" />
          <Text style={[styles.navText, styles.navActive]}>Perfil</Text>
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
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e8eaf6',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  editButton: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editIcon: {
    marginRight: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a237e',
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
  actionIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
  },
  logoutText: {
    color: '#d32f2f',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  navActive: {
    color: '#1a237e',
    fontWeight: '600',
  },
});

export default ProfileScreen;