import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Boton, Cargando, EstadoBadge, MensajeError, Tarjeta, TextoSuave, Vacio } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { cancelarInscripcion, descargarCertificado, misInscripciones } from '../../api/inscripciones';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';
import { rangoFechas } from '../../utils/formato';

export default function MisInscripcionesScreen({ navigation }) {
  const { datos, cargando, error, recargar } = useCarga(() => misInscripciones({ limit: 50 }), []);
  const [ocupado, setOcupado] = useState(null);

  const cancelar = (ins) => {
    Alert.alert('Cancelar inscripción', `¿Seguro que querés cancelar tu inscripción a "${ins.actividad.titulo}"?`, [
      { text: 'No' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          setOcupado(ins.id);
          try {
            await cancelarInscripcion(ins.id);
            recargar();
          } catch (e) {
            Alert.alert('No se pudo cancelar', mensajeDeError(e));
          } finally {
            setOcupado(null);
          }
        },
      },
    ]);
  };

  const certificado = async (ins) => {
    setOcupado(ins.id);
    try {
      const bytes = await descargarCertificado(ins.id);
      const archivo = new File(Paths.cache, `certificado-${ins.id}.pdf`);
      archivo.create({ overwrite: true });
      archivo.write(new Uint8Array(bytes));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(archivo.uri, { mimeType: 'application/pdf', dialogTitle: 'Certificado de participación' });
      } else {
        Alert.alert('Certificado descargado', archivo.uri);
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        status === 409
          ? 'Todavía no hay una asistencia validada para esta actividad.'
          : status === 403
            ? 'No tenés permiso para descargar este certificado.'
            : mensajeDeError(e);
      Alert.alert('Certificado', msg);
    } finally {
      setOcupado(null);
    }
  };

  if (cargando && !datos) return <Cargando />;

  return (
    <View style={styles.contenedor}>
      <MensajeError texto={error} onReintentar={recargar} />
      <FlatList
        data={datos?.data || []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        ListEmptyComponent={<Vacio texto="Todavía no te inscribiste a ninguna actividad." />}
        renderItem={({ item: ins }) => (
          <Tarjeta>
            <View style={styles.cabecera}>
              <Text style={styles.titulo}>{ins.actividad.titulo}</Text>
              <EstadoBadge estado={ins.estado} />
            </View>
            <TextoSuave>{rangoFechas(ins.actividad.fechaInicio, ins.actividad.fechaFin)}</TextoSuave>
            {ins.estado === 'aceptada' ? (
              <>
                <Boton
                  titulo="Marcar asistencia (escanear QR)"
                  onPress={() => navigation.navigate('EscanearQR', { actividadId: ins.actividadId, titulo: ins.actividad.titulo })}
                />
                <Boton titulo="Descargar certificado" variante="borde" onPress={() => certificado(ins)} cargando={ocupado === ins.id} />
              </>
            ) : null}
            {['pendiente', 'aceptada'].includes(ins.estado) ? (
              <Boton titulo="Cancelar inscripción" variante="peligro" onPress={() => cancelar(ins)} deshabilitado={ocupado === ins.id} />
            ) : null}
          </Tarjeta>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: espacio.l, flexGrow: 1 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: espacio.s, marginBottom: espacio.xs },
  titulo: { flex: 1, fontSize: 16, fontWeight: '600', color: colores.texto },
});
