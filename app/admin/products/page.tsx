import { getAllProductsAdmin } from "@/lib/actions";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();
  return <ProductsClient initialProducts={products as any} />;
}
