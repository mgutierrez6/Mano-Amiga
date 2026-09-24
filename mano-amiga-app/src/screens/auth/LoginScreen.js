import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import { Boton, Campo, MensajeError } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { mensajeDeError } from '../../api/client';
import { colores, espacio } from '../../constants/tema';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const ingresar = async () => {
    if (!email || !password) return setError('Completá email y contraseña');
    setEnviando(true);
    setError(null);
    try {
      await login(email, password);
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  };

  return (
    <Pantalla estilo={styles.contenedor}>
      <View style={styles.marca}>
        <Text style={styles.logo}>🤝</Text>
        <Text style={styles.nombre}>Mano Amiga</Text>
        <Text style={styles.lema}>Voluntariado y donaciones, organizados</Text>
      </View>
      <MensajeError texto={error} />
      <Campo etiqueta="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Campo etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
      <Boton titulo="Ingresar" onPress={ingresar} cargando={enviando} />
      <Boton titulo="Crear una cuenta" variante="borde" onPress={() => navigation.navigate('Registro')} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, justifyContent: 'center' },
  marca: { alignItems: 'center', marginBottom: espacio.xl },
  logo: { fontSize: 56 },
  nombre: { fontSize: 28, fontWeight: '700', color: colores.primario },
  lema: { color: colores.textoSuave, marginTop: espacio.xs },
});
