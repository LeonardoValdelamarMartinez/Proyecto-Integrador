import React, { useEffect, useState, useCallback } from 'react';
import {SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatabaseService from '../database/DatabaseService';

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  const [userData, setUserData] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    facultad: '',
    matricula: '',
    semestre: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUserId = DatabaseService.getCurrentUserId();
      
      if (!currentUserId) {
        navigation.navigate('InicioSesion');
        return;
      }

      const user = await DatabaseService.getUserById(currentUserId);
      
      if (!user) {
        setError('Usuario no encontrado');
        return;
      }

      const stats = await DatabaseService.getDetailedReportStats(currentUserId);

      const userProfile = {
        id: user.id,
        name: user.nombre || 'Usuario',
        role: 'Estudiante',
        email: user.email || '',
        faculty: user.facultad || 'No especificada',
        studentId: user.matricula || 'No especificada',
        semester: user.semestre || 'No especificado',
        username: user.username || '',
      };

      setUserData(userProfile);
      
      setFormData({
        nombre: user.nombre || '',
        facultad: user.facultad || '',
        matricula: user.matricula || '',
        semestre: user.semestre || '',
      });

      setReportStats({
        total: stats.total || 0,
        resolved: stats.resueltos || 0,
        pending: stats.pendientes || 0,
        inProgress: stats.enProceso || 0,
      });

    } catch (err) {
      console.error('Error al cargar perfil:', err);
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useFocusEffect(
    useCallback(() => {
      if (!isEditing) {
        loadProfileData();
      }
    }, [loadProfileData, isEditing])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfileData();
  }, [loadProfileData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.facultad.trim()) {
      newErrors.facultad = 'La facultad es requerida';
    }

    if (!formData.matricula.trim()) {
      newErrors.matricula = 'La matrícula es requerida';
    }

    if (!formData.semestre.trim()) {
      newErrors.semestre = 'El semestre es requerido';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor, completa todos los campos requeridos');
      return;
    }

    try {
      setSaving(true);
      const currentUserId = DatabaseService.getCurrentUserId();

      if (!currentUserId) {
        Alert.alert('Error', 'No hay usuario autenticado');
        setIsEditing(false);
        return;
      }

      const updatedUser = await DatabaseService.updateUserProfile(currentUserId, {
        nombre: formData.nombre.trim(),
        facultad: formData.facultad.trim(),
        matricula: formData.matricula.trim(),
        semestre: formData.semestre.trim(),
      });

      if (updatedUser) {
        const updatedUserData = {
          ...userData,
          name: formData.nombre.trim(),
          faculty: formData.facultad.trim(),
          studentId: formData.matricula.trim(),
          semester: formData.semestre.trim(),
        };
        
        setUserData(updatedUserData);
        setIsEditing(false);
        
        Alert.alert(
          '¡Éxito!',
          'Perfil actualizado correctamente',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userData) {
      setFormData({
        nombre: userData.name,
        facultad: userData.faculty,
        matricula: userData.studentId,
        semestre: userData.semester,
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
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
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleViewReports = () => {
    navigation.navigate('MisReportes');
  };

  const renderPersonalInfoSection = () => {
    if (isEditing) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editar información personal</Text>
          <View style={styles.editFormCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo *</Text>
              <TextInput
                style={[styles.input, formErrors.nombre && styles.inputError]}
                value={formData.nombre}
                onChangeText={(text) => handleInputChange('nombre', text)}
                placeholder="Ingresa tu nombre completo"
                editable={!saving}
              />
              {formErrors.nombre && <Text style={styles.errorText}>{formErrors.nombre}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Facultad *</Text>
              <TextInput
                style={[styles.input, formErrors.facultad && styles.inputError]}
                value={formData.facultad}
                onChangeText={(text) => handleInputChange('facultad', text)}
                placeholder="Ej: Ingeniería en Sistemas"
                editable={!saving}
              />
              {formErrors.facultad && <Text style={styles.errorText}>{formErrors.facultad}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Matrícula *</Text>
              <TextInput
                style={[styles.input, formErrors.matricula && styles.inputError]}
                value={formData.matricula}
                onChangeText={(text) => handleInputChange('matricula', text)}
                placeholder="Ej: A012345678"
                editable={!saving}
                autoCapitalize="characters"
              />
              {formErrors.matricula && <Text style={styles.errorText}>{formErrors.matricula}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Semestre *</Text>
              <TextInput
                style={[styles.input, formErrors.semestre && styles.inputError]}
                value={formData.semestre}
                onChangeText={(text) => handleInputChange('semestre', text)}
                placeholder="Ej: 6to"
                editable={!saving}
              />
              {formErrors.semestre && <Text style={styles.errorText}>{formErrors.semestre}</Text>}
            </View>

            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Icon name="save" size={18} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelEditButton}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.cancelEditButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <TouchableOpacity 
            style={styles.editIconButton}
            onPress={() => setIsEditing(true)}
            disabled={loading}
          >
            <Icon name="edit" size={20} color="#1a237e" />
          </TouchableOpacity>
        </View>
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
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      );
    }

    if (error && !userData) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#d32f2f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadProfileData}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('InicioSesion')}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!userData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontraron datos del usuario</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('InicioSesion')}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1a237e']}
              tintColor="#1a237e"
              enabled={!isEditing}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userRole}>{userData.role}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
                {userData.username && (
                  <Text style={styles.userUsername}>@{userData.username}</Text>
                )}
              </View>
            </View>
            <View style={styles.headerDivider} />
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estadísticas</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{reportStats?.total || 0}</Text>
                  <Text style={styles.statLabel}>Reportes totales</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{reportStats?.resolved || 0}</Text>
                  <Text style={styles.statLabel}>Reportes resueltos</Text>
                </View>
              </View>
              {reportStats && (
                <View style={styles.additionalStats}>
                  <View style={styles.statRow}>
                    <View style={styles.statIndicator}>
                      <View style={[styles.statusDot, styles.pendingDot]} />
                      <Text style={styles.statText}>Pendientes: {reportStats.pending}</Text>
                    </View>
                    <View style={styles.statIndicator}>
                      <View style={[styles.statusDot, styles.inProgressDot]} />
                      <Text style={styles.statText}>En proceso: {reportStats.inProgress}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {renderPersonalInfoSection()}

            {!isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleViewReports}
                  disabled={loading}
                >
                  <Icon name="assignment" size={20} color="#1a237e" style={styles.actionIcon} />
                  <Text style={styles.actionButtonText}>Ver mis reportes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.logoutButton]}
                  onPress={handleLogout}
                  disabled={loading}
                >
                  <Icon name="logout" size={20} color="#d32f2f" style={styles.actionIcon} />
                  <Text style={[styles.actionButtonText, styles.logoutText]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {renderContent()}

      {!isEditing && (
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Dashboard')}
            disabled={loading}
          >
            <Icon name="home" size={24} color="#1a237e" />
            <Text style={styles.navText}>Inicio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={handleViewReports}
            disabled={loading}
          >
            <Icon name="assignment" size={24} color="#1a237e" />
            <Text style={styles.navText}>Reportes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Seguimiento')}
            disabled={loading}
          >
            <Icon name="track-changes" size={24} color="#1a237e" />
            <Text style={styles.navText}>Seguimiento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Perfil')}
            disabled={loading}
          >
            <Icon name="person" size={24} color="#1a237e" />
            <Text style={[styles.navText, styles.navActive]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: '#1a237e',
  },
  loginButtonText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  editIconButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  additionalStats: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  pendingDot: {
    backgroundColor: '#ff9800',
  },
  inProgressDot: {
    backgroundColor: '#2196f3',
  },
  statText: {
    fontSize: 14,
    color: '#666',
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
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  editFormCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1a237e',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9fa8da',
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a237e',
  },
  cancelEditButtonText: {
    color: '#1a237e',
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