import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import CartModal from "../components/CartModal";
import { CartProvider } from "../lib/CartContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3dMore | Rider Accessories",
  description: "Accessories for helmets, 3D printing and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body>
        <CartProvider>
          <Navbar />
          {children}
          <CartModal />
        </CartProvider>
      </body>
    </html>
  );
}
