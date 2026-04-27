import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies — 3DMORE",
  description: "Información sobre el uso de cookies en 3DMORE.",
};

export default function CookiesPage() {
  return (
    <>
      <h1>Política de Cookies</h1>
      <p className="legal-meta">Última actualización: 27 de abril de 2026</p>

      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies son pequeños archivos de texto que un sitio web guarda en tu dispositivo cuando
        lo visitás. Se utilizan para que el sitio recuerde información sobre tu visita y mejore tu
        experiencia.
      </p>

      <h2>2. Qué cookies usamos</h2>

      <h3>Cookies estrictamente necesarias</h3>
      <p>
        Indispensables para el funcionamiento del sitio. No se pueden desactivar. Incluyen:
      </p>
      <ul>
        <li><strong>Sesión de usuario:</strong> mantienen tu sesión iniciada (Supabase).</li>
        <li><strong>Carrito de compras:</strong> recuerdan los productos que agregaste.</li>
        <li><strong>Preferencias técnicas:</strong> como el consentimiento de cookies.</li>
      </ul>

      <h3>Cookies de terceros</h3>
      <p>
        Algunos servicios externos que usamos pueden instalar sus propias cookies:
      </p>
      <ul>
        <li><strong>Google</strong> (autenticación con cuenta de Google).</li>
        <li><strong>Mercado Pago</strong> (procesamiento de pagos).</li>
      </ul>
      <p>
        Estas cookies se rigen por las políticas de privacidad de cada uno de estos servicios.
      </p>

      <h2>3. Cómo gestionar las cookies</h2>
      <p>
        Podés configurar tu navegador para que rechace cookies o te avise cuando se instalan.
        Tené en cuenta que si bloqueás todas las cookies, algunas funciones del sitio (como
        iniciar sesión o usar el carrito) no funcionarán correctamente.
      </p>
      <p>Enlaces para configurar cookies en los navegadores más comunes:</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h2>4. Cambios en esta política</h2>
      <p>
        Si modificamos nuestro uso de cookies, actualizaremos esta política y, si corresponde, te
        pediremos un nuevo consentimiento.
      </p>

      <h2>5. Contacto</h2>
      <p>
        Para consultas sobre nuestro uso de cookies escribinos a{" "}
        <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a>.
      </p>
    </>
  );
}
