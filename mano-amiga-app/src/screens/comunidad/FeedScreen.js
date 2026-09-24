import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Boton, Cargando, MensajeError, Tarjeta, TextoSuave, Vacio } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { useAuth } from '../../hooks/useAuth';
import { listarPublicaciones } from '../../api/comunidad';
import { colores, espacio } from '../../constants/tema';
import { fechaHora } from '../../utils/formato';

/** Feed / muro de un proyecto (actividad o campaña). Es público. */
export default function FeedScreen({ route, navigation }) {
  const { proyectoId, titulo, organizacionId } = route.params;
  const { usuario } = useAuth();
  const { datos, cargando, error, recargar } = useCarga(() => listarPublicaciones(proyectoId, { limit: 50 }), [proyectoId]);

  // Mostrar el botón es solo comodidad: si no es de su organización, la API responde 403 (RS3/RS4).
  const puedePublicar = usuario.rol === 'coordinador' && usuario.organizacionId === organizacionId;

  if (cargando && !datos) return <Cargando />;

  return (
    <View style={styles.contenedor}>
      <MensajeError texto={error} onReintentar={recargar} />
      <FlatList
        data={datos?.data || []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        ListHeaderComponent={
          <>
            <Text style={styles.encabezado}>{titulo}</Text>
            {puedePublicar ? <Boton titulo="+ Publicar" onPress={() => navigation.navigate('Publicar', { proyectoId, titulo })} /> : null}
          </>
        }
        ListEmptyComponent={<Vacio texto="Todavía no hay publicaciones." />}
        renderItem={({ item: p }) => (
          <Tarjeta estilo={p.tipo === 'convocatoria' ? styles.convocatoria : null}>
            {p.tipo === 'convocatoria' ? <Text style={styles.etiquetaConv}>📣 CONVOCATORIA EXPRESS</Text> : null}
            <Text style={styles.contenido}>{p.contenido}</Text>
            <TextoSuave>
              {p.autor?.nombre ? `${p.autor.nombre} · ` : ''}
              {fechaHora(p.fecha)}
            </TextoSuave>
          </Tarjeta>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: espacio.l, flexGrow: 1 },
  encabezado: { fontSize: 20, fontWeight: '700', color: colores.texto, marginBottom: espacio.m },
  convocatoria: { borderColor: colores.advertencia, borderWidth: 2 },
  etiquetaConv: { color: colores.advertencia, fontWeight: '700', marginBottom: espacio.xs },
  contenido: { fontSize: 15, lineHeight: 21, color: colores.texto, marginBottom: espacio.s },
});
