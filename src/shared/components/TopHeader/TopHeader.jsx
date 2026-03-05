import "./TopHeader.css";
import { useEffect, useState } from "react";

import iconLogout from "../../../assets/out.png";
import iconLogoutRed from "../../../assets/outred.png";

export default function TopHeader({ userName = "usuario", onLogout, logoSrc }) {
  const [hoverLogout, setHoverLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra con ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="topHeader">
      <div className="topHeader__left">
        {logoSrc ? (
          <img className="topHeader__logoImg" src={logoSrc} alt="Wakeup" />
        ) : (
          <div className="topHeader__logoPlaceholder" />
        )}
        <span className="topHeader__brand">Wakeup</span>
      </div>

      {/* Desktop actions */}
      <div className="topHeader__right">
        <div className="topHeader__userPill">
          <div className="topHeader__avatar" aria-hidden="true" />
          <span className="topHeader__userName">{userName}</span>
        </div>

        <button
          className="topHeader__logout"
          type="button"
          onClick={onLogout}
          onMouseEnter={() => setHoverLogout(true)}
          onMouseLeave={() => setHoverLogout(false)}
        >
          <img
            src={hoverLogout ? iconLogoutRed : iconLogout}
            alt="Salir"
            className="topHeader__logoutIcon"
          />
          <span>Salir</span>
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="topHeader__burger"
        type="button"
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="topHeader__burgerLine" />
        <span className="topHeader__burgerLine" />
        <span className="topHeader__burgerLine" />
      </button>

      {/* Mobile overlay + menu */}
      <div
        className={`topHeader__overlay ${menuOpen ? "isOpen" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className={`topHeader__menu ${menuOpen ? "isOpen" : ""}`}>
        <div className="topHeader__menuHeader">
          <div className="topHeader__userPill topHeader__userPill--menu">
            <div className="topHeader__avatar" aria-hidden="true" />
            <span className="topHeader__userName">{userName}</span>
          </div>

          <button
            className="topHeader__close"
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <button
          className="topHeader__logout topHeader__logout--menu"
          type="button"
          onClick={() => {
            setMenuOpen(false);
            onLogout?.();
          }}
        >
          <img src={iconLogout} alt="Salir" className="topHeader__logoutIcon" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}
