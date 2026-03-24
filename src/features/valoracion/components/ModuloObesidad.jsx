import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { supabase } from "../../../shared/lib/supabaseClient";
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
  const [coincidencias, setCoincidencias] = useState([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);

  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [guardando, setGuardando] = useState(false);

  const { imc, obesidad } = useMemo(() => {
    return calcularImc(peso, talla);
  }, [peso, talla]);

  function limpiarSeleccionPaciente() {
    setPaciente(null);
    setCoincidencias([]);
    setPeso("");
    setTalla("");
  }

  function handleSeleccionarPaciente(item) {
    setPaciente(item);
    setCoincidencias([]);
    setPeso("");
    setTalla("");
  }

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
      limpiarSeleccionPaciente();

      const esCedula = /^\d+$/.test(valor);

      if (esCedula) {
        const { data, error } = await supabase
          .from("participantes")
          .select("numero_documento_fisico, nombre_apellido_documento, genero")
          .eq("numero_documento_fisico", valor)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          await alertError(
            "Paciente no encontrado",
            "No existe un paciente con esa cédula. No puedes continuar hasta seleccionar un paciente válido.",
          );
          return;
        }

        setPaciente(data);
        return;
      }

      const { data, error } = await supabase
        .from("participantes")
        .select("numero_documento_fisico, nombre_apellido_documento, genero")
        .ilike("nombre_apellido_documento", `%${valor}%`)
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        await alertError(
          "Sin coincidencias",
          "No se encontraron pacientes con ese nombre.",
        );
        return;
      }

      setCoincidencias(data);
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
        "Debes buscar y seleccionar un paciente existente antes de continuar.",
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
        `Se enviaron correctamente las medidas de ${paciente.nombre_apellido_documento || "No registrado"}.`,
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
              Puedes buscar por cédula o por nombre.
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

          {coincidencias.length > 0 && (
            <div className="moduloObesidadResultados">
              <h3 className="moduloObesidadResultadosTitulo">
                Las coincidencias son estas
              </h3>

              <div className="moduloObesidadResultadosLista">
                {coincidencias.map((item) => (
                  <div
                    key={item.numero_documento_fisico}
                    className="moduloObesidadResultadoItem"
                  >
                    <div className="moduloObesidadResultadoInfo">
                      <p className="moduloObesidadResultadoNombre">
                        {item.nombre_apellido_documento || "No registrado"}
                      </p>
                      <p className="moduloObesidadResultadoDato">
                        <strong>Cédula:</strong>{" "}
                        {item.numero_documento_fisico || "No registrado"}
                      </p>
                      <p className="moduloObesidadResultadoDato">
                        <strong>Género:</strong>{" "}
                        {item.genero || "No registrado"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="valoracionPrimaryBtn moduloObesidadSeleccionarBtn"
                      onClick={() => handleSeleccionarPaciente(item)}
                    >
                      Seleccionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paciente && (
            <div className="valoracionPacienteCard">
              <ul className="valoracionPacienteList">
                <li>
                  <strong>Cédula:</strong>{" "}
                  {paciente.numero_documento_fisico || "No registrado"}
                </li>
                <li>
                  <strong>Nombre:</strong>{" "}
                  {paciente.nombre_apellido_documento || "No registrado"}
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
                    disabled={guardando || !paciente}
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
