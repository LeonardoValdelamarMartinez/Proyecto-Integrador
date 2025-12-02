import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Importar pantallas
import InicioDeSesion from './INTERFACES/InicioDeSesion';
import Registro from './INTERFACES/PantallaDeRegistro';
import RecuperarContraseña from './INTERFACES/OlvidarContraseña';
import Dashboard from './INTERFACES/Dashboard';
import PantallaSeguimiento from './INTERFACES/PantallaSeguimiento';
import MisReportesScreen from './INTERFACES/LIstaIncidecncias';
import PantallaDePerfil from './INTERFACES/PantallaDePerfil';
import PantallaConfirmacion from './INTERFACES/PantallaConfirmacion';

// Importar DatabaseService
import DatabaseService from './database/DatabaseService';

// Inicializar la base de datos
DatabaseService.initialize().catch(error => {
  console.error('Error al inicializar la base de datos:', error);
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#BD0A0A" />
      <Stack.Navigator
        initialRouteName="InicioSesion"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#BD0A0A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      >
        {/* Autenticación */}
        <Stack.Screen 
          name="InicioSesion" 
          component={InicioDeSesion}
          options={{
            title: 'Iniciar Sesión',
            headerShown: true,
          }}
        />
        
        <Stack.Screen 
          name="Registro" 
          component={Registro}
          options={{
            title: 'Crear Cuenta',
          }}
        />
        
        <Stack.Screen 
          name="RecuperarContraseña" 
          component={RecuperarContraseña}
          options={{
            title: 'Recuperar Contraseña',
          }}
        />

        {/* Dashboard Principal */}
        <Stack.Screen 
          name="Dashboard" 
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />

        {/* Funcionalidades */}
        <Stack.Screen 
          name="Seguimiento" 
          component={PantallaSeguimiento}
          options={{
            title: 'Reportar Incidencia',
          }}
        />
        
        <Stack.Screen 
          name="MisReportes" 
          component={MisReportesScreen}
          options={{
            title: 'Mis Reportes',
          }}
        />
        
        <Stack.Screen 
          name="Perfil" 
          component={PantallaDePerfil}
          options={{
            title: 'Mi Perfil',
          }}
        />
        
        <Stack.Screen 
          name="Confirmacion" 
          component={PantallaConfirmacion}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}