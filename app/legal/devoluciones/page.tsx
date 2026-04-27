import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cambios y Devoluciones — 3DMORE",
  description: "Política de cambios, devoluciones y garantías de 3DMORE.",
};

export default function DevolucionesPage() {
  return (
    <>
      <h1>Política de Cambios y Devoluciones</h1>
      <p className="legal-meta">Última actualización: 27 de abril de 2026</p>

      <h2>1. Productos hechos a pedido</h2>
      <p>
        Todos los productos de 3DMORE se fabrican <strong>a pedido</strong> en el momento de la
        compra, con la combinación de colores y especificaciones que vos elegís en el sitio. Por
        este motivo, el régimen de devoluciones tiene particularidades que detallamos a continuación.
      </p>

      <h2>2. Productos defectuosos o dañados</h2>
      <p>
        Si tu producto llega <strong>defectuoso, roto o con un error de fabricación</strong>,
        tenés derecho a:
      </p>
      <ul>
        <li><strong>Reposición sin costo</strong> del producto, o</li>
        <li><strong>Reembolso total</strong> del valor de los productos pagado online.</li>
      </ul>
      <p>
        Si correspondiera reposición, el reenvío del nuevo producto corre por nuestra cuenta y
        no deberás abonar un nuevo costo de envío.
      </p>
      <p>
        Tenés <strong>5 días hábiles</strong> desde la recepción del pedido para reportar el
        problema. Para hacerlo:
      </p>
      <ol>
        <li>Escribinos a <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a>.</li>
        <li>Adjuntá fotos claras del producto recibido y del paquete.</li>
        <li>Indicá tu número de pedido.</li>
      </ol>
      <p>
        Te responderemos en un máximo de 48 horas hábiles para coordinar el cambio o reembolso.
        El costo del envío de retorno (cuando aplique) corre por nuestra cuenta.
      </p>

      <h2>3. Arrepentimiento (Ley 17.250)</h2>
      <p>
        La Ley de Defensa del Consumidor de Uruguay otorga un derecho de arrepentimiento de
        <strong> 5 días hábiles</strong> para compras a distancia.
      </p>
      <p>
        <strong>Importante:</strong> Este derecho tiene una excepción legal cuando se trata de{" "}
        <em>productos confeccionados conforme a las especificaciones del consumidor</em>, lo cual
        aplica a la mayoría de nuestros productos (fabricados con la combinación de colores que
        elegís específicamente para vos).
      </p>
      <p>
        Aun así, si te arrepentís de tu compra dentro de los 5 días hábiles desde recibido el
        pedido, contactanos y evaluaremos cada caso individualmente. Buscamos siempre una solución
        razonable. En estos casos, el costo del envío de retorno corre por cuenta del cliente.
      </p>

      <h2>4. Cambios por talla o color</h2>
      <p>
        Si querés cambiar el color o el modelo del producto, contactanos. Si el producto aún no
        fue impreso, podemos modificar el pedido sin costo. Si ya fue fabricado, el cambio puede
        implicar un costo adicional según el caso.
      </p>

      <h2>5. Cómo se realiza el reembolso</h2>
      <ul>
        <li>El reembolso del valor de los productos se realiza por el <strong>mismo medio de pago</strong> usado en la compra (Mercado Pago).</li>
        <li>El reembolso se procesa en un plazo aproximado de 5 a 10 días hábiles, según el medio de pago utilizado.</li>
        <li>El costo del envío no se reembolsa por este sistema, ya que se abona directamente al repartidor en la entrega.</li>
      </ul>

      <h2>6. Productos no aptos para devolución</h2>
      <p>No se aceptan devoluciones en los siguientes casos:</p>
      <ul>
        <li>Productos dañados por mal uso, instalación incorrecta o manipulación posterior a la entrega.</li>
        <li>Productos modificados, pintados, lijados o alterados por el cliente.</li>
        <li>Reclamos realizados luego del plazo de 5 días hábiles desde la recepción.</li>
      </ul>

      <h2>7. Garantía</h2>
      <p>
        Todos nuestros productos tienen una <strong>garantía de fabricación de 30 días</strong> a
        partir de la entrega, contra defectos de impresión o ensamblaje. La garantía no cubre
        daños por uso, instalación o exposición a condiciones extremas (temperaturas elevadas,
        productos químicos, impactos).
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para iniciar cualquier proceso de cambio, devolución o reclamo, escribinos a{" "}
        <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a> con tu número de pedido y los
        detalles del caso. Estamos para ayudarte.
      </p>
    </>
  );
}
