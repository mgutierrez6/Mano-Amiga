import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { Cargando } from '../components/ui';
import { colores } from '../constants/tema';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';
import ActividadesScreen from '../screens/actividades/ActividadesScreen';
import ActividadDetalleScreen from '../screens/actividades/ActividadDetalleScreen';
import MisInscripcionesScreen from '../screens/inscripciones/MisInscripcionesScreen';
import EscanearQRScreen from '../screens/inscripciones/EscanearQRScreen';
import CampanasScreen from '../screens/comunidad/CampanasScreen';
import FeedScreen from '../screens/comunidad/FeedScreen';
import PublicarScreen from '../screens/comunidad/PublicarScreen';
import CrearCampanaScreen from '../screens/comunidad/CrearCampanaScreen';
import MisActividadesScreen from '../screens/coordinador/MisActividadesScreen';
import ActividadFormScreen from '../screens/coordinador/ActividadFormScreen';
import GestionActividadScreen from '../screens/coordinador/GestionActividadScreen';
import MostrarQRScreen from '../screens/coordinador/MostrarQRScreen';
import PerfilScreen from '../screens/perfil/PerfilScreen';
import AdminInicioScreen from '../screens/admin/AdminInicioScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const opcionesStack = { headerTintColor: colores.primario, headerBackButtonDisplayMode: 'minimal' };
const icono = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

// ---------- Sin sesión ----------
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={opcionesStack}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: 'Crear cuenta' }} />
    </Stack.Navigator>
  );
}

// ---------- Voluntario ----------
function VoluntarioTabs() {
  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: colores.primario, headerTintColor: colores.primario }}>
      <Tabs.Screen name="Actividades" component={ActividadesScreen} options={{ tabBarIcon: icono('🤝') }} />
      <Tabs.Screen name="Campanas" component={CampanasScreen} options={{ title: 'Campañas', tabBarIcon: icono('📦') }} />
      <Tabs.Screen name="MisInscripciones" component={MisInscripcionesScreen} options={{ title: 'Mis inscripciones', tabBarIcon: icono('📋') }} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('👤') }} />
    </Tabs.Navigator>
  );
}

// ---------- Coordinador ----------
function CoordinadorTabs() {
  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: colores.primario, headerTintColor: colores.primario }}>
      <Tabs.Screen name="MisActividades" component={MisActividadesScreen} options={{ title: 'Mis actividades', tabBarIcon: icono('🗂') }} />
      <Tabs.Screen name="Campanas" component={CampanasScreen} options={{ title: 'Campañas', tabBarIcon: icono('📦') }} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('👤') }} />
    </Tabs.Navigator>
  );
}

// ---------- Administrador (Sprint 2) ----------
function AdminTabs() {
  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: colores.primario, headerTintColor: colores.primario }}>
      <Tabs.Screen name="Admin" component={AdminInicioScreen} options={{ title: 'Administración', tabBarIcon: icono('🛠') }} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('👤') }} />
    </Tabs.Navigator>
  );
}

const TABS_POR_ROL = { voluntario: VoluntarioTabs, coordinador: CoordinadorTabs, admin: AdminTabs };

// Las pantallas visibles cambian según el rol SOLO por comodidad: la API valida todo (RS4).
function AppStack({ rol }) {
  const Inicio = TABS_POR_ROL[rol] || VoluntarioTabs;
  return (
    <Stack.Navigator screenOptions={opcionesStack}>
      <Stack.Screen name="Inicio" component={Inicio} options={{ headerShown: false }} />
      <Stack.Screen name="ActividadDetalle" component={ActividadDetalleScreen} options={{ title: 'Actividad' }} />
      <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Comunidad' }} />
      {rol === 'voluntario' ? <Stack.Screen name="EscanearQR" component={EscanearQRScreen} options={{ title: 'Marcar asistencia' }} /> : null}
      {rol === 'coordinador' ? (
        <>
          <Stack.Screen name="ActividadForm" component={ActividadFormScreen} options={{ title: 'Actividad' }} />
          <Stack.Screen name="GestionActividad" component={GestionActividadScreen} options={{ title: 'Gestionar actividad' }} />
          <Stack.Screen name="MostrarQR" component={MostrarQRScreen} options={{ title: 'QR de asistencia' }} />
          <Stack.Screen name="Publicar" component={PublicarScreen} options={{ title: 'Nueva publicación' }} />
          <Stack.Screen name="CrearCampana" component={CrearCampanaScreen} options={{ title: 'Nueva campaña' }} />
        </>
      ) : null}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando />;
  return <NavigationContainer>{usuario ? <AppStack rol={usuario.rol} /> : <AuthStack />}</NavigationContainer>;
}
