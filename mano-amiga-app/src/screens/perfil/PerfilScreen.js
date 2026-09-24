import { StyleSheet, Text, View } from 'react-native';
import Pantalla from '../../components/Pantalla';
import { Boton, Cargando, MensajeError, Subtitulo, Tarjeta, TextoSuave, Titulo } from '../../components/ui';
import { useCarga } from '../../hooks/useCarga';
import { useAuth } from '../../hooks/useAuth';
import { misHoras, obtenerPerfil } from '../../api/usuarios';
import { colores, espacio } from '../../constants/tema';

const nombreRol = { voluntario: 'Voluntario/a', coordinador: 'Coordinador/a', admin: 'Administrador/a' };

/**
 * Perfil básico (Sprint 1). En el Sprint 2 (R8) se agregan: editar datos de contacto,
 * cambiar contraseña, modo oscuro e historial de inicios de sesión.
 */
export default function PerfilScreen() {
  const { logout } = useAuth();
  const { datos, cargando, error, recargar } = useCarga(async () => {
    const perfil = await obtenerPerfil();
    const horas = perfil.esJudicial ? await misHoras() : null;
    return { perfil, horas };
  }, []);

  if (cargando && !datos) return <Cargando />;

  const p = datos?.perfil;
  return (
    <Pantalla>
      <MensajeError texto={error} onReintentar={recargar} />
      {p ? (
        <>
          <Titulo>
            {p.nombre} {p.apellido}
          </Titulo>
          <TextoSuave>{nombreRol[p.rol]}</TextoSuave>
          <Tarjeta estilo={{ marginTop: espacio.l }}>
            <Text style={styles.dato}>✉️ {p.email}</Text>
            <Text style={styles.dato}>📞 {p.telefono || 'Sin teléfono'}</Text>
          </Tarjeta>
          {datos.horas ? (
            <>
              <Subtitulo>Horas de trabajo comunitario</Subtitulo>
              <Tarjeta>
                <View style={styles.horas}>
                  <Horas valor={datos.horas.horasCumplidas} texto="cumplidas" />
                  <Horas valor={datos.horas.horasRestantes} texto="restantes" />
                  <Horas valor={datos.horas.horasAsignadas} texto="asignadas" />
                </View>
                <TextoSuave>Solo cuentan las asistencias validadas por un coordinador.</TextoSuave>
              </Tarjeta>
            </>
          ) : null}
        </>
      ) : null}
      <Boton titulo="Cerrar sesión" variante="peligro" onPress={logout} estilo={{ marginTop: espacio.xl }} />
    </Pantalla>
  );
}

function Horas({ valor, texto }) {
  return (
    <View style={styles.horaItem}>
      <Text style={styles.horaNumero}>{valor}</Text>
      <TextoSuave>{texto}</TextoSuave>
    </View>
  );
}

const styles = StyleSheet.create({
  dato: { fontSize: 15, marginBottom: espacio.xs, color: colores.texto },
  horas: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: espacio.m },
  horaItem: { alignItems: 'center' },
  horaNumero: { fontSize: 26, fontWeight: '700', color: colores.primario },
});
