// app/_lib/openFoodFacts.ts

export type OFFProduct = {
  code: string;
  name: string;
  brands?: string;
  image?: string;
  nutriscore?: string;
  nutriments?: Record<string, number | string>;
};

const UA = "FoodApp/1.0 (Expo; RN)";

const commonHeaders: HeadersInit = {
  Accept: "application/json",
  "User-Agent": UA,
};

function pickName(p: any) {
  return (
    p?.product_name ||
    p?.product_name_fr ||
    p?.product_name_en ||
    "Produit sans nom"
  );
}

const FIELDS = [
  "code",
  "product_name",
  "product_name_fr",
  "product_name_en",
  "brands",
  "nutriments",
  "image_url",
  "nutriscore_grade",
].join(",");

/** API v1 : full-text search */
export async function searchProducts(term: string, signal?: AbortSignal): Promise<OFFProduct[]> {
  const q = term.trim();
  if (q.length < 2) return [];

  const url =
    `https://fr.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(q)}` +
    `&search_simple=1&action=process&json=1` +
    `&fields=${encodeURIComponent(FIELDS)}` +
    `&page_size=20`;

  const res = await fetch(url, { signal, headers: commonHeaders });
  if (!res.ok) return [];

  const json = await res.json();
  const products = Array.isArray(json?.products) ? json.products : [];

  return products
    .filter((p: any) => p?.code)
    .map((p: any) => ({
      code: String(p.code),
      name: pickName(p),
      brands: p.brands,
      image: p.image_url,
      nutriscore: p.nutriscore_grade,
      nutriments: p.nutriments,
    }));
}

/** API v2 : product by barcode */
export async function getProductByBarcode(barcode: string, signal?: AbortSignal): Promise<OFFProduct | null> {
  const code = barcode.trim();
  if (!code) return null;

  const url =
    `https://fr.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json` +
    `?fields=${encodeURIComponent(FIELDS)}`;

  const res = await fetch(url, { signal, headers: commonHeaders });
  if (!res.ok) return null;

  const json = await res.json();
  const p = json?.product;
  if (!p) return null;

  return {
    code: String(p.code ?? code),
    name: pickName(p),
    brands: p.brands,
    image: p.image_url,
    nutriscore: p.nutriscore_grade,
    nutriments: p.nutriments,
  };
}

export function n(v: unknown) {
  const num = typeof v === "number" ? v : Number(v);
  return Number.isFinite(num) ? Math.round(num * 10) / 10 : null;
}
