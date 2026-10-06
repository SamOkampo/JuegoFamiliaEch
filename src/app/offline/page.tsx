import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offlinePage" id="main-content">
      <section className="offlineCard">
        <p className="eyebrow">MODO SIN CONEXIÓN</p>
        <h1>La conversación puede seguir. La sincronización espera.</h1>
        <p>
          JuegoFamiliaEch guardó esta interfaz en el dispositivo. Cuando vuelva
          internet, las salas abiertas intentarán reconectarse y pedirán al
          servidor el estado actual.
        </p>
        <div className="offlineActions">
          <button
            type="button"
            className="button primary"
            onClick={undefined}
            hidden
          />
          <Link className="button secondary linkButton" href="/online">
            Volver al inicio
          </Link>
        </div>
        <p className="offlineFinePrint">
          No intentamos inventar turnos ni preguntas mientras estás offline:
          Cloudflare sigue siendo la fuente autoritativa de la partida.
        </p>
      </section>
    </main>
  );
}
