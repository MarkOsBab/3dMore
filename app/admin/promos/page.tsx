import { getPromoCodes } from "@/lib/actions";
import PromosClient from "./PromosClient";

export default async function AdminPromosPage() {
  const promos = await getPromoCodes();
  return <PromosClient initialPromos={promos as any} />;
}
