import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import { Boton, Cargando, Chip, MensajeError, TextoSuave, Titulo } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { useAuth } from '../../hooks/useAuth';
import { obtenerActividad } from '../../api/actividades';
import { inscribirme } from '../../api/inscripciones';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';
import { rangoFechas } from '../../utils/formato';

export default function ActividadDetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const { usuario } = useAuth();
  const { datos: act, cargando, error, recargar } = useCarga(() => obtenerActividad(id), [id]);
  const [enviando, setEnviando] = useState(false);

  const inscribir = async () => {
    setEnviando(true);
    try {
      await inscribirme(id);
      Alert.alert('¡Listo!', 'Te inscribiste. El coordinador tiene que aceptar tu inscripción; lo vas a ver en "Mis inscripciones".');
      recargar();
    } catch (e) {
      Alert.alert('No se pudo inscribir', mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando && !act) return <Cargando />;
  if (error) return <MensajeError texto={error} onReintentar={recargar} />;
  if (!act) return null;

  return (
    <Pantalla>
      <Titulo>{act.titulo}</Titulo>
      <TextoSuave>{act.organizacion?.nombre}</TextoSuave>
      <View style={styles.bloque}>
        <Text style={styles.dato}>🗓 {rangoFechas(act.fechaInicio, act.fechaFin)}</Text>
        {act.direccion ? <Text style={styles.dato}>📍 {act.direccion}</Text> : null}
        <Text style={styles.dato}>
          👥 {act.cuposLibres} lugares libres de {act.cupo}
        </Text>
      </View>
      <Text style={styles.descripcion}>{act.descripcion}</Text>
      <View style={styles.etiquetas}>
        {act.etiquetas.map((e) => (
          <Chip key={e.id} texto={e.nombre} />
        ))}
      </View>

      {usuario.rol === 'voluntario' ? (
        <Boton titulo={act.cuposLibres > 0 ? 'Inscribirme' : 'Sin cupos'} onPress={inscribir} cargando={enviando} deshabilitado={act.cuposLibres === 0} />
      ) : null}
      <Boton
        titulo="Ver comunidad del proyecto"
        variante="borde"
        onPress={() => navigation.navigate('Feed', { proyectoId: act.id, titulo: act.titulo, organizacionId: act.organizacionId })}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  bloque: { marginVertical: espacio.m, gap: espacio.xs },
  dato: { fontSize: 15, color: colores.texto },
  descripcion: { fontSize: 15, lineHeight: 22, color: colores.texto, marginBottom: espacio.m },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: espacio.m },
});
