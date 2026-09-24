import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colores, espacio, radio } from '../constants/tema';
import { fechaHora } from '../utils/formato';

/**
 * Selector de fecha y hora. En Android abre primero la fecha y después la hora (API imperativa);
 * en iOS muestra el selector "datetime" en línea.
 */
export default function FechaHoraInput({ etiqueta, valor, onChange }) {
  const [mostrarIOS, setMostrarIOS] = useState(false);

  const abrir = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: valor,
        mode: 'date',
        onChange: (evento, fecha) => {
          if (evento.type !== 'set' || !fecha) return;
          DateTimePickerAndroid.open({
            value: fecha,
            mode: 'time',
            is24Hour: true,
            onChange: (ev2, conHora) => {
              if (ev2.type === 'set' && conHora) onChange(conHora);
            },
          });
        },
      });
    } else {
      setMostrarIOS((v) => !v);
    }
  };

  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Pressable onPress={abrir} style={styles.input}>
        <Text style={styles.valor}>{fechaHora(valor)}</Text>
      </Pressable>
      {Platform.OS === 'ios' && mostrarIOS ? (
        <DateTimePicker value={valor} mode="datetime" display="inline" onChange={(e, fecha) => fecha && onChange(fecha)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { marginBottom: espacio.m },
  etiqueta: { fontSize: 14, color: colores.textoSuave, marginBottom: espacio.xs },
  input: { borderWidth: 1, borderColor: colores.borde, borderRadius: radio, padding: espacio.m, backgroundColor: colores.blanco },
  valor: { fontSize: 16, color: colores.texto },
});
