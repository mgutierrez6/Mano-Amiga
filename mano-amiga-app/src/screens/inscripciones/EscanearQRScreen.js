import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Boton, Cargando, TextoSuave } from '../../components/ui';
import { registrarAsistenciaQR } from '../../api/asistencias';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';

/**
 * El voluntario escanea el QR que muestra el coordinador (2.3).
 * El QR es un código firmado por el servidor que vence a los 60 s: la app solo lo reenvía,
 * la validación la hace la API.
 */
export default function EscanearQRScreen({ route, navigation }) {
  const { actividadId, titulo } = route.params;
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [estado, setEstado] = useState('escaneando'); // escaneando | enviando | ok | error
  const [mensaje, setMensaje] = useState('');
  const bloqueado = useRef(false); // evita mandar el mismo QR varias veces

  const alEscanear = async ({ data }) => {
    if (bloqueado.current) return;
    bloqueado.current = true;
    setEstado('enviando');
    try {
      await registrarAsistenciaQR(actividadId, data);
      setEstado('ok');
      setMensaje('¡Asistencia registrada! El coordinador la va a validar al terminar la actividad.');
    } catch (e) {
      setEstado('error');
      setMensaje(mensajeDeError(e));
    }
  };

  const reintentar = () => {
    bloqueado.current = false;
    setEstado('escaneando');
    setMensaje('');
  };

  if (!permiso) return <Cargando />;
  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>Necesitamos la cámara para escanear el código QR de asistencia.</Text>
        <Boton titulo="Permitir cámara" onPress={pedirPermiso} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      {estado === 'escaneando' || estado === 'enviando' ? (
        <View style={styles.camaraMarco}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={estado === 'escaneando' ? alEscanear : undefined}
          />
        </View>
      ) : null}
      {estado === 'enviando' ? <TextoSuave estilo={styles.centrado}>Registrando…</TextoSuave> : null}
      {estado === 'escaneando' ? <TextoSuave estilo={styles.centrado}>Apuntá al código QR que muestra el coordinador.</TextoSuave> : null}
      {estado === 'ok' || estado === 'error' ? (
        <View style={styles.resultado}>
          <Text style={[styles.texto, { color: estado === 'ok' ? colores.primario : colores.peligro }]}>{mensaje}</Text>
          {estado === 'error' ? <Boton titulo="Escanear de nuevo" onPress={reintentar} /> : null}
          <Boton titulo="Volver" variante="borde" onPress={() => navigation.goBack()} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo, padding: espacio.l },
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: espacio.m, color: colores.texto },
  camaraMarco: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  centrado: { textAlign: 'center', marginTop: espacio.m },
  centro: { flex: 1, justifyContent: 'center', padding: espacio.xl },
  texto: { fontSize: 16, textAlign: 'center', marginBottom: espacio.m },
  resultado: { marginTop: espacio.xl },
});
