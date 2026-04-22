import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import CartModal from "../components/CartModal";
import CartToast from "../components/CartToast";
import { CartProvider } from "../lib/CartContext";
import { AuthProvider } from "../lib/AuthContext";

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
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <CartModal />
            <CartToast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
