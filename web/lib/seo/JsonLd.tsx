import { cache } from 'react';

/**
 * Inyector base de datos estructurados. Renderiza un <script type="application/ld+json">.
 *
 * Seguridad: el JSON se serializa y se escapan los caracteres `<` que podrían
 * cerrar el script o abrir etiquetas. Es la única vía de inyección de JSON-LD
 * en el proyecto; las plantillas no construyen <script> a mano.
 */

type Json = Record<string, unknown> | Array<Record<string, unknown>>;

function serialize(data: Json): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data, id }: { data: Json; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // eslint-disable-next-line react/no-danger -- contenido controlado y escapado
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

/** Memoiza la serialización para grafos reutilizados (Organization en layout). */
export const serializeJsonLd = cache(serialize);
