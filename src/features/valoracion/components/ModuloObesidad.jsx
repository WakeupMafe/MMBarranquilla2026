import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopHeader from "../../../shared/components/TopHeader/TopHeader";
import logoWakeup from "../../../assets/LogoWakeup.png";
import { supabase } from "../../../shared/lib/supabaseClient";
import { alertConfirm, alertError, alertOk } from "../../../shared/lib/alerts";
import BotonImportante from "../../../shared/components/BotonImportante/BotonImportante";

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

function tieneDato(valor) {
  return valor !== null && valor !== undefined && String(valor).trim() !== "";
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

  const [bloqueadoPorDatosPrevios, setBloqueadoPorDatosPrevios] =
    useState(false);

  const { imc, obesidad } = useMemo(() => {
    return calcularImc(peso, talla);
  }, [peso, talla]);

  function limpiarSeleccionPaciente() {
    setPaciente(null);
    setCoincidencias([]);
    setPeso("");
    setTalla("");
    setBloqueadoPorDatosPrevios(false);
  }

  async function validarModuloObesidad(item) {
    const documento = String(item?.numero_documento_fisico || "").trim();

    if (!documento) {
      throw new Error("No fue posible validar la cédula del paciente.");
    }

    console.log("🟡 Validando módulo obesidad para:", documento);

    const { data, error } = await supabase
      .from("modulo_obesidad")
      .select("numero_documento_fisico, peso, talla, imc, obesidad")
      .eq("numero_documento_fisico", documento)
      .maybeSingle();

    if (error) {
      console.error("❌ Error consultando modulo_obesidad:", error);
      throw error;
    }

    console.log("📦 Datos previos modulo_obesidad:", data);

    const yaTieneDatos =
      data &&
      tieneDato(data.peso) &&
      tieneDato(data.talla) &&
      tieneDato(data.imc);

    if (yaTieneDatos) {
      setBloqueadoPorDatosPrevios(true);
      setPeso(String(data.peso ?? ""));
      setTalla(String(data.talla ?? ""));

      await alertError(
        "Datos ya registrados",
        "Esta persona ya tiene datos de peso, talla e IMC registrados en el módulo de obesidad, por lo cual no se puede modificar.",
      );

      return true;
    }

    setBloqueadoPorDatosPrevios(false);
    setPeso(tieneDato(data?.peso) ? String(data.peso) : "");
    setTalla(tieneDato(data?.talla) ? String(data.talla) : "");

    return true;
  }

  async function handleSeleccionarPaciente(item) {
    try {
      setPaciente(item);
      setCoincidencias([]);

      const ok = await validarModuloObesidad(item);
      if (!ok) return;
    } catch (error) {
      console.error("💥 Error validando paciente en módulo obesidad:", error);

      limpiarSeleccionPaciente();

      await alertError(
        "Error de validación",
        error?.message || "No fue posible validar la información del paciente.",
      );
    }
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

        const ok = await validarModuloObesidad(data);
        if (!ok) return;

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
      console.error("💥 Error buscando paciente:", error);

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

    if (bloqueadoPorDatosPrevios) {
      await alertError(
        "Edición no permitida",
        "Esta persona ya tiene datos registrados.",
      );
      return;
    }

    if (!peso || !talla) {
      await alertError("Datos incompletos", "Debes ingresar peso y talla.");
      return;
    }

    if (!imc) {
      await alertError(
        "IMC inválido",
        "Verifica los datos ingresados para peso y talla.",
      );
      return;
    }

    const confirmar = await alertConfirm({
      title: "Confirmar registro",
      text: "¿Deseas guardar los datos?",
      confirmText: "Sí, guardar",
      cancelText: "Cancelar",
    });

    if (!confirmar) return;

    try {
      setGuardando(true);

      const documento = String(paciente.numero_documento_fisico || "").trim();

      const payload = {
        numero_documento_fisico: documento,
        peso: Number(peso),
        talla: Number(talla),
        imc,
        obesidad,
        updated_at: new Date().toISOString(),
      };

      console.log("📤 Enviando a modulo_obesidad:", payload);

      const { data, error } = await supabase
        .from("modulo_obesidad")
        .upsert([payload], {
          onConflict: "numero_documento_fisico",
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error Supabase modulo_obesidad:", error);
        throw error;
      }

      console.log("✅ Guardado exitoso modulo_obesidad:", data);

      await alertOk(
        "Guardado correcto",
        `Se guardaron los datos de ${
          paciente.nombre_apellido_documento || "Paciente"
        }`,
      );

      setBloqueadoPorDatosPrevios(true);
    } catch (error) {
      console.error("💥 Error guardando medidas:", error);

      await alertError(
        "Error al guardar",
        error.message || "No se pudieron guardar los datos.",
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

              {bloqueadoPorDatosPrevios ? (
                <div className="anamnesisInfoBox">
                  <p>
                    <strong>Bloqueado:</strong> Esta persona ya tiene datos de
                    peso, talla e IMC registrados, por lo cual no se puede
                    modificar.
                  </p>
                  <p>
                    Si requieren modificación, deben comunicarse con el
                    administrador de la página.
                  </p>
                </div>
              ) : null}

              <div className="valoracionForm">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Peso en kg"
                  className="valoracionInput"
                  disabled={bloqueadoPorDatosPrevios}
                />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                  placeholder="Talla en metros"
                  className="valoracionInput"
                  disabled={bloqueadoPorDatosPrevios}
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
                  <BotonImportante
                    type="button"
                    variant="solid"
                    onClick={handleGuardar}
                    disabled={
                      guardando || !paciente || bloqueadoPorDatosPrevios
                    }
                  >
                    {guardando ? "Enviando..." : "Guardar medidas"}
                  </BotonImportante>

                  <BotonImportante
                    type="button"
                    variant="outline"
                    onClick={limpiarSeleccionPaciente}
                    disabled={guardando}
                  >
                    Limpiar
                  </BotonImportante>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
