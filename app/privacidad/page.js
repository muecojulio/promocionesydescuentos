import Link from "next/link";

export const metadata = {
  title: "Política de privacidad · Promos MX",
};

export default function Privacidad() {
  return (
    <main className="legal">
      <p>
        <Link className="ui-back" href="/">
          ← Volver
        </Link>
      </p>
      <h1>Política de privacidad</h1>
      <p>Última actualización: 25 de septiembre de 2026.</p>

      <h2>Quién opera esta app</h2>
      <p>
        Promociones y Descuentos (Promos MX) es una aplicación de consulta
        personal. No crea cuentas ni pide registro.
      </p>

      <h2>Qué datos se recogen</h2>
      <ul>
        <li>No pedimos nombre, correo, teléfono ni tarjeta.</li>
        <li>No usamos cookies de publicidad ni analítica de terceros.</li>
        <li>
          El buscador y las pestañas viven solo en tu dispositivo (estado de
          React). No se envían a un perfil de usuario.
        </li>
        <li>
          El botón Refrescar llama a nuestro propio endpoint{" "}
          <code>/api/ofertas</code>. Ese servidor consulta APIs públicas
          (CheapShark, DummyJSON, FakeStoreAPI, Frankfurter) sin enviarle tus
          datos personales.
        </li>
        <li>
          El servicio de hosting (Vercel) puede registrar IP, fecha y user-agent
          en logs técnicos de seguridad, el tiempo que conserve su política.
        </li>
      </ul>

      <h2>Caché</h2>
      <p>
        Guardamos en memoria del servidor y en el Service Worker la lista de
        ofertas para no golpear las APIs públicas en cada visita. El caché dura
        hasta 24 horas o hasta que pulses Refrescar. No se cachean datos
        personales porque no existen.
      </p>

      <h2>Enlaces externos</h2>
      <p>
        Algunas fichas enlazan a tiendas o a CheapShark. Al salir de esta app
        aplica la política de ese sitio.
      </p>

      <h2>Menores</h2>
      <p>
        La app no está dirigida a menores de 13 años y no busca recabar sus
        datos.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Como no almacenamos un perfil, no hay cuenta que borrar. Puedes borrar
        el sitio en el navegador (datos de caché / PWA) cuando quieras.
      </p>

      <h2>Cambios</h2>
      <p>
        Si cambia esta política se actualizará la fecha de esta página. El uso
        continuado implica que leíste la versión publicada.
      </p>
    </main>
  );
}
