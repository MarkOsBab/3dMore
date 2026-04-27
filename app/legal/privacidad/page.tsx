import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — 3DMORE",
  description: "Cómo tratamos tus datos personales en 3DMORE.",
};

export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p className="legal-meta">Última actualización: 27 de abril de 2026</p>

      <h2>1. Quién es responsable de tus datos</h2>
      <p>
        El responsable del tratamiento de los datos personales recolectados a través de este sitio
        es <strong>Marcos García</strong>, en el marco del emprendimiento 3DMORE.
      </p>
      <p>
        Para ejercer tus derechos o realizar consultas sobre tus datos personales, escribinos a{" "}
        <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a>.
      </p>

      <h2>2. Qué datos recolectamos</h2>
      <p>Recolectamos únicamente los datos necesarios para gestionar tu compra:</p>
      <ul>
        <li><strong>Datos de identificación:</strong> nombre, apellido, documento (cuando aplique).</li>
        <li><strong>Datos de contacto:</strong> email, teléfono.</li>
        <li><strong>Datos de envío:</strong> dirección de entrega.</li>
        <li><strong>Datos de cuenta:</strong> si iniciás sesión con Google, recibimos tu nombre, email y avatar.</li>
        <li><strong>Datos de compra:</strong> productos adquiridos, montos, fechas.</li>
      </ul>
      <p>
        <strong>No almacenamos datos de tarjetas de crédito.</strong> Todos los pagos son procesados
        directamente por Mercado Pago, que cumple con los estándares PCI-DSS.
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Procesar y entregar tu pedido.</li>
        <li>Comunicarnos contigo sobre el estado de tu compra.</li>
        <li>Atender consultas, reclamos y devoluciones.</li>
        <li>Cumplir obligaciones legales si correspondieran.</li>
      </ul>
      <p>
        <strong>No usamos tus datos para enviarte publicidad sin tu consentimiento</strong> ni los
        compartimos con terceros para fines comerciales.
      </p>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>Solo compartimos datos con los terceros necesarios para concretar tu compra:</p>
      <ul>
        <li><strong>Mercado Pago:</strong> para procesar tu pago.</li>
        <li><strong>Empresas de envío</strong> (DAC, Correo Uruguayo u otras): para entregarte tu pedido.</li>
        <li><strong>Supabase</strong> (proveedor de infraestructura): para almacenar la información del sitio. Los servidores de Supabase están en Estados Unidos.</li>
        <li><strong>Google</strong> (si iniciás sesión con tu cuenta de Google).</li>
      </ul>
      <p>
        Al usar el sitio aceptás esta transferencia internacional de datos, necesaria para el
        funcionamiento del servicio.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        De acuerdo a la Ley 18.331 de Protección de Datos Personales de Uruguay, podés en
        cualquier momento:
      </p>
      <ul>
        <li><strong>Acceder</strong> a los datos que tenemos sobre vos.</li>
        <li><strong>Rectificar</strong> datos incorrectos o incompletos.</li>
        <li><strong>Cancelar</strong> tus datos cuando ya no sean necesarios.</li>
        <li><strong>Oponerte</strong> al tratamiento de tus datos.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escribinos a{" "}
        <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a>. Responderemos en un plazo
        máximo de 5 días hábiles.
      </p>

      <h2>6. Cuánto tiempo conservamos tus datos</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa o sea necesario para cumplir con la
        finalidad de la compra. Si no realizás compras durante un período prolongado, podemos
        eliminar tus datos. También podés solicitar su eliminación en cualquier momento.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas razonables para proteger tus datos: conexión cifrada (HTTPS),
        autenticación segura, acceso restringido a la información. Sin embargo, ningún sistema es
        100% inviolable; te recomendamos elegir contraseñas seguras y no compartir tu acceso.
      </p>

      <h2>8. Cambios en esta política</h2>
      <p>
        Si modificamos esta política, publicaremos la nueva versión en esta misma página con una
        nueva fecha de actualización.
      </p>
    </>
  );
}
