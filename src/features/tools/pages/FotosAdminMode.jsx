import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import logoWakeup from "../../../assets/LogoWakeup.png";
import useProfesionalSession from "../../../shared/hooks/useProfesionalSession";
import { alertError, alertOk } from "../../../shared/lib/alerts";
import UploadModeControl from "./UploadModeControl";

import {
  FOTO_UPLOAD_MODES,
  getFotosUploadMode,
  setFotosUploadMode,
} from "../../../shared/lib/fotosUploadMode";
import {
  CHECKIN_UPLOAD_MODES,
  getCheckinUploadMode,
  setCheckinUploadMode,
} from "../../../shared/lib/checkinUploadMode";
import {
  ANAMNESIS_GLOBAL_UPLOAD_MODES,
  getAnamnesisGlobalUploadMode,
  setAnamnesisGlobalUploadMode,
} from "../../../shared/lib/anamnesisGlobalUploadMode";
import {
  MODULO_OBESIDAD_UPLOAD_MODES,
  getModuloObesidadUploadMode,
  setModuloObesidadUploadMode,
} from "../../../shared/lib/moduloObesidadUploadMode";
import {
  CADERA_UPLOAD_MODES,
  getCaderaUploadMode,
  setCaderaUploadMode,
} from "../../../shared/lib/caderaUploadMode";

import {
  HOMBRO_UPLOAD_MODES,
  getHombroUploadMode,
  setHombroUploadMode,
} from "../../../shared/lib/hombroUploadMode";

const CEDULA_ADMIN_FOTOS = "1037670182";

export default function FotosAdminMode() {
  const navigate = useNavigate();
  const { profesional } = useProfesionalSession();

  const [fotoMode, setFotoMode] = useState(FOTO_UPLOAD_MODES.SIMULACION);
  const [checkinMode, setCheckinMode] = useState(
    CHECKIN_UPLOAD_MODES.SIMULACION,
  );
  const [anamnesisGlobalMode, setAnamnesisGlobalMode] = useState(
    ANAMNESIS_GLOBAL_UPLOAD_MODES.SIMULACION,
  );
  const [moduloObesidadMode, setModuloObesidadMode] = useState(
    MODULO_OBESIDAD_UPLOAD_MODES.SIMULACION,
  );
  const [caderaMode, setCaderaMode] = useState(CADERA_UPLOAD_MODES.SIMULACION);
  const [hombroMode, setHombroMode] = useState(HOMBRO_UPLOAD_MODES.SIMULACION);

  const cedulaProfesional = useMemo(() => {
    return String(profesional?.cedula || "").trim();
  }, [profesional]);

  const isAuthorized = cedulaProfesional === CEDULA_ADMIN_FOTOS;

  useEffect(() => {
    setFotoMode(getFotosUploadMode());
    setCheckinMode(getCheckinUploadMode());
    setAnamnesisGlobalMode(getAnamnesisGlobalUploadMode());
    setModuloObesidadMode(getModuloObesidadUploadMode());
    setCaderaMode(getCaderaUploadMode());
    setHombroMode(getHombroUploadMode());
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

  async function handleSetFotoMode(newMode) {
    setFotosUploadMode(newMode);
    setFotoMode(newMode);

    await alertOk(
      "Modo de fotos actualizado",
      newMode === FOTO_UPLOAD_MODES.REAL
        ? "El envío real de fotos a base de datos quedó ACTIVADO."
        : "La simulación de fotos quedó ACTIVADA. No se enviarán fotos a base de datos.",
    );
  }

  async function handleSetCheckinMode(newMode) {
    setCheckinUploadMode(newMode);
    setCheckinMode(newMode);

    await alertOk(
      "Modo de check-in actualizado",
      newMode === CHECKIN_UPLOAD_MODES.REAL
        ? "El envío real de check-in a base de datos quedó ACTIVADO."
        : "La simulación de check-in quedó ACTIVADA. No se enviará información a base de datos.",
    );
  }

  async function handleSetAnamnesisGlobalMode(newMode) {
    setAnamnesisGlobalUploadMode(newMode);
    setAnamnesisGlobalMode(newMode);

    await alertOk(
      "Modo de anamnesis global actualizado",
      newMode === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL
        ? "El envío real de anamnesis global a base de datos quedó ACTIVADO."
        : "La simulación de anamnesis global quedó ACTIVADA. No se enviará información a base de datos.",
    );
  }

  async function handleSetModuloObesidadMode(newMode) {
    setModuloObesidadUploadMode(newMode);
    setModuloObesidadMode(newMode);

    await alertOk(
      "Modo de módulo obesidad actualizado",
      newMode === MODULO_OBESIDAD_UPLOAD_MODES.REAL
        ? "El envío real del módulo obesidad a base de datos quedó ACTIVADO."
        : "La simulación del módulo obesidad quedó ACTIVADA. No se enviará información a base de datos.",
    );
  }

  async function handleSetCaderaMode(newMode) {
    setCaderaUploadMode(newMode);
    setCaderaMode(newMode);

    await alertOk(
      "Modo de cadera actualizado",
      newMode === CADERA_UPLOAD_MODES.REAL
        ? "El envío real de cadera a base de datos quedó ACTIVADO."
        : "La simulación de cadera quedó ACTIVADA. No se enviará información a base de datos.",
    );
  }
  async function handleSetHombroMode(newMode) {
    setHombroUploadMode(newMode);
    setHombroMode(newMode);

    await alertOk(
      "Modo de hombro actualizado",
      newMode === HOMBRO_UPLOAD_MODES.REAL
        ? "El envío real de hombro a base de datos quedó ACTIVADO."
        : "La simulación de hombro quedó ACTIVADA. No se enviará información a base de datos.",
    );
  }

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
                <strong>Modo fotos:</strong>{" "}
                {fotoMode === FOTO_UPLOAD_MODES.REAL
                  ? "ENVÍO REAL A BASE DE DATOS"
                  : "SIMULACIÓN"}
              </li>
              <li>
                <strong>Modo check-in:</strong>{" "}
                {checkinMode === CHECKIN_UPLOAD_MODES.REAL
                  ? "ENVÍO REAL A BASE DE DATOS"
                  : "SIMULACIÓN"}
              </li>
              <li>
                <strong>Modo anamnesis global:</strong>{" "}
                {anamnesisGlobalMode === ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL
                  ? "ENVÍO REAL A BASE DE DATOS"
                  : "SIMULACIÓN"}
              </li>
              <li>
                <strong>Modo cadera:</strong>{" "}
                {caderaMode === CADERA_UPLOAD_MODES.REAL
                  ? "ENVÍO REAL A BASE DE DATOS"
                  : "SIMULACIÓN"}
              </li>
              <li>
                <strong>Modo módulo obesidad:</strong>{" "}
                {moduloObesidadMode === MODULO_OBESIDAD_UPLOAD_MODES.REAL
                  ? "ENVÍO REAL A BASE DE DATOS"
                  : "SIMULACIÓN"}
              </li>
            </ul>
            <li>
              <strong>Modo hombro:</strong>{" "}
              {hombroMode === HOMBRO_UPLOAD_MODES.REAL
                ? "ENVÍO REAL A BASE DE DATOS"
                : "SIMULACIÓN"}
            </li>
          </div>

          <UploadModeControl
            title="Control de fotos"
            mode={fotoMode}
            realValue={FOTO_UPLOAD_MODES.REAL}
            simulationValue={FOTO_UPLOAD_MODES.SIMULACION}
            onChange={handleSetFotoMode}
            realLabel="Activar envío real fotos"
            simulationLabel="Activar simulación fotos"
          />

          <UploadModeControl
            title="Control de check-in"
            mode={checkinMode}
            realValue={CHECKIN_UPLOAD_MODES.REAL}
            simulationValue={CHECKIN_UPLOAD_MODES.SIMULACION}
            onChange={handleSetCheckinMode}
            realLabel="Activar envío real check-in"
            simulationLabel="Activar simulación check-in"
          />

          <UploadModeControl
            title="Control de anamnesis global"
            mode={anamnesisGlobalMode}
            realValue={ANAMNESIS_GLOBAL_UPLOAD_MODES.REAL}
            simulationValue={ANAMNESIS_GLOBAL_UPLOAD_MODES.SIMULACION}
            onChange={handleSetAnamnesisGlobalMode}
            realLabel="Activar envío real anamnesis global"
            simulationLabel="Activar simulación anamnesis global"
          />

          <UploadModeControl
            title="Control de módulo obesidad"
            mode={moduloObesidadMode}
            realValue={MODULO_OBESIDAD_UPLOAD_MODES.REAL}
            simulationValue={MODULO_OBESIDAD_UPLOAD_MODES.SIMULACION}
            onChange={handleSetModuloObesidadMode}
            realLabel="Activar envío real módulo obesidad"
            simulationLabel="Activar simulación módulo obesidad"
          />

          <UploadModeControl
            title="Control de cadera"
            mode={caderaMode}
            realValue={CADERA_UPLOAD_MODES.REAL}
            simulationValue={CADERA_UPLOAD_MODES.SIMULACION}
            onChange={handleSetCaderaMode}
            realLabel="Activar envío real cadera"
            simulationLabel="Activar simulación cadera"
          />
          <UploadModeControl
            title="Control de hombro"
            mode={hombroMode}
            realValue={HOMBRO_UPLOAD_MODES.REAL}
            simulationValue={HOMBRO_UPLOAD_MODES.SIMULACION}
            onChange={handleSetHombroMode}
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
