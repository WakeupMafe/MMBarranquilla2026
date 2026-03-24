import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";
import logoWakeup from "../../../assets/LogoWakeup.png";
import useProfesionalSession from "../../../shared/hooks/useProfesionalSession";
import { alertError, alertOk } from "../../../shared/lib/alerts";
import {
  FOTO_UPLOAD_MODES,
  getFotosUploadMode,
  setFotosUploadMode,
} from "../../../shared/lib/fotosUploadMode";

const CEDULA_ADMIN_FOTOS = "1037670182";

export default function FotosAdminMode() {
  const navigate = useNavigate();
  const { profesional } = useProfesionalSession();

  const [mode, setMode] = useState(FOTO_UPLOAD_MODES.SIMULACION);

  const cedulaProfesional = useMemo(() => {
    return String(profesional?.cedula || "").trim();
  }, [profesional]);

  const isAuthorized = cedulaProfesional === CEDULA_ADMIN_FOTOS;

  useEffect(() => {
    setMode(getFotosUploadMode());
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

  async function handleSetMode(newMode) {
    setFotosUploadMode(newMode);
    setMode(newMode);

    await alertOk(
      "Modo actualizado",
      newMode === FOTO_UPLOAD_MODES.REAL
        ? "El envío real a base de datos quedó ACTIVADO."
        : "La simulación quedó ACTIVADA. No se enviarán fotos a base de datos.",
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
          <h1 className="valoracionTitle">Control de envío </h1>
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
                <strong>Modo activo:</strong>{" "}
                {mode === FOTO_UPLOAD_MODES.REAL
                  ? "ENVÍO REAL A BASE DE DATOS"
                  : "SIMULACIÓN"}
              </li>
            </ul>
          </div>

          <div className="valoracionActionsResponsive">
            <BotonImportante
              type="button"
              variant={mode === FOTO_UPLOAD_MODES.REAL ? "solid" : "outline"}
              fullWidth
              onClick={() => handleSetMode(FOTO_UPLOAD_MODES.REAL)}
            >
              Activar envío real
            </BotonImportante>

            <BotonImportante
              type="button"
              variant={
                mode === FOTO_UPLOAD_MODES.SIMULACION ? "solid" : "outline"
              }
              fullWidth
              onClick={() => handleSetMode(FOTO_UPLOAD_MODES.SIMULACION)}
            >
              Activar simulación
            </BotonImportante>
          </div>

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
