import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — 3DMORE",
  description: "Términos y condiciones de venta de 3DMORE.",
};

export default function TerminosPage() {
  return (
    <>
      <h1>Términos y Condiciones</h1>
      <p className="legal-meta">Última actualización: 27 de abril de 2026</p>

      <h2>1. Sobre 3DMORE</h2>
      <p>
        3DMORE es un emprendimiento personal dedicado al diseño, fabricación y venta de accesorios
        decorativos para cascos de moto, fabricados mediante impresión 3D bajo pedido.
      </p>
      <p>
        <strong>Responsable:</strong> Marcos García<br />
        <strong>Contacto:</strong> <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a><br />
        <strong>País de operación:</strong> Uruguay
      </p>

      <h2>2. Aceptación</h2>
      <p>
        Al realizar una compra en este sitio, el cliente declara haber leído, comprendido y aceptado
        estos términos, así como nuestras políticas de privacidad, devoluciones y envíos.
      </p>
      <p>
        El cliente declara ser <strong>mayor de 18 años</strong> o, en caso de ser menor, contar
        con la autorización de su madre, padre o representante legal para realizar la compra.
      </p>

      <h2>3. Productos</h2>
      <p>
        Los productos comercializados por 3DMORE son <strong>accesorios decorativos</strong> para
        cascos de moto. <strong>NO son elementos de seguridad y NO forman parte del casco
        homologado</strong>. Su instalación es responsabilidad exclusiva del usuario y no altera
        ni reemplaza ningún componente de seguridad del casco original.
      </p>
      <p>
        Cada producto se fabrica a pedido en el momento de la compra, con la combinación de colores
        y especificaciones que el cliente selecciona en el sitio. Los colores reales del producto
        impreso son los que el cliente configura en el visor 3D del sitio; las fotografías son
        meramente ilustrativas y de referencia.
      </p>

      <h2>4. Precios y medios de pago</h2>
      <p>
        Todos los precios se expresan en pesos uruguayos (UYU) y son finales al momento de la
        compra. Los costos de envío se informan por separado durante el proceso de checkout.
      </p>
      <p>
        <strong>El valor de los productos se paga online a través de Mercado Pago</strong>
        (tarjetas de crédito, débito y efectivo en redes de cobranza).
      </p>
      <p>
        <strong>El costo del envío se abona al recibir el pedido</strong>, en efectivo o por
        transferencia bancaria al repartidor, según se acuerde al momento de la entrega.
      </p>

      <h2>5. Plazos de fabricación y entrega</h2>
      <p>
        Por tratarse de productos hechos a pedido, los plazos estimados son:
      </p>
      <ul>
        <li><strong>Fabricación:</strong> 3 a 7 días hábiles desde la confirmación del pago.</li>
        <li><strong>Envío:</strong> 1 a 5 días hábiles adicionales según destino y empresa de envío.</li>
      </ul>
      <p>
        Los plazos pueden variar según volumen de pedidos y disponibilidad del courier. Cualquier
        demora será comunicada al cliente.
      </p>

      <h2>6. Limitación de responsabilidad</h2>
      <p>
        3DMORE no se responsabiliza por:
      </p>
      <ul>
        <li>Daños, accidentes o lesiones derivados del uso del casco con o sin estos accesorios.</li>
        <li>Mal uso, manipulación inadecuada o instalación incorrecta del producto por parte del usuario.</li>
        <li>Obstrucciones de visión, audición o aerodinámica del casco causadas por la instalación.</li>
        <li>Modificaciones realizadas al producto luego de su entrega.</li>
      </ul>
      <p>
        El usuario es responsable de verificar que la instalación del accesorio sobre su casco no
        afecte su capacidad de uso ni su seguridad.
      </p>

      <h2>7. Propiedad intelectual</h2>
      <p>
        Todos los diseños, modelos 3D, imágenes, textos y elementos gráficos del sitio son
        propiedad de 3DMORE o están utilizados bajo licencia. Queda prohibida su reproducción,
        copia o redistribución sin autorización expresa.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        3DMORE se reserva el derecho de modificar estos términos en cualquier momento. Las
        modificaciones entran en vigor desde su publicación en el sitio. Las compras realizadas
        antes de una modificación se rigen por los términos vigentes al momento de la compra.
      </p>

      <h2>9. Contacto y reclamos</h2>
      <p>
        Para cualquier consulta o reclamo escribinos a{" "}
        <a href="mailto:3dmore.uy@gmail.com">3dmore.uy@gmail.com</a>. Nos comprometemos a responder
        en un plazo máximo de 5 días hábiles.
      </p>

      <h2>10. Legislación aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República Oriental del Uruguay, en especial
        la Ley 17.250 de Relaciones de Consumo.
      </p>
    </>
  );
}
