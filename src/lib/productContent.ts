import type { Product, ProductVariant } from "@/types";

export const WHATSAPP_NUMBER = "917310045515";
export const STANDARD_SHIPPING = 40;
export const FREE_SHIPPING_THRESHOLD = 650;

export const GENERIC_MATERIALS =
  "Premium yarn, soft cotton/acrylic blend, and hypoallergenic filling where applicable.";

export const CARE_INSTRUCTIONS =
  "Hand wash gently with mild detergent. Lay flat to dry. Avoid wringing and keep away from harsh direct sunlight.";

export function getDispatchDays(product: Product, variant?: ProductVariant | null) {
  const rawHours = variant?.handcraftedHours ?? product.handcraftedHours;
  const hours = Number.parseFloat(String(rawHours || ""));
  const calculatedDays = Number.isFinite(hours) && hours > 0
    ? Math.ceil(hours / 8) + 1
    : 3;

  return Math.max(3, calculatedDays);
}

export function getDispatchText(product: Product, variant?: ProductVariant | null) {
  return `Dispatch in ${getDispatchDays(product, variant)} business days`;
}

export function getShippingText() {
  return `Standard shipping is ₹${STANDARD_SHIPPING} across India. Free shipping on orders above ₹${FREE_SHIPPING_THRESHOLD}.`;
}

export function getCardTrustText(product: Product, variant?: ProductVariant | null) {
  return `Handcrafted • ${getDispatchText(product, variant)}`;
}

export function getProductOneLiner(product: Product) {
  const title = product.title.toLowerCase();
  const category = (product.category || "").toLowerCase();

  if (title.includes("sunflower")) return "Slow-crafted crochet bloom made by hand.";
  if (title.includes("rose")) return "A timeless crochet bloom shaped with care.";
  if (title.includes("tulip")) return "A delicate crochet accent crafted to last.";
  if (title.includes("keyring") || category.includes("keyring")) return "A small handmade detail for everyday charm.";
  if (title.includes("scrunchie")) return "Soft crochet texture for everyday styling.";
  if (title.includes("bag") || category.includes("bag")) return "A statement crochet carryall made stitch by stitch.";
  if (title.includes("top") || category.includes("clothing")) return "A wearable crochet piece shaped with slow craft.";
  if (title.includes("cover")) return "A protective handmade layer with quiet character.";
  if (category.includes("home")) return "Handmade warmth for thoughtful spaces.";

  return "A handcrafted crochet piece made with care.";
}

export function getWhatsAppUrl(product: Product) {
  const message = product.cta?.prefillMessage ||
    `Hi Keshvi Crafts! I want to enquire about ${product.title}. Please share details, customization options, and dispatch timeline.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
