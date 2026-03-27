import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import logoWakeup from "../../../assets/LogoWakeup.png";
import useProfesionalSession from "../../../shared/hooks/useProfesionalSession";
import { alertError } from "../../../shared/lib/alerts";
import UploadModeControl from "./UploadModeControl";

import {
  FOTO_UPLOAD_MODES,
  setFotosUploadMode,
} from "../../../shared/lib/fotosUploadMode";
import {
  CHECKIN_UPLOAD_MODES,
  setCheckinUploadMode,
} from "../../../shared/lib/checkinUploadMode";
import {
  ANAMNESIS_GLOBAL_UPLOAD_MODES,
  setAnamnesisGlobalUploadMode,
} from "../../../shared/lib/anamnesisGlobalUploadMode";
import {
  MODULO_OBESIDAD_UPLOAD_MODES,
  setModuloObesidadUploadMode,
} from "../../../shared/lib/moduloObesidadUploadMode";
import {
  CADERA_UPLOAD_MODES,
  setCaderaUploadMode,
} from "../../../shared/lib/caderaUploadMode";
import {
  HOMBRO_UPLOAD_MODES,
  setHombroUploadMode,
} from "../../../shared/lib/hombroUploadMode";

const CEDULA_ADMIN_FOTOS = "1037670182";

export default function FotosAdminMode() {
  const navigate = useNavigate();
  const { profesional } = useProfesionalSession();

  const [fotoMode] = useState(FOTO_UPLOAD_MODES.REAL);
  const [checkinMode] = useState(CHECKIN_UPLOAD_MODES.REAL);
  const [anamnesisGlobalMode] = useState(ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL);
  const [moduloObesidadMode] = useState(MODULO_OBESIDAD_UPLOAD_MODES.REAL);
  const [caderaMode] = useState(CADERA_UPLOAD_MODES.REAL);
  const [hombroMode] = useState(HOMBRO_UPLOAD_MODES.REAL);

  const cedulaProfesional = useMemo(() => {
    return String(profesional?.cedula || "").trim();
  }, [profesional]);

  const isAuthorized = cedulaProfesional === CEDULA_ADMIN_FOTOS;

  useEffect(() => {
    setFotosUploadMode(FOTO_UPLOAD_MODES.REAL);
    setCheckinUploadMode(CHECKIN_UPLOAD_MODES.REAL);
    setAnamnesisGlobalUploadMode(ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL);
    setModuloObesidadUploadMode(MODULO_OBESIDAD_UPLOAD_MODES.REAL);
    setCaderaUploadMode(CADERA_UPLOAD_MODES.REAL);
    setHombroUploadMode(HOMBRO_UPLOAD_MODES.REAL);

    console.log("✅ Modos forzados a REAL desde código");
  }, []);

  useEffect(() => {
    if (!profesional) return;

    if (!isAuthorized) {
      alertError(
        "Acceso restringido",
        "No tienes permisos para ingresar a este módulo.",
      ).then(() => {
        navigate("/herramientas", { replace: true });
      });
    }
  }, [profesional, isAuthorized, navigate]);

  if (!profesional || !isAuthorized) {
    return null;
  }

  return (
    <div className="valoracionShell">
      <TopHeader
        userName={profesional?.nombre || "Profesional"}
        onLogout={() => navigate("/")}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <section className="valoracionHero">
          <h1 className="valoracionTitle">Control de envío</h1>
          <p className="valoracionSubtitle">
            Módulo privado para activar o desactivar el envío a base de datos.
          </p>
        </section>

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">Estado actual</h2>
            <p className="valoracionCardDescription">
              Cédula autorizada: <strong>{CEDULA_ADMIN_FOTOS}</strong>
            </p>
          </div>

          <div className="valoracionPacienteCard" style={{ marginBottom: 16 }}>
            <ul className="valoracionPacienteList">
              <li>
                <strong>Profesional actual:</strong> {profesional?.nombre || ""}{" "}
                {profesional?.apellido || ""}
              </li>
              <li>
                <strong>Cédula:</strong> {cedulaProfesional}
              </li>
              <li>
                <strong>Modo fotos:</strong> ENVÍO REAL A BASE DE DATOS
              </li>
              <li>
                <strong>Modo check-in:</strong> ENVÍO REAL A BASE DE DATOS
              </li>
              <li>
                <strong>Modo anamnesis global:</strong> ENVÍO REAL A BASE DE
                DATOS
              </li>
              <li>
                <strong>Modo cadera:</strong> ENVÍO REAL A BASE DE DATOS
              </li>
              <li>
                <strong>Modo módulo obesidad:</strong> ENVÍO REAL A BASE DE
                DATOS
              </li>
              <li>
                <strong>Modo hombro:</strong> ENVÍO REAL A BASE DE DATOS
              </li>
            </ul>
          </div>

          <UploadModeControl
            title="Control de fotos"
            mode={fotoMode}
            realValue={FOTO_UPLOAD_MODES.REAL}
            simulationValue={FOTO_UPLOAD_MODES.SIMULACION}
            onChange={() => {}}
            realLabel="Activar envío real fotos"
            simulationLabel="Activar simulación fotos"
          />

          <UploadModeControl
            title="Control de check-in"
            mode={checkinMode}
            realValue={CHECKIN_UPLOAD_MODES.REAL}
            simulationValue={CHECKIN_UPLOAD_MODES.SIMULACION}
            onChange={() => {}}
            realLabel="Activar envío real check-in"
            simulationLabel="Activar simulación check-in"
          />

          <UploadModeControl
            title="Control de anamnesis global"
            mode={anamnesisGlobalMode}
            realValue={ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL}
            simulationValue={ANAMNESIS_GLOBAL_UPLOAD_MODES.SIMULACION}
            onChange={() => {}}
            realLabel="Activar envío real anamnesis global"
            simulationLabel="Activar simulación anamnesis global"
          />

          <UploadModeControl
            title="Control de módulo obesidad"
            mode={moduloObesidadMode}
            realValue={MODULO_OBESIDAD_UPLOAD_MODES.REAL}
            simulationValue={MODULO_OBESIDAD_UPLOAD_MODES.SIMULACION}
            onChange={() => {}}
            realLabel="Activar envío real módulo obesidad"
            simulationLabel="Activar simulación módulo obesidad"
          />

          <UploadModeControl
            title="Control de cadera"
            mode={caderaMode}
            realValue={CADERA_UPLOAD_MODES.REAL}
            simulationValue={CADERA_UPLOAD_MODES.SIMULACION}
            onChange={() => {}}
            realLabel="Activar envío real cadera"
            simulationLabel="Activar simulación cadera"
          />

          <UploadModeControl
            title="Control de hombro"
            mode={hombroMode}
            realValue={HOMBRO_UPLOAD_MODES.REAL}
            simulationValue={HOMBRO_UPLOAD_MODES.SIMULACION}
            onChange={() => {}}
            realLabel="Activar envío real hombro"
            simulationLabel="Activar simulación hombro"
          />

          <div style={{ marginTop: 16 }}>
            <BotonImportante
              type="button"
              variant="ghost"
              onClick={() => navigate("/herramientas")}
            >
              ← Volver a herramientas
            </BotonImportante>
          </div>
        </section>
      </main>
    </div>
  );
}
