function getSiguientePasoLabel(siguientePaso) {
  const labels = {
    funcional: "Evaluación funcional general",
    anamnesis_especifica_zona: "Anamnesis por zona",
    pendiente_aprobacion: "Pendiente de aprobación médica",
    decision_zona_o_funcional: "Definición de continuidad terapéutica",
    decision_preliminar_o_secundaria: "Definición de continuidad terapéutica",
    decision_preliminar_o_funcional: "Definición de progresión terapéutica",
    descartado: "No continuar",
    revision_critica: "Revisión clínica prioritaria",
  };

  return labels[siguientePaso] || "No definido";
}

function getZonaLabel(zona) {
  if (!zona) return "Sin dato";

  const labels = {
    hombro: "Hombro",
    rodilla: "Rodilla",
    cadera: "Cadera",
    lumbar: "Espalda",
    funcional: "Funcional",
  };

  return labels[String(zona).trim().toLowerCase()] || zona;
}

export default function AnamnesisResultCard({
  resultado,
  clasificacionPaciente,
  onContinuar,
}) {
  if (!resultado) return null;

  const flujo = clasificacionPaciente?.flujo || null;
  const zonaDestino = clasificacionPaciente?.zonaDestino || null;
  const zonaSecundaria = clasificacionPaciente?.zonaSecundaria || null;

  const mostrarBotonContinuar =
    resultado.siguientePaso !== "pendiente_aprobacion" &&
    resultado.siguientePaso !== "revision_critica";

  return (
    <>
      <div className="anamnesisResultadoCard">
        <h3 className="anamnesisSectionTitle">Resultado de evaluación</h3>

        <ul className="valoracionPacienteList">
          <li>
            <strong>Criterios críticos:</strong>{" "}
            {resultado.descartado ? "Presentes" : "No identificados"}
          </li>

          {!clasificacionPaciente?.ocultarDeteccionDolor && (
            <>
              <li>
                <strong>Cantidad de zonas con dolor:</strong>{" "}
                {resultado.cantidadZonasDolor}
              </li>
              <li>
                <strong>Requiere aprobación médica:</strong>{" "}
                {resultado.pendienteAprobacion ? "Sí" : "No"}
              </li>
            </>
          )}

          <li>
            <strong>Ruta definida:</strong>{" "}
            {getSiguientePasoLabel(resultado.siguientePaso)}
          </li>
        </ul>

        {resultado.siguientePaso === "revision_critica" && (
          <div className="valoracionStatusAlert valoracionStatusAlert--warn">
            <strong>Restricción clínica para clasificación</strong>
            <p>
              El paciente reporta antecedentes o condiciones clínicas que
              representan un riesgo para la ejecución del programa. No es apto
              para clasificación en esta fase y requiere valoración y validación
              por parte del equipo profesional.
            </p>

            {resultado.motivosDescarte?.length > 0 && (
              <ul className="anamnesisInlineList">
                {resultado.motivosDescarte.map((motivo) => (
                  <li key={motivo}>{motivo}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {resultado.siguientePaso === "pendiente_aprobacion" && (
          <div className="valoracionStatusAlert valoracionStatusAlert--warn">
            <strong>Revisión clínica requerida</strong>
            <p>
              El paciente presenta compromiso en{" "}
              <strong>{resultado.cantidadZonasDolor}</strong> zonas corporales.
              Se requiere evaluación por el equipo clínico antes de definir la
              ruta de intervención terapéutica.
            </p>
          </div>
        )}

        {flujo === "NUEVO_PROCESO" &&
          resultado.siguientePaso !== "revision_critica" &&
          resultado.siguientePaso !== "pendiente_aprobacion" && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>Ingreso a programa</strong>
              <p>
                El paciente no registra participación previa en el programa. A
                partir de la valoración actual, puede continuar con la
                intervención correspondiente a la zona identificada o avanzar a
                la fase funcional, según criterio clínico.
              </p>
            </div>
          )}

        {flujo === "ANTIGUO_REINICIA_ZONA" &&
          resultado.siguientePaso !== "revision_critica" && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>Continuidad de proceso</strong>
              <p>
                El paciente presenta un proceso previo no culminado en la zona{" "}
                <strong>{getZonaLabel(zonaDestino)}</strong>. Se habilita la
                continuación de la fase correspondiente para completar su
                intervención clínica.
              </p>
            </div>
          )}

        {flujo === "ANTIGUO_ELIGE_PRELIMINAR_O_SECUNDARIA" &&
          resultado.siguientePaso !== "revision_critica" && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>Progresión terapéutica habilitada</strong>
              <p>
                El paciente cumple criterios para progresión del proceso
                terapéutico. Puede continuar intervención en su zona preliminar{" "}
                <strong>{getZonaLabel(zonaDestino)}</strong> o activar la fase
                correspondiente a su segundo diagnóstico en{" "}
                <strong>{getZonaLabel(zonaSecundaria)}</strong>.
              </p>
            </div>
          )}

        {flujo === "ANTIGUO_ELIGE_PRELIMINAR_O_FUNCIONAL" &&
          resultado.siguientePaso !== "revision_critica" && (
            <>
              {String(zonaDestino).toLowerCase() === "funcional" ? (
                <div className="valoracionStatusAlert valoracionStatusAlert--info">
                  <strong>Fase avanzada del proceso terapéutico</strong>
                  <p>
                    El paciente se encuentra en la fase más avanzada del proceso
                    terapéutico. Puede continuar con intervención orientada a
                    fortalecimiento funcional y mantenimiento de capacidades
                    físicas.
                  </p>
                </div>
              ) : (
                <div className="valoracionStatusAlert valoracionStatusAlert--info">
                  <strong>Progresión terapéutica habilitada</strong>
                  <p>
                    El paciente cumple criterios para progresión del proceso
                    terapéutico. Puede continuar intervención en su zona
                    preliminar <strong>{getZonaLabel(zonaDestino)}</strong> o
                    avanzar a la fase funcional.
                  </p>
                </div>
              )}
            </>
          )}
        {resultado.siguientePaso === "funcional" &&
          flujo !== "ANTIGUO_ELIGE_PRELIMINAR_O_SECUNDARIA" &&
          flujo !== "ANTIGUO_ELIGE_PRELIMINAR_O_FUNCIONAL" &&
          flujo !== "ANTIGUO_REINICIA_ZONA" &&
          flujo !== "NUEVO_PROCESO" && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>Fase funcional habilitada</strong>
              <p>
                No se identifican zonas de dolor activas que condicionen una
                ruta terapéutica específica. El paciente puede continuar a la
                fase de pruebas físicas y toma de registro fotográfico.
              </p>
            </div>
          )}

        {resultado.alertas?.length > 0 &&
          resultado.siguientePaso !== "revision_critica" && (
            <div className="valoracionStatusAlert valoracionStatusAlert--info">
              <strong>Observaciones clínicas</strong>
              <ul className="anamnesisInlineList">
                {resultado.alertas.map((alerta) => (
                  <li key={alerta}>{alerta}</li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {mostrarBotonContinuar && (
        <div className="valoracionActions valoracionActions--result">
          <button
            type="button"
            className="valoracionPrimaryBtn"
            onClick={onContinuar}
          >
            Continuar
          </button>
        </div>
      )}
    </>
  );
}
