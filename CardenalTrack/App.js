import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import InicioSesion from "./Screens/InicioDeSesion";
import Registro from "./Screens/Registro";
import RecuperarContraseña from "./Screens/RecuperarContraseña";



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLOR_PRIMARY = "#BD0A0A";
const COLOR_INACTIVE = "#777";

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 62,
          borderTopWidth: 0,
          backgroundColor: "#fff",
          elevation: 10,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "home-outline";

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          if (route.name === "Transacciones")
            iconName = focused ? "add-circle" : "add-circle-outline";
          if (route.name === "Presupuestos")
            iconName = focused ? "wallet" : "wallet-outline";
          if (route.name === "Graficas")
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          if (route.name === "Actividad")
            iconName = focused ? "time" : "time-outline";

          return (
            <Ionicons
              name={iconName}
              size={focused ? 30 : 26}
              color={focused ? COLOR_PRIMARY : COLOR_INACTIVE}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transacciones" component={Transacciones} />
      <Tab.Screen name="Presupuestos" component={Presupuestos} />
      <Tab.Screen name="Graficas" component={Graficas} />
      <Tab.Screen name="Actividad" component={ActividadScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InicioSesion">
        <Stack.Screen
          name="InicioSesion"
          component={InicioSesion}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Registro"
          component={Registro}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RecuperarContraseña"
          component={RecuperarContraseña}
          options={{ headerShown: false }}
        />

        {/* Tabs principales */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
