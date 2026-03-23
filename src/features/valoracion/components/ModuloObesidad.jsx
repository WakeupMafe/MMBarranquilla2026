import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { alertError, alertOk } from "../../../shared/lib/alerts";
import "./ModuloObesidad.css";
import "../pages/AnamnesisGlobal.css";

function calcularImc(peso, talla) {
  const pesoNum = Number(peso);
  const tallaNum = Number(talla);

  if (!pesoNum || !tallaNum || tallaNum <= 0) {
    return { imc: null, obesidad: false };
  }

  const imc = pesoNum / (tallaNum * tallaNum);

  return {
    imc: Number(imc.toFixed(2)),
    obesidad: imc >= 30,
  };
}

export default function ModuloObesidad() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);

  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [guardando, setGuardando] = useState(false);

  const { imc, obesidad } = useMemo(() => {
    return calcularImc(peso, talla);
  }, [peso, talla]);

  async function handleBuscarPaciente() {
    const valor = String(busqueda || "").trim();

    if (!valor) {
      await alertError(
        "Dato requerido",
        "Ingresa cédula o nombre del paciente.",
      );
      return;
    }

    try {
      setLoadingBusqueda(true);

      // Búsqueda simulada temporal hasta definir integración real
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (/^\d+$/.test(valor)) {
        setPaciente({
          numero_documento_fisico: valor,
          nombre_apellido_documento: "Paciente encontrado",
          genero: "No registrado",
        });
      } else {
        setPaciente({
          numero_documento_fisico: "1037670182",
          nombre_apellido_documento: valor,
          genero: "No registrado",
        });
      }
    } catch (error) {
      await alertError(
        "Error al buscar",
        error.message || "No se pudo buscar el paciente.",
      );
    } finally {
      setLoadingBusqueda(false);
    }
  }

  async function handleGuardar() {
    if (!paciente?.numero_documento_fisico) {
      await alertError(
        "Paciente requerido",
        "Primero debes seleccionar un paciente.",
      );
      return;
    }

    if (!peso || !talla) {
      await alertError("Datos incompletos", "Debes ingresar peso y talla.");
      return;
    }

    try {
      setGuardando(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      await alertOk(
        "Medidas registradas",
        `Se enviaron correctamente las medidas de ${paciente.nombre_apellido_documento}.`,
      );

      console.log("ENVÍO SIMULADO MÓDULO OBESIDAD", {
        cedula: paciente.numero_documento_fisico,
        nombre_paciente: paciente.nombre_apellido_documento,
        peso: Number(peso),
        talla: Number(talla),
        imc,
        obesidad,
      });

      setPeso("");
      setTalla("");
    } catch (error) {
      await alertError(
        "Error al enviar",
        error.message || "No se pudieron procesar las medidas.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="valoracionShell">
      <TopHeader
        userName="Profesional"
        onLogout={() => navigate("/")}
        logoSrc={logoWakeup}
      />

      <main className="valoracionPage">
        <div className="valoracionTopActions">
          <button
            type="button"
            className="valoracionBackBtn"
            onClick={() => navigate("/herramientas")}
          >
            ← Volver
          </button>
        </div>

        <section className="valoracionHero">
          <h1 className="valoracionTitle">Módulo de peso y talla</h1>
          <p className="valoracionSubtitle">
            Registro independiente de medidas antropométricas
          </p>
        </section>

        <section className="valoracionCard">
          <div className="valoracionCardHeader">
            <h2 className="valoracionCardTitle">Buscar paciente</h2>
            <p className="valoracionCardDescription">
              Puedes buscar por cédula o nombre.
            </p>
          </div>

          <div className="valoracionForm">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ejemplo: 1037670182 o María Pérez"
              className="valoracionInput"
            />

            <div className="valoracionActions">
              <button
                type="button"
                className="valoracionPrimaryBtn"
                onClick={handleBuscarPaciente}
                disabled={loadingBusqueda}
              >
                {loadingBusqueda ? "Buscando..." : "Buscar paciente"}
              </button>
            </div>
          </div>

          {paciente && (
            <div className="valoracionPacienteCard">
              <ul className="valoracionPacienteList">
                <li>
                  <strong>Cédula:</strong> {paciente.numero_documento_fisico}
                </li>
                <li>
                  <strong>Nombre:</strong> {paciente.nombre_apellido_documento}
                </li>
                <li>
                  <strong>Género:</strong> {paciente.genero || "No registrado"}
                </li>
              </ul>
            </div>
          )}

          {paciente && (
            <>
              <div
                className="valoracionCardHeader"
                style={{ marginTop: "20px" }}
              >
                <h2 className="valoracionCardTitle">Tomar medidas</h2>
              </div>

              <div className="valoracionForm">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Peso en kg"
                  className="valoracionInput"
                />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                  placeholder="Talla en metros"
                  className="valoracionInput"
                />

                <div className="anamnesisInfoBox">
                  <p>
                    <strong>IMC:</strong> {imc ?? "Sin calcular"}
                  </p>
                  <p>
                    <strong>Obesidad:</strong> {obesidad ? "Sí" : "No"}
                  </p>
                </div>

                <div className="valoracionActions">
                  <button
                    type="button"
                    className="valoracionPrimaryBtn"
                    onClick={handleGuardar}
                    disabled={guardando}
                  >
                    {guardando ? "Enviando..." : "Guardar medidas"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
