import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ActividadCard from '../../components/ActividadCard';
import { Cargando, Chip, MensajeError, Vacio } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { listarActividades, listarEtiquetas } from '../../api/actividades';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';

/**
 * Listado de actividades disponibles. Si el usuario es voluntario judicial, la API ya excluye
 * las actividades sensibles (ABAC): la app no filtra nada por su cuenta.
 */
export default function ActividadesScreen({ navigation }) {
  const [etiqueta, setEtiqueta] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [lista, setLista] = useState([]);
  const [total, setTotal] = useState(0);
  const [masError, setMasError] = useState(null);

  const etiquetas = useCarga(() => listarEtiquetas(), []);
  const { cargando, error, recargar } = useCarga(async () => {
    const r = await listarActividades({ etiqueta: etiqueta || undefined, page: 1, limit: 20 });
    setLista(r.data);
    setTotal(r.total);
    setPagina(1);
    return r;
  }, [etiqueta]);

  const cargarMas = useCallback(async () => {
    if (lista.length >= total) return;
    try {
      const r = await listarActividades({ etiqueta: etiqueta || undefined, page: pagina + 1, limit: 20 });
      setLista((l) => [...l, ...r.data]);
      setPagina(pagina + 1);
    } catch (e) {
      setMasError(mensajeDeError(e));
    }
  }, [lista.length, total, pagina, etiqueta]);

  return (
    <View style={styles.contenedor}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros} contentContainerStyle={styles.filtrosContenido}>
        <Chip texto="Todas" activo={!etiqueta} onPress={() => setEtiqueta(null)} />
        {(etiquetas.datos || []).map((e) => (
          <Chip key={e.id} texto={e.nombre} activo={etiqueta === e.id} onPress={() => setEtiqueta(e.id)} />
        ))}
      </ScrollView>
      <MensajeError texto={error || masError} onReintentar={recargar} />
      {cargando && lista.length === 0 ? (
        <Cargando />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => <ActividadCard actividad={item} onPress={() => navigation.navigate('ActividadDetalle', { id: item.id })} />}
          ListEmptyComponent={<Vacio texto="No hay actividades disponibles por ahora." />}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
          onEndReached={cargarMas}
          onEndReachedThreshold={0.4}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  filtros: { flexGrow: 0, paddingTop: espacio.m },
  filtrosContenido: { paddingHorizontal: espacio.l },
  lista: { padding: espacio.l, flexGrow: 1 },
});
