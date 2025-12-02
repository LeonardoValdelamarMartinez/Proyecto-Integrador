import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importa las pantallas que has subido
import InicioDeSesion from './INTERFACES/InicioDeSesion';
import Registro from './INTERFACES/PantallaDeRegistro';
import RecuperarContraseña from './INTERFACES/OlvidarContrasena'; // El componente se llama RecuperarContraseña
import PantallaSeguimiento from './INTERFACES/PantallaSeguimiento';
import MisReportesScreen from './INTERFACES/LIstaIncidecncias';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de Pestañas (Main App)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Seguimiento') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Mis Reportes') {
            iconName = focused ? 'list-sharp' : 'list-outline';
          }
          // Puedes agregar más iconos para otros elementos del Navbar
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#B71C1C', // Color principal de tu app
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Seguimiento" component={PantallaSeguimiento} />
      <Tab.Screen name="Mis Reportes" component={MisReportesScreen} />
    </Tab.Navigator>
  );
}

// Navegador Principal (Stack: Auth + Main App)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InicioSesion">
        {/* Flujo de Autenticación */}
        <Stack.Screen name="InicioSesion" component={InicioDeSesion} options={{ headerShown: false }} />
        <Stack.Screen name="Registro" component={Registro} options={{ title: 'Crear Cuenta' }} />
        <Stack.Screen name="RecuperarContraseña" component={RecuperarContraseña} options={{ title: 'Recuperar Contraseña' }} />
        
        {/* Una vez logueado, navega a MainApp */}
        <Stack.Screen name="MainApp" component={MainTabs} options={{ headerShown: false }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}