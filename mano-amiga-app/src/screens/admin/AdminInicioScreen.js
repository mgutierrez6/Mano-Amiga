import Pantalla from '../../components/Pantalla';
import { Tarjeta, TextoSuave, Titulo } from '../../components/ui';

/** Panel de administración: se implementa en el Sprint 2 (R7 + RS5 + RS9). */
export default function AdminInicioScreen() {
  return (
    <Pantalla>
      <Titulo>Panel de administración</Titulo>
      <Tarjeta>
        <TextoSuave>
          En el próximo sprint vas a poder dar de alta y de baja organizaciones y coordinadores, asignar la condición de voluntario judicial y
          consultar las horas cumplidas. Cada acción va a pedir reautenticación y va a quedar en la auditoría.
        </TextoSuave>
      </Tarjeta>
    </Pantalla>
  );
}
