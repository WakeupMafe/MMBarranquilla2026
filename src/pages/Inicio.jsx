// src/pages/Inicio.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabaseClient";

import "./Inicio.css";

// assets
import logoWakeup from "../assets/LogoWakeup.png";
import avatar from "../assets/avatarbienvenida.svg";

/** Mismo corte que `@media (max-width: 480px)` en Inicio.css */
const MOBILE_PLACEHOLDER_MQ = "(max-width: 480px)";

export default function Inicio() {
  const navigate = useNavigate();
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [esVistaMovil, setEsVistaMovil] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_PLACEHOLDER_MQ).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_PLACEHOLDER_MQ);
    const actualizar = () => setEsVistaMovil(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const clean = cedula.trim();

    if (!clean) {
      setErrorMsg("Ingresa tu documento de identidad.");
      return;
    }

    setLoading(true);
    try {
      // Ajusta nombres de columnas si en tu tabla se llaman diferente:
      // - cedula (texto o número)
      // - nombres / apellidos / sede / etc.
      const { data, error } = await supabase
        .from("profesionales")
        .select("*")
        .eq("cedula", clean)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg("No encontramos un profesional con esa cédula.");
        return;
      }

      // ✅ Envía la info del profesional a ToolsHome
      navigate("/herramientas", { state: { profesional: data } });
    } catch (err) {
      setErrorMsg(err?.message || "Ocurrió un error consultando Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inicio">
      <header className="inicio__header">
        <div className="inicio__brand">
          <img className="inicio__logo" src={logoWakeup} alt="Wakeup" />
          <span className="inicio__brandText">Wakeup</span>
        </div>
        <div className="inicio__tag">MMB 2026</div>
      </header>

      <main className="inicio__main">
        {/* IZQUIERDA */}
        <section className="inicio__left">
          <h1 className="inicio__title">Hola, bienvenid@</h1>
          <p className="inicio__subtitle">Ingresa tu documento de identidad</p>

          <form className="inicio__form" onSubmit={onSubmit}>
            <div className="inicio__pill">
              <input
                className="inicio__input"
                value={cedula}
                onChange={(e) => {
                  // Solo números si quieres:
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setCedula(v);
                }}
                placeholder={
                  esVistaMovil ? "Cédula" : "Documento de identidad"
                }
                inputMode="numeric"
                autoComplete="off"
              />

              <button className="inicio__btn" type="submit" disabled={loading}>
                {loading ? "..." : "Iniciar"}
              </button>
            </div>

            {!!errorMsg && <div className="inicio__error">{errorMsg}</div>}
          </form>
        </section>

        {/* DERECHA */}
        <section className="inicio__right" aria-hidden="true">
          <div className="inicio__circle">
            <img className="inicio__avatar" src={avatar} alt="" />
          </div>
        </section>
      </main>
    </div>
  );
}
