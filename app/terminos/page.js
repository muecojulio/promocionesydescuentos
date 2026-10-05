import Link from "next/link";

export const metadata = {
  title: "Términos de uso · Promos MX",
};

export default function Terminos() {
  return (
    <main className="legal">
      <p>
        <Link className="ui-back" href="/">
          ← Volver
        </Link>
      </p>
      <h1>Términos de uso</h1>
      <p>Última actualización: 25 de septiembre de 2026.</p>
      <h2>Naturaleza de la información</h2>
      <p>
        Las promociones locales son de referencia. Las ofertas de Gaming y
        catálogo extra se toman de APIs públicas de terceros. Precios, MSI,
        cupones y vigencias pueden cambiar sin aviso. Confirma siempre en la
        tienda oficial antes de comprar.
      </p>
      <h2>Sin relación comercial</h2>
      <p>
        Esta app no es afiliada, patrocinada ni operada por las marcas
        mencionadas, salvo que se indique lo contrario. Los nombres son de sus
        titulares.
      </p>
      <h2>Uso permitido</h2>
      <p>
        Consulta personal. No uses el servicio para bombardear las APIs
        públicas ni para presentar los datos como oficiales de un banco o
        tienda.
      </p>
    </main>
  );
}
