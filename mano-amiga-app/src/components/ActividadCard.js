import { StyleSheet, Text, View } from 'react-native';
import { Chip, EstadoBadge, Tarjeta, TextoSuave } from './ui';
import { colores, espacio } from '../constants/tema';
import { rangoFechas } from '../utils/formato';

export default function ActividadCard({ actividad, onPress, mostrarEstado = false }) {
  return (
    <Tarjeta onPress={onPress}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo} numberOfLines={2}>
          {actividad.titulo}
        </Text>
        {mostrarEstado ? <EstadoBadge estado={actividad.estado} /> : null}
      </View>
      <TextoSuave>{actividad.organizacion?.nombre}</TextoSuave>
      <TextoSuave>{rangoFechas(actividad.fechaInicio, actividad.fechaFin)}</TextoSuave>
      {actividad.direccion ? <TextoSuave>📍 {actividad.direccion}</TextoSuave> : null}
      <Text style={styles.cupos}>
        {actividad.cuposLibres} {actividad.cuposLibres === 1 ? 'lugar libre' : 'lugares libres'} de {actividad.cupo}
      </Text>
      {actividad.etiquetas?.length ? (
        <View style={styles.etiquetas}>
          {actividad.etiquetas.map((e) => (
            <Chip key={e.id} texto={e.nombre} />
          ))}
        </View>
      ) : null}
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: espacio.s },
  titulo: { flex: 1, fontSize: 17, fontWeight: '600', color: colores.texto, marginBottom: espacio.xs },
  cupos: { marginTop: espacio.s, color: colores.primario, fontWeight: '600' },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', marginTop: espacio.s },
});
