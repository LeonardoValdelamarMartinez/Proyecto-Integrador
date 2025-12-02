// App.js (o el archivo raíz de navegación)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importa las pantallas de interfaces
import InicioDeSesion from './INTERFACES/InicioDeSesion';
import Registro from './INTERFACES/PantalladeRegistro';
import RecuperarContraseña from './INTERFACES/OlvidarContrasena';
import PantallaSeguimiento from './INTERFACES/PantallaSeguimiento';
import MisReportesScreen from './INTERFACES/ListaIncidecncias';
import NuevoReporteScreen from './INTERFACES/PantallaReportes';
import Dashboard from './INTERFACES/Dashboard';

// Importa la pantalla de confirmación
import ConfirmationScreen from './INTERFACES/PantalladeConfirmacion';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configuración común de las Tabs
const tabScreenOptions = ({ route }) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;

    if (route.name === 'Seguimiento') {
      iconName = focused ? 'document-text' : 'document-text-outline';
    } else if (route.name === 'Mis Reportes') {
      iconName = focused ? 'list-sharp' : 'list-outline';
    } else if (route.name === 'Nuevo Reporte') {
      iconName = focused ? 'add-circle' : 'add-circle-outline';
    } else {
      iconName = 'ellipse';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: '#B71C1C',
  tabBarInactiveTintColor: 'gray',
});

// Tabs para usuarios cuyo correo antes de @ son SOLO números
function MainTabsNumeros() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Seguimiento" component={PantallaSeguimiento} />
      <Tab.Screen name="MisReportes" component={MisReportesScreen} />
    </Tab.Navigator>
  );
}

// Tabs para usuarios cuyo correo antes de @ tiene letras
function MainTabsLetras() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Nuevo Reporte" component={NuevoReporteScreen} />
      <Tab.Screen name="MisReportes" component={MisReportesScreen} />
    </Tab.Navigator>
  );
}

// Navegador Principal (Stack: Auth + Main App)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InicioSesion">
        {/* Flujo de Autenticación */}
        <Stack.Screen
          name="InicioSesion"
          component={InicioDeSesion}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registro"
          component={Registro}
          options={{ title: 'Crear Cuenta' }}
        />
        <Stack.Screen
          name="RecuperarContraseña"
          component={RecuperarContraseña}
          options={{ title: 'Recuperar Contraseña' }}
        />

        {/* Dashboard principal (lo usamos también como "Home") */}
        <Stack.Screen
          name="Home"
          component={Dashboard}
          options={{ headerShown: false }}
        />

        {/* Tabs según el tipo de correo */}
        <Stack.Screen
          name="MainTabsNumeros"
          component={MainTabsNumeros}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabsLetras"
          component={MainTabsLetras}
          options={{ headerShown: false }}
        />

        {/* Pantalla de confirmación */}
        <Stack.Screen
          name="PantallaConfirmación"
          component={ConfirmationScreen}
          options={{ headerShown: false }}
        />

        {/* Rutas que usa ConfirmationScreen en los botones de abajo */}
        <Stack.Screen
          name="MyReports"
          component={MisReportesScreen}
          options={{ title: 'Mis reportes' }}
        />
        <Stack.Screen
          name="Tracking"
          component={PantallaSeguimiento}
          options={{ title: 'Seguimiento' }}
        />
        {/* Puedes luego cambiar Profile por una pantalla real de perfil */}
        <Stack.Screen
          name="Profile"
          component={Dashboard}
          options={{ title: 'Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
