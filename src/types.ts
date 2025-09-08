export type Product = {
  slug: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  stock?: number;
  badge?: string;
  materials?: string[];
  dimensions?: string;
  handcraftedHours?: string;
  checkoutUrl?: string;
  status?: "live" | "hidden";
};
