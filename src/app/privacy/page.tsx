import Link from "next/link";

export const metadata = {
  title: "Privacidad · JuegoFamiliaEch",
};

export default function PrivacyPage() {
  return (
    <main className="shell legalPage" id="main-content">
      <section className="hero">
        <p className="eyebrow">PRIVACIDAD · BETA</p>
        <h1>Conversar sin convertir la conversación en datos.</h1>
        <p className="lede">
          JuegoFamiliaEch está diseñado para coordinar una ronda presencial con
          la menor cantidad de información posible.
        </p>
      </section>

      <section className="panel legalDocument">
        <h2>Qué datos usa una sala</h2>
        <p>
          Mientras una sala existe, el servidor mantiene nombres elegidos por
          los jugadores, credenciales técnicas de sesión, estado de conexión,
          turnos, preguntas utilizadas, reacciones y momentos marcados para el
          recap.
        </p>

        <h2>Qué no guardamos</h2>
        <p>
          El juego no pide cuenta, no almacena lo que las personas responden y
          no captura audio, fotografías ni video. Un “momento guardado” conserva
          únicamente metadatos de la ronda y la pregunta asociada.
        </p>

        <h2>Cuánto dura</h2>
        <p>
          El estado de una sala expira automáticamente aproximadamente 12 horas
          después de su creación. Al expirar se elimina el estado de juego del
          Durable Object.
        </p>

        <h2>Analítica de producto</h2>
        <p>
          La beta registra métricas agregadas como salas creadas, personas que
          se unen, partidas iniciadas y partidas finalizadas. No enviamos
          nombres, códigos de sala, tokens ni respuestas a esa analítica.
        </p>

        <h2>Errores técnicos</h2>
        <p>
          Para detectar fallos podemos registrar únicamente la clase general del
          error y la superficie de la aplicación donde ocurrió, por ejemplo
          “sala” o “pantalla central”. No enviamos mensajes de error, stacks,
          nombres ni contenido de la conversación desde el navegador.
        </p>

        <h2>Seguridad y antiabuso</h2>
        <p>
          Cloudflare puede proporcionar la dirección de red al Worker. Para
          aplicar límites antiabuso derivamos un identificador hash y no
          guardamos la IP en texto claro dentro del almacenamiento de la
          aplicación. Esos contadores son temporales.
        </p>

        <h2>Captura multimedia futura</h2>
        <p>
          Si una versión futura añade audio, foto o video, deberá permanecer
          desactivado por defecto y pedir consentimiento específico antes de
          iniciar cualquier captura.
        </p>

        <p className="legalNote">
          Esta política corresponde a la beta técnica actual. Antes de abrir una
          beta pública se añadirá un canal formal de contacto y se revisará el
          texto jurídico definitivo.
        </p>
      </section>

      <p className="backLink">
        <Link href="/online">← Volver al juego</Link>
      </p>
    </main>
  );
}
