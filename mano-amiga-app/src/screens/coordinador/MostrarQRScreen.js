import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Cargando, MensajeError, TextoSuave } from '../../components/ui';
import { obtenerQR } from '../../api/asistencias';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';

const RENOVAR_CADA_MS = 50 * 1000; // el QR vence a los 60 s: lo renovamos un poco antes

/** El coordinador muestra este QR y los voluntarios lo escanean para marcar la entrada (2.3). */
export default function MostrarQRScreen({ route }) {
  const { id, titulo } = route.params;
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const vence = useRef(0);

  const renovar = useCallback(async () => {
    try {
      const r = await obtenerQR(id);
      setQr(r.qr);
      vence.current = new Date(r.expiraEn).getTime();
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, [id]);

  useEffect(() => {
    renovar();
    const renovacion = setInterval(renovar, RENOVAR_CADA_MS);
    const reloj = setInterval(() => setSegundos(Math.max(0, Math.round((vence.current - Date.now()) / 1000))), 1000);
    return () => {
      clearInterval(renovacion);
      clearInterval(reloj);
    };
  }, [renovar]);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      <MensajeError texto={error} onReintentar={renovar} />
      {!qr && !error ? <Cargando /> : null}
      {qr ? (
        <View style={styles.qr}>
          <QRCode value={qr} size={260} />
        </View>
      ) : null}
      {qr ? <TextoSuave estilo={styles.centrado}>Se renueva solo · vence en {segundos} s</TextoSuave> : null}
      <TextoSuave estilo={styles.centrado}>
        Los voluntarios aceptados lo escanean desde "Mis inscripciones". Al terminar, validá cada asistencia en la pantalla anterior.
      </TextoSuave>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo, padding: espacio.l, alignItems: 'center' },
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: espacio.l, textAlign: 'center', color: colores.texto },
  qr: { padding: espacio.l, backgroundColor: colores.blanco, borderRadius: 16 },
  centrado: { textAlign: 'center', marginTop: espacio.m },
});
