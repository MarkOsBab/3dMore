import { getAllProductsAdmin } from "@/lib/actions";
import ProductsClient from "./ProductsClient";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();
  return <ProductsClient initialProducts={products as any} />;
}
