import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Boton, Cargando, MensajeError, Tarjeta, TextoSuave, Vacio } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { useAuth } from '../../hooks/useAuth';
import { listarCampanas } from '../../api/comunidad';
import { colores, espacio } from '../../constants/tema';
import { rangoFechas } from '../../utils/formato';

export default function CampanasScreen({ navigation }) {
  const { usuario } = useAuth();
  const { datos, cargando, error, recargar } = useCarga(() => listarCampanas({ limit: 50 }), []);

  if (cargando && !datos) return <Cargando />;

  return (
    <View style={styles.contenedor}>
      <MensajeError texto={error} onReintentar={recargar} />
      <FlatList
        data={datos?.data || []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        ListHeaderComponent={
          usuario.rol === 'coordinador' ? <Boton titulo="+ Nueva campaña" onPress={() => navigation.navigate('CrearCampana')} /> : null
        }
        ListEmptyComponent={<Vacio texto="No hay campañas de donación activas." />}
        renderItem={({ item: c }) => (
          <Tarjeta onPress={() => navigation.navigate('Feed', { proyectoId: c.id, titulo: c.titulo, organizacionId: c.organizacion.id })}>
            <Text style={styles.titulo}>{c.titulo}</Text>
            <TextoSuave>{c.organizacion?.nombre}</TextoSuave>
            <TextoSuave>{rangoFechas(c.fechaInicio, c.fechaFin)}</TextoSuave>
            {c.objetivo ? <Text style={styles.objetivo}>🎯 {c.objetivo}</Text> : null}
            <Text style={styles.descripcion} numberOfLines={3}>
              {c.descripcion}
            </Text>
            {c.puntos.map((p) => (
              <TextoSuave key={p.id}>
                📦 {p.nombre}
                {p.direccion ? ` — ${p.direccion}` : ''}
              </TextoSuave>
            ))}
          </Tarjeta>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: espacio.l, flexGrow: 1 },
  titulo: { fontSize: 17, fontWeight: '600', color: colores.texto, marginBottom: espacio.xs },
  objetivo: { marginTop: espacio.s, color: colores.primario, fontWeight: '600' },
  descripcion: { marginVertical: espacio.s, color: colores.texto },
});
