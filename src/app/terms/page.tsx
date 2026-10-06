import Link from "next/link";

export const metadata = {
  title: "Términos · JuegoFamiliaEch",
};

export default function TermsPage() {
  return (
    <main className="shell legalPage" id="main-content">
      <section className="hero">
        <p className="eyebrow">TÉRMINOS · BETA</p>
        <h1>Reglas simples para una beta de conversación presencial.</h1>
        <p className="lede">
          JuegoFamiliaEch es un producto en prueba. Estos términos describen el
          funcionamiento técnico y las reglas básicas de uso de esta beta.
        </p>
      </section>

      <section className="panel legalDocument">
        <h2>Uso del producto</h2>
        <p>
          Puedes usar la beta para crear y compartir salas con personas que
          estén participando voluntariamente en la conversación. No necesitas
          crear una cuenta.
        </p>

        <h2>Respeto entre participantes</h2>
        <p>
          No uses el servicio para acosar, amenazar, engañar, suplantar,
          recolectar información de otros sin permiso o interferir con sus
          dispositivos o sesiones.
        </p>

        <h2>Disponibilidad</h2>
        <p>
          Esta es una beta. Puede haber cambios, interrupciones, pérdida del
          estado efímero de una sala o funciones que cambien sin previo aviso.
          No debe usarse para almacenar información que necesites conservar.
        </p>

        <h2>Contenido</h2>
        <p>
          Las preguntas y la experiencia del producto son contenido propio o
          expresamente permitido. El uso de la beta no transfiere derechos sobre
          la marca, el diseño o los mazos de preguntas.
        </p>

        <h2>Privacidad</h2>
        <p>
          El tratamiento técnico de la información de la beta se describe en la
          política de privacidad. El juego no está diseñado para grabar
          conversaciones.
        </p>

        <h2>Menores de edad</h2>
        <p>
          Cuando las normas aplicables o el contexto del grupo lo requieran, la
          participación de menores debe realizarse con la supervisión o
          autorización correspondiente de un adulto responsable.
        </p>

        <h2>Cambios y cierre de la beta</h2>
        <p>
          Podemos modificar, limitar o cerrar la beta para corregir errores,
          seguridad, costos o decisiones de producto.
        </p>

        <p className="legalNote">
          Este texto es una versión operativa para beta cerrada y debe recibir
          revisión jurídica antes de un lanzamiento comercial abierto.
        </p>
      </section>

      <p className="backLink">
        <Link href="/online">← Volver al juego</Link>
      </p>
    </main>
  );
}
