import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import ActividadCard from '../../components/ActividadCard';
import { Boton, Cargando, MensajeError, Vacio } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { listarActividades } from '../../api/actividades';
import { colores, espacio } from '../../constants/tema';

/** Actividades de la organización del coordinador (la API toma la organización del token). */
export default function MisActividadesScreen({ navigation }) {
  const { datos, cargando, error, recargar } = useCarga(() => listarActividades({ mias: true, limit: 50 }), []);

  if (cargando && !datos) return <Cargando />;

  return (
    <View style={styles.contenedor}>
      <MensajeError texto={error} onReintentar={recargar} />
      <FlatList
        data={datos?.data || []}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        ListHeaderComponent={<Boton titulo="+ Nueva actividad" onPress={() => navigation.navigate('ActividadForm')} />}
        ListEmptyComponent={<Vacio texto="Tu organización todavía no publicó actividades." />}
        renderItem={({ item }) => (
          <ActividadCard actividad={item} mostrarEstado onPress={() => navigation.navigate('GestionActividad', { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: espacio.l, flexGrow: 1 },
});
