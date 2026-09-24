import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton, Cargando, EstadoBadge, MensajeError, Subtitulo, Tarjeta, TextoSuave, Titulo } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { cancelarActividad, obtenerActividad } from '../../api/actividades';
import { cambiarEstadoInscripcion, inscriptosDeActividad } from '../../api/inscripciones';
import { asistenciaManual, asistenciasDeActividad, validarAsistencia } from '../../api/asistencias';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';
import { fechaHora, rangoFechas } from '../../utils/formato';

/**
 * Gestión de participantes, asistencia y certificación (R4) de UNA actividad de la organización.
 * Si la actividad fuera de otra organización, la API responde 403 (RS3).
 */
export default function GestionActividadScreen({ route, navigation }) {
  const { id } = route.params;
  const [ocupado, setOcupado] = useState(null);

  const { datos, cargando, error, recargar } = useCarga(async () => {
    const [actividad, inscriptos, asistencias] = await Promise.all([obtenerActividad(id), inscriptosDeActividad(id), asistenciasDeActividad(id)]);
    return { actividad, inscriptos, asistencias };
  }, [id]);

  const accion = useCallback(
    async (clave, fn) => {
      setOcupado(clave);
      try {
        await fn();
        await recargar();
      } catch (e) {
        Alert.alert('No se pudo completar', mensajeDeError(e));
      } finally {
        setOcupado(null);
      }
    },
    [recargar]
  );

  const confirmarCancelacion = () =>
    Alert.alert('Cancelar actividad', 'La actividad deja de mostrarse a los voluntarios. ¿Seguís?', [
      { text: 'No' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => accion('cancelar', () => cancelarActividad(id)) },
    ]);

  const manual = (ins) =>
    Alert.alert('Asistencia manual', `¿Registrar la asistencia de ${ins.voluntario.nombre} por la duración completa de la actividad?`, [
      { text: 'No' },
      { text: 'Registrar', onPress: () => accion(`man-${ins.id}`, () => asistenciaManual(ins.id)) },
    ]);

  if (cargando && !datos) return <Cargando />;
  if (error && !datos) return <MensajeError texto={error} onReintentar={recargar} />;
  if (!datos) return null;

  const { actividad: act, inscriptos, asistencias } = datos;
  const asistenciaDe = (insId) => asistencias.find((a) => a.inscripcionId === insId);
  const activa = act.estado === 'publicada';

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido} refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}>
      <Titulo>{act.titulo}</Titulo>
      <EstadoBadge estado={act.estado} />
      <TextoSuave estilo={{ marginTop: espacio.s }}>{rangoFechas(act.fechaInicio, act.fechaFin)}</TextoSuave>
      <TextoSuave>
        {act.inscriptos} inscriptos · cupo {act.cupo}
      </TextoSuave>

      {activa ? (
        <View style={styles.acciones}>
          <Boton titulo="Mostrar QR de asistencia" onPress={() => navigation.navigate('MostrarQR', { id, titulo: act.titulo })} />
          <Boton titulo="Editar" variante="borde" onPress={() => navigation.navigate('ActividadForm', { id })} />
          <Boton
            titulo="Publicar en la comunidad"
            variante="borde"
            onPress={() => navigation.navigate('Feed', { proyectoId: id, titulo: act.titulo, organizacionId: act.organizacionId })}
          />
          <Boton titulo="Cancelar actividad" variante="peligro" onPress={confirmarCancelacion} cargando={ocupado === 'cancelar'} />
        </View>
      ) : null}

      <Subtitulo>Inscriptos ({inscriptos.length})</Subtitulo>
      {inscriptos.length === 0 ? <TextoSuave>Todavía no hay inscriptos.</TextoSuave> : null}
      {inscriptos.map((ins) => {
        const asis = asistenciaDe(ins.id);
        return (
          <Tarjeta key={ins.id}>
            <View style={styles.cabecera}>
              <Text style={styles.nombre}>
                {ins.voluntario.nombre} {ins.voluntario.apellido}
              </Text>
              <EstadoBadge estado={ins.estado} />
            </View>
            {ins.voluntario.telefono ? <TextoSuave>📞 {ins.voluntario.telefono}</TextoSuave> : null}
            {ins.voluntario.esJudicial ? <TextoSuave>Programa judicial</TextoSuave> : null}
            {asis ? (
              <TextoSuave>
                Asistencia: {asis.estado === 'validada' ? `validada (${asis.horas} h)` : `entrada ${fechaHora(asis.checkIn)}, sin validar`}
              </TextoSuave>
            ) : null}

            {ins.estado === 'pendiente' ? (
              <View style={styles.fila}>
                <Boton titulo="Aceptar" estilo={styles.mitad} onPress={() => accion(`ac-${ins.id}`, () => cambiarEstadoInscripcion(ins.id, 'aceptada'))} cargando={ocupado === `ac-${ins.id}`} />
                <Boton titulo="Rechazar" variante="peligro" estilo={styles.mitad} onPress={() => accion(`re-${ins.id}`, () => cambiarEstadoInscripcion(ins.id, 'rechazada'))} cargando={ocupado === `re-${ins.id}`} />
              </View>
            ) : null}
            {ins.estado === 'aceptada' && !asis ? (
              <Boton titulo="Registrar asistencia manual" variante="borde" onPress={() => manual(ins)} cargando={ocupado === `man-${ins.id}`} />
            ) : null}
            {asis && asis.estado === 'abierta' ? (
              <Boton titulo="Validar asistencia (registra la salida)" variante="secundario" onPress={() => accion(`val-${asis.id}`, () => validarAsistencia(asis.id))} cargando={ocupado === `val-${asis.id}`} />
            ) : null}
          </Tarjeta>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.l },
  acciones: { marginTop: espacio.m },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: espacio.s, marginBottom: espacio.xs },
  nombre: { flex: 1, fontSize: 16, fontWeight: '600', color: colores.texto },
  fila: { flexDirection: 'row', gap: espacio.s },
  mitad: { flex: 1 },
});
