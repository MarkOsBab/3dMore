// ─────────────────────────────────────────────────────────────────────────────
// Helpers de envíos / puntos de encuentro
// ─────────────────────────────────────────────────────────────────────────────

export type ShippingMethod =
  | "HOME_MVD"       // legacy: equivalente a MEETING_POINT
  | "MEETING_POINT"
  | "HOME_DELIVERY"
  | "AGENCY"
  | "PICKUP";

export interface ShippingZoneLike {
  id?: string;
  name?: string;
  cost: number;
  isMeetingPoint?: boolean | null;
  meetingPointName?: string | null;
}

/**
 * Una zona "es" punto de encuentro si el admin lo marcó explícitamente
 * (true/false) o, en su defecto, si el costo está dentro del rango aceptable.
 */
export function isMeetingPointZone(zone: ShippingZoneLike): boolean {
  if (zone.isMeetingPoint === true) return true;
  if (zone.isMeetingPoint === false) return false;
  return zone.cost >= 0 && zone.cost <= 100;
}

/**
 * El cliente puede optar por recibir en domicilio (en lugar del punto de
 * encuentro) sólo si la zona es punto de encuentro. La regla actual es la
 * misma: zona-punto-de-encuentro habilita domicilio dentro del barrio.
 */
export function zoneAllowsHomeDelivery(zone: ShippingZoneLike): boolean {
  return isMeetingPointZone(zone);
}

/** Normaliza método legacy HOME_MVD → MEETING_POINT para visualización. */
export function normalizeShippingMethod(method: ShippingMethod): ShippingMethod {
  return method === "HOME_MVD" ? "MEETING_POINT" : method;
}

/** Etiqueta amigable del método. */
export function shippingMethodLabel(method: ShippingMethod): string {
  switch (normalizeShippingMethod(method)) {
    case "MEETING_POINT": return "Punto de encuentro";
    case "HOME_DELIVERY": return "Envío a domicilio";
    case "AGENCY":        return "Agencia DAC";
    case "PICKUP":        return "Retiro en mano";
    default:              return method;
  }
}
