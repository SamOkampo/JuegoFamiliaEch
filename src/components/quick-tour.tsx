"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "jfe:quick-tour:v1";
const STEPS = [
  {
    symbol: "①",
    title: "Armen el parche",
    body: "Una persona crea la sala. Las demás escanean el QR o escriben el código desde su teléfono.",
  },
  {
    symbol: "②",
    title: "Échenle ojo a la pregunta",
    body: "El anfitrión elige el ambiente. Todos marcan Estoy listo. Cuando toca responder, la pregunta aparece para todos.",
  },
  {
    symbol: "③",
    title: "¡A echar cuento sin afán!",
    body: "Dejen el celular mientras alguien cuenta su historia. Prueben las sorpresas y, al terminar, jueguen otra ronda en la misma sala.",
  },
] as const;

export function QuickTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setOpen(window.localStorage.getItem(STORAGE_KEY) !== "done");
  }, []);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, "done");
    setOpen(false);
  }

  return (
    <section className="quickTour" aria-label="Guía para jugar">
      <div className="quickTourHeader">
        <div>
          <p className="eyebrow">EMPIEZA EN 30 SEGUNDOS</p>
          <strong>¿Primera vez jugando?</strong>
        </div>
        <button
          type="button"
          className="quickTourToggle"
          aria-expanded={open}
          onClick={() => {
            setStep(0);
            setOpen(!open);
          }}
        >
          {open ? "Ocultar guía" : "Ver cómo jugar"}
        </button>
      </div>
      {open ? (
        <div className="quickTourBody">
          <div className="quickTourProgress" aria-label={"Paso " + (step + 1) + " de 3"}>
            {STEPS.map((_, index) => (
              <span key={index} className={index <= step ? "active" : ""} />
            ))}
          </div>
          <div className="quickTourStep" key={step} aria-live="polite">
            <span className="quickTourSymbol" aria-hidden="true">{STEPS[step].symbol}</span>
            <div>
              <h2>{STEPS[step].title}</h2>
              <p>{STEPS[step].body}</p>
            </div>
          </div>
          <div className="quickTourActions">
            <button type="button" className="button secondary" onClick={close}>
              Saltar guía
            </button>
            <button
              type="button"
              className="button primary"
              onClick={() => {
                if (step === STEPS.length - 1) close();
                else setStep((current) => current + 1);
              }}
            >
              {step === STEPS.length - 1 ? "¡Entendido!" : "Siguiente paso"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
