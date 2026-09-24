import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Pantalla from '../../components/Pantalla';
import { Boton, Campo, Chip, MensajeError, TextoSuave, Titulo } from '../../components/ui';
import { publicar } from '../../api/comunidad';
import { mensajeDeError } from '../../api/client';

export default function PublicarScreen({ route, navigation }) {
  const { proyectoId, titulo } = route.params;
  const [tipo, setTipo] = useState('post');
  const [contenido, setContenido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async () => {
    if (!contenido.trim()) return setError('Escribí el contenido');
    setEnviando(true);
    setError(null);
    try {
      await publicar(proyectoId, { tipo, contenido: contenido.trim() });
      navigation.goBack();
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  };

  return (
    <Pantalla>
      <Titulo>{titulo}</Titulo>
      <MensajeError texto={error} />
      <View style={styles.tipos}>
        <Chip texto="Publicación" activo={tipo === 'post'} onPress={() => setTipo('post')} />
        <Chip texto="📣 Convocatoria express" activo={tipo === 'convocatoria'} onPress={() => setTipo('convocatoria')} />
      </View>
      <Campo etiqueta="Contenido" value={contenido} onChangeText={setContenido} multiline maxLength={2000} />
      <TextoSuave>{contenido.length}/2000 · Es público: no incluyas datos personales de voluntarios.</TextoSuave>
      <Boton titulo="Publicar" onPress={enviar} cargando={enviando} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({ tipos: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 } });
