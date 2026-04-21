export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isOffer?: boolean;
  discountPercentage?: number;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Cuernos de Demonio",
    description: "Cuernos impresos en 3D super resistentes con anclaje universal para cualquier casco. Ideales para un look agresivo y darkrider.",
    price: 850,
    imageUrl: "/images/cuernos_demonio.webp",
    category: "cuernos",
    isOffer: true,
    discountPercentage: 15
  },
  {
    id: "2",
    name: "Orejitas de Gato",
    description: "Orejitas estilo Neko, aerodinámicas y con colores vibrantes disponibles. Adhesivo de doble cara incluído.",
    price: 700,
    imageUrl: "/images/orejitas_gato.webp",
    category: "orejas"
  },
  {
    id: "3",
    name: "Moño Kawaii",
    description: "Moño decorativo impreso en 3D para la parte trasera de tu casco. Personaliza tu rodada con elegancia.",
    price: 450,
    imageUrl: "/images/mono_elegante.webp",
    category: "moños"
  },
  {
    id: "4",
    name: "Cresta Punk Neón",
    description: "Cresta aerodinámica desmontable en colores flúo. Hazte notar en las rodadas nocturnas.",
    price: 1200,
    imageUrl: "/images/cresta_punk.webp",
    category: "accesorios",
    isOffer: true,
    discountPercentage: 10
  }
];
