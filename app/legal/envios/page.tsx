import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Envíos — 3DMORE",
  description: "Información sobre envíos, plazos y costos de 3DMORE.",
};

export default function EnviosPage() {
  return (
    <>
      <h1>Política de Envíos</h1>
      <p className="legal-meta">Última actualización: 27 de abril de 2026</p>

      <h2>1. Modalidades de entrega y zonas de cobertura</h2>
      <p>
        Realizamos entregas en <strong>todo Uruguay</strong>. La modalidad principal en
        Montevideo y zona metropolitana son los <strong>puntos de encuentro</strong>:
        lugares públicos previamente definidos donde coordinamos la entrega contigo por
        WhatsApp (día y horario).
      </p>
      <ul>
        <li>
          <strong>Punto de encuentro (Montevideo):</strong> seleccionás tu zona durante el
          checkout y la entrega se realiza en el punto de encuentro asociado a esa zona.
          El costo varía según la zona.
        </li>
        <li>
          <strong>Envío a domicilio:</strong> disponible <em>únicamente</em> en barrios
          cubiertos por puntos de encuentro cercanos (zonas con costo de entrega entre
          $0 y $100 UYU). Cuando la zona seleccionada lo permite, podés tildar la opción
          &quot;Prefiero recibir en mi domicilio&quot; durante el checkout.
        </li>
        <li>
          <strong>Interior del país:</strong> envíos a través de <strong>agencia DAC</strong>.
          El cliente retira el paquete en la agencia DAC más cercana a su localidad.
        </li>
        <li>
          También trabajamos con <strong>Correo Uruguayo</strong> y otras empresas de logística
          según disponibilidad y conveniencia.
        </li>
      </ul>

      <h2>2. Plazos</h2>
      <p>
        Como nuestros productos se fabrican a pedido, el plazo total se compone de dos etapas:
      </p>
      <ul>
        <li><strong>Fabricación:</strong> 3 a 7 días hábiles desde la confirmación del pago.</li>
        <li><strong>Tránsito:</strong> 1 a 5 días hábiles según destino y empresa de envío.</li>
      </ul>
      <p>
        <strong>Plazo total estimado:</strong> 4 a 12 días hábiles desde la compra confirmada.
      </p>
      <p>
        Estos plazos son estimados y pueden variar según la demanda, el destino y la disponibilidad
        del courier. Cualquier demora será comunicada al cliente.
      </p>

      <h2>3. Costos y forma de pago del envío</h2>
      <p>
        El costo del envío se calcula al momento del checkout en función del destino del
        pedido. Te lo mostramos antes de confirmar la compra.
      </p>
      <p>
        <strong>El envío se abona al recibir el pedido</strong>, en efectivo o por transferencia
        bancaria al repartidor. <strong>El valor de los productos sí se paga online</strong> a
        través de Mercado Pago, al momento de la compra.
      </p>

      <h2>4. Seguimiento</h2>
      <p>
        Una vez despachado tu pedido, te avisaremos por email o WhatsApp. El código de
        seguimiento de la empresa de logística (cuando esté disponible) podrás consultarlo en{" "}
        <strong>Mi cuenta &gt; Pedidos</strong>, dentro de la información de envío del pedido
        correspondiente.
      </p>

      <h2>5. Recepción del pedido</h2>
      <p>
        Al recibir tu pedido, te recomendamos:
      </p>
      <ul>
        <li>Verificar que el paquete esté en buen estado antes de firmar la recepción.</li>
        <li>Si el paquete llega visiblemente dañado, fotografialo antes de abrirlo.</li>
        <li>Revisar el contenido dentro de las 48 horas y reportar cualquier problema.</li>
      </ul>

      <h2>6. Pedidos perdidos o dañados en tránsito</h2>
      <p>
        Si tu pedido se pierde durante el envío o llega dañado:
      </p>
      <ul>
        <li>Contactanos a <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a> con tu número de pedido.</li>
        <li>Iniciaremos el reclamo correspondiente con la empresa de logística.</li>
        <li>Si el reclamo procede, reenviamos tu pedido sin costo o procesamos el reembolso.</li>
      </ul>

      <h2>7. Direcciones incorrectas</h2>
      <p>
        Es responsabilidad del cliente proporcionar una dirección de entrega correcta y completa.
        Si un envío es devuelto por dirección incorrecta, el cliente deberá abonar el costo del
        nuevo envío para reenviarlo.
      </p>

      <h2>8. Retiro en mano</h2>
      <p>
        En algunos casos podemos coordinar el retiro en mano del pedido en zonas específicas de
        Montevideo. Si te interesa esta opción, consultanos por WhatsApp antes de comprar.
      </p>
    </>
  );
}
