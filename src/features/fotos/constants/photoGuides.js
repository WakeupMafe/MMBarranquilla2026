import bipodalFrente from "../../../assets/bipodalFrente.svg";
import bipodalLado from "../../../assets/bipodalLado.svg";

import unipodalFrenteDerecha from "../../../assets/unipodalFrenteDerecha.svg";
import unipodalFrenteIzquierda from "../../../assets/unipodalFrenteIzquierda.svg";

import unipodalLadoDerecha from "../../../assets/unipodalLadoDerecha.svg";
import unipodalLadoIzquierda from "../../../assets/unipodalLadoIzquierda.svg";

import asimetricaFrenteDerecha from "../../../assets/asimetricaFrenteDerecha.svg";
import asimetricaFrenteIzquierda from "../../../assets/asimetricaFrenteIzquierda.svg";

import asimetricaLadoDerecha from "../../../assets/asimetricaLadoDerecha.svg";
import asimetricaLadoIzquierda from "../../../assets/asimetricaLadoIzquierda.svg";

import rodillaLado from "../../../assets/rodilla_lado.svg";
import rodillaSuperior from "../../../assets/rodilla_superior.svg";

import frenteElevacionAbierta from "../../../assets/frenteEleacionAbierta.png";
import frenteElevacionNormal from "../../../assets/frenteElevacionNormal.png";
import hombroLadoConBaston from "../../../assets/hombroLateraLado.png";

export const PHOTO_GUIDES = {
  bipodal_frente: bipodalFrente,
  bipodal_lado: bipodalLado,

  unipodal_frente_derecha: unipodalFrenteDerecha,
  unipodal_frente_izquierda: unipodalFrenteIzquierda,

  unipodal_lado_derecha: unipodalLadoDerecha,
  unipodal_lado_izquierda: unipodalLadoIzquierda,

  asimetrica_frente_derecha: asimetricaFrenteDerecha,
  asimetrica_frente_izquierda: asimetricaFrenteIzquierda,

  asimetrica_lado_derecha: asimetricaLadoDerecha,
  asimetrica_lado_izquierda: asimetricaLadoIzquierda,

  rodilla_lado: rodillaLado,
  rodilla_superior: rodillaSuperior,

  hombro_frente_baston_arriba: frenteElevacionNormal,
  hombro_frente_agarre_variable: frenteElevacionAbierta,

  // reutiliza la misma guía de bipodal_lado
  hombro_lado_sin_elevacion_baston: bipodalLado,

  // imagen nueva de hombro con elevación
  hombro_lado_con_elevacion_baston: hombroLadoConBaston,
};
