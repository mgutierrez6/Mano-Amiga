import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { colores, espacio } from '../constants/tema';

/** Contenedor estándar de pantallas con formulario o contenido que scrollea. */
export default function Pantalla({ children, scroll = true, estilo }) {
  const contenido = scroll ? (
    <ScrollView contentContainerStyle={[styles.contenido, estilo]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.contenido, styles.flex, estilo]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.flex, { backgroundColor: colores.fondo }]}>{contenido}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: espacio.l },
});
