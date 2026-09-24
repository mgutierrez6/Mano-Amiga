import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colores, coloresEstado, espacio, radio } from '../constants/tema';
import { estadoTexto } from '../utils/formato';

/** Botón principal. variante: 'primario' | 'secundario' | 'peligro' | 'borde' */
export function Boton({ titulo, onPress, variante = 'primario', cargando = false, deshabilitado = false, estilo }) {
  const fondo = { primario: colores.primario, secundario: colores.secundario, peligro: colores.peligro, borde: 'transparent' }[variante];
  const colorTexto = variante === 'borde' ? colores.primario : colores.blanco;
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondo, opacity: inactivo ? 0.5 : pressed ? 0.8 : 1 },
        variante === 'borde' && styles.botonBorde,
        estilo,
      ]}
    >
      {cargando ? <ActivityIndicator color={colorTexto} /> : <Text style={[styles.botonTexto, { color: colorTexto }]}>{titulo}</Text>}
    </Pressable>
  );
}

/** Campo de texto con etiqueta y mensaje de error opcional. */
export function Campo({ etiqueta, error, ...props }) {
  return (
    <View style={styles.campo}>
      {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}
      <TextInput placeholderTextColor={colores.textoSuave} style={[styles.input, props.multiline && styles.inputMultilinea, error && styles.inputError]} {...props} />
      {error ? <Text style={styles.textoError}>{error}</Text> : null}
    </View>
  );
}

export function Tarjeta({ children, onPress, estilo }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.85 }, estilo]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.tarjeta, estilo]}>{children}</View>;
}

export function Chip({ texto, activo = false, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.chip, activo && styles.chipActivo]}>
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

export function EstadoBadge({ estado }) {
  return (
    <View style={[styles.badge, { backgroundColor: coloresEstado[estado] || colores.textoSuave }]}>
      <Text style={styles.badgeTexto}>{estadoTexto[estado] || estado}</Text>
    </View>
  );
}

export function Cargando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
    </View>
  );
}

export function MensajeError({ texto, onReintentar }) {
  if (!texto) return null;
  return (
    <View style={styles.error}>
      <Text style={styles.errorTexto}>{texto}</Text>
      {onReintentar ? <Boton titulo="Reintentar" variante="borde" onPress={onReintentar} /> : null}
    </View>
  );
}

export function Vacio({ texto }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.textoSuave}>{texto}</Text>
    </View>
  );
}

export function Titulo({ children }) {
  return <Text style={styles.titulo}>{children}</Text>;
}

export function Subtitulo({ children }) {
  return <Text style={styles.subtitulo}>{children}</Text>;
}

export function TextoSuave({ children, estilo }) {
  return <Text style={[styles.textoSuave, estilo]}>{children}</Text>;
}

const styles = StyleSheet.create({
  boton: { paddingVertical: espacio.m, paddingHorizontal: espacio.l, borderRadius: radio, alignItems: 'center', marginVertical: espacio.xs },
  botonBorde: { borderWidth: 1, borderColor: colores.primario },
  botonTexto: { fontWeight: '600', fontSize: 16 },
  campo: { marginBottom: espacio.m },
  etiqueta: { fontSize: 14, color: colores.textoSuave, marginBottom: espacio.xs },
  input: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio,
    padding: espacio.m,
    fontSize: 16,
    backgroundColor: colores.blanco,
    color: colores.texto,
  },
  inputMultilinea: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: colores.peligro },
  textoError: { color: colores.peligro, marginTop: espacio.xs },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: radio,
    padding: espacio.l,
    marginBottom: espacio.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chip: {
    paddingHorizontal: espacio.m,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginRight: espacio.s,
    marginBottom: espacio.s,
    backgroundColor: colores.blanco,
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { color: colores.texto, fontSize: 13 },
  chipTextoActivo: { color: colores.blanco },
  badge: { alignSelf: 'flex-start', paddingHorizontal: espacio.s, paddingVertical: 2, borderRadius: 8 },
  badgeTexto: { color: colores.blanco, fontSize: 12, fontWeight: '600' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espacio.xl },
  error: { backgroundColor: '#FDECEA', padding: espacio.m, borderRadius: radio, marginBottom: espacio.m },
  errorTexto: { color: colores.peligro, marginBottom: espacio.xs },
  titulo: { fontSize: 22, fontWeight: '700', color: colores.texto, marginBottom: espacio.s },
  subtitulo: { fontSize: 17, fontWeight: '600', color: colores.texto, marginTop: espacio.l, marginBottom: espacio.s },
  textoSuave: { color: colores.textoSuave, fontSize: 14 },
});
