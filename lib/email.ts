import { Resend } from "resend";

// Inicialización lazy para evitar errores en build time sin API key
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("[Email] RESEND_API_KEY no configurada");
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM ?? "3DMORE <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://3d-more.vercel.app";

type Item = { name: string; quantity: number; price: number };

type OrderData = {
  id: string;
  total: number;
  items: unknown;
  shippingMethod: string;
  shippingData: unknown;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  payerEmail?: string | null;
  payerName?: string | null;
  mpPaymentId?: string | null;
};

function parseItems(raw: unknown): Item[] {
  try {
    const arr = Array.isArray(raw) ? raw : JSON.parse(raw as string);
    return arr as Item[];
  } catch {
    return [];
  }
}

function parseShipping(method: string, raw: unknown): string {
  const labels: Record<string, string> = {
    HOME_MVD: "Envío a domicilio",
    AGENCY: "Agencia de transporte",
    PICKUP: "Retiro en persona",
  };
  let text = labels[method] ?? method;
  try {
    const sd = typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, string> | null);
    if (sd?.address) text += ` — ${sd.address}`;
    if (sd?.zoneName) text += ` (${sd.zoneName})`;
    if (sd?.agency) text += ` — Agencia: ${sd.agency}`;
  } catch {
    // ignorar
  }
  return text;
}

// ─── Email al comprador ────────────────────────────────────────────────────────

export async function sendOrderConfirmedBuyer(order: OrderData) {
  const email = order.customerEmail ?? order.payerEmail;
  if (!email) return;

  const firstName =
    order.customerFirstName ??
    order.payerName?.split(" ")[0] ??
    "cliente";
  const shortId = order.id.slice(-8).toUpperCase();
  const items = parseItems(order.items);
  const shipping = parseShipping(order.shippingMethod, order.shippingData);

  const itemsRows = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${it.name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center">${it.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:right">$${it.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:560px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px">3DMORE</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">Accesorios impresos en 3D</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 8px;font-size:24px">&#10003; Pago confirmado</p>
            <p style="margin:0 0 24px;color:#6b7280">Hola <strong>${firstName}</strong>, tu pago fue aprobado exitosamente.</p>

            <!-- Order badge -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="margin:0;font-size:13px;color:#166534">Número de pedido</p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#166534">#${shortId}</p>
            </div>

            <!-- Items table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Producto</th>
                  <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase">Cant.</th>
                  <th style="padding:8px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase">Precio</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:12px 8px;font-weight:bold;text-align:right">Total:</td>
                  <td style="padding:12px 8px;font-weight:bold;text-align:right;font-size:16px">$${order.total.toFixed(2)} UYU</td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping -->
            <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px">
              <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase">Envío</p>
              <p style="margin:4px 0 0;color:#111">${shipping}</p>
            </div>

            <a href="${SITE_URL}/account/orders"
               style="display:inline-block;background:#111;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
              Ver mis pedidos →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
              Este es un email automático de 3DMORE. Si tenés dudas contactanos a través del sitio.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Pago confirmado — Pedido #${shortId} | 3DMORE`,
    html,
  });
}

// ─── Notificación al admin ─────────────────────────────────────────────────────

export async function sendOrderConfirmedAdmin(order: OrderData) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const shortId = order.id.slice(-8).toUpperCase();
  const buyerName =
    [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") ||
    order.payerName ||
    "—";
  const buyerEmail = order.customerEmail ?? order.payerEmail ?? "—";
  const phone = order.customerPhone ?? "—";
  const items = parseItems(order.items);
  const shipping = parseShipping(order.shippingMethod, order.shippingData);

  const itemsRows = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${it.name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center">${it.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:right">$${it.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:560px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:bold;letter-spacing:1px">3DMORE — Admin</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">Notificación de nuevo pago</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 24px;font-size:22px">Nuevo pago confirmado</p>

            <!-- Order + buyer info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px">Pedido</td>
                <td style="padding:6px 0;font-weight:bold">#${shortId}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px">Comprador</td>
                <td style="padding:6px 0">${buyerName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td>
                <td style="padding:6px 0">${buyerEmail}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px">Teléfono</td>
                <td style="padding:6px 0">${phone}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px">Total</td>
                <td style="padding:6px 0;font-weight:bold;font-size:16px">$${order.total.toFixed(2)} UYU</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px">Envío</td>
                <td style="padding:6px 0">${shipping}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px">Payment ID</td>
                <td style="padding:6px 0;font-size:12px;color:#6b7280">${order.mpPaymentId ?? "—"}</td>
              </tr>
            </table>

            <!-- Items -->
            <p style="margin:0 0 8px;font-weight:bold">Productos</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280">Producto</th>
                  <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280">Cant.</th>
                  <th style="padding:8px;text-align:right;font-size:12px;color:#6b7280">Precio</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
            </table>

            <a href="${SITE_URL}/admin/orders"
               style="display:inline-block;background:#111;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
              Ver en panel admin →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
              3DMORE — Notificación automática del sistema
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Nuevo pedido #${shortId} — $${order.total.toFixed(2)} UYU | 3DMORE`,
    html,
  });
}
