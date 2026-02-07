// lib/bags.ts
"use client";

export type ItemSnapshot = {
  slug: string;
  title: string;
  price: number;
  image: string; // first image
};

type CartItem = ItemSnapshot & { qty: number };
type Collections = Record<string, ItemSnapshot[]>;

const CART_KEY = "cart:v1";
const WISHLIST_KEY = "wishlist:v1";              // array of slugs (for the heart)
const WISHLIST_ITEMS_KEY = "wishlist:items:v1";   // slug -> snapshot
const COLLECTIONS_KEY = "collections:v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage write failed", e);
  }
}

function snap(p: { slug: string; title: string; price: number; images?: string[] }): ItemSnapshot {
  return {
    slug: p.slug,
    title: p.title,
    price: Number(p.price),
    image: p.images?.[0] || "/placeholder.png",
  };
}

// Let UI know something changed (same-tab + cross-tab)
function notify() {
  window.dispatchEvent(new CustomEvent("bag:changed"));
  // also ping storage so other tabs update
  try {
    localStorage.setItem("__bag_ping__", String(Date.now()));
  } catch { }
}

/* ---------------- CART ---------------- */
export function getCart(): CartItem[] {
  return read<CartItem[]>(CART_KEY, []);
}
export function cartCount(): number {
  return getCart().reduce((n, it) => n + it.qty, 0);
}
export function addToCart(p: any, qty = 1) {
  const s = snap(p);
  const list = getCart();
  const i = list.findIndex((x) => x.slug === s.slug);
  if (i >= 0) list[i].qty += qty;
  else list.push({ ...s, qty });
  write(CART_KEY, list);
  notify();
}
export function updateQty(slug: string, qty: number) {
  const list = getCart().map((x) => (x.slug === slug ? { ...x, qty } : x)).filter((x) => x.qty > 0);
  write(CART_KEY, list);
  notify();
}
export function removeFromCart(slug: string) {
  write(CART_KEY, getCart().filter((x) => x.slug !== slug));
  notify();
}
export function clearCart() {
  write<CartItem[]>(CART_KEY, []);
  notify();
}

/* -------------- WISHLIST -------------- */
// We keep two stores:
// 1) WISHLIST_KEY = ["slug", ...]  (for hearts/toggles)
// 2) WISHLIST_ITEMS_KEY = { [slug]: snapshot } (for Wishlist page rendering)
export function toggleWishlist(p: any): boolean {
  const s = snap(p);
  const set = new Set<string>(read<string[]>(WISHLIST_KEY, []));
  const items = read<Record<string, ItemSnapshot>>(WISHLIST_ITEMS_KEY, {});

  let nowIn = false;
  if (set.has(s.slug)) {
    set.delete(s.slug);
    delete items[s.slug];
  } else {
    set.add(s.slug);
    items[s.slug] = s;
    nowIn = true;
  }
  write(WISHLIST_KEY, [...set]);
  write(WISHLIST_ITEMS_KEY, items);
  notify();
  return nowIn;
}

export function getWishlist(): ItemSnapshot[] {
  const slugs = read<string[]>(WISHLIST_KEY, []);
  const items = read<Record<string, ItemSnapshot>>(WISHLIST_ITEMS_KEY, {});
  return slugs.map((slug) => items[slug]).filter(Boolean);
}
export function removeFromWishlist(slug: string) {
  const set = new Set<string>(read<string[]>(WISHLIST_KEY, []));
  const items = read<Record<string, ItemSnapshot>>(WISHLIST_ITEMS_KEY, {});
  set.delete(slug);
  delete items[slug];
  write(WISHLIST_KEY, [...set]);
  write(WISHLIST_ITEMS_KEY, items);
  notify();
}

/* ------------- COLLECTIONS ------------ */
export function getCollections(): Collections {
  return read<Collections>(COLLECTIONS_KEY, {});
}
export function addToCollection(p: any, name?: string) {
  const colls = getCollections();
  const s = snap(p);
  const target = (name || prompt('Add to which collection?', 'keyring') || '').trim();
  if (!target) return;

  const list = colls[target] || [];
  if (!list.some((x) => x.slug === s.slug)) list.push(s);

  colls[target] = list;
  write(COLLECTIONS_KEY, colls);
  notify();
}
export function removeFromCollection(name: string, slug: string) {
  const colls = getCollections();
  if (!colls[name]) return;
  colls[name] = colls[name].filter((x) => x.slug !== slug);
  if (colls[name].length === 0) delete colls[name];
  write(COLLECTIONS_KEY, colls);
  notify();
}
