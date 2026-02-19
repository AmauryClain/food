export type OFFProduct = {
  code: string;
  name: string;
  brands?: string;
  image?: string;
  nutriscore?: string; // a,b,c,d,e
  nutriments?: Record<string, number | string>;
};

const USER_AGENT = "FoodApp/1.0 (Expo; ReactNative)"; // mets le nom que tu veux

const headers: HeadersInit = {
  Accept: "application/json",
  "User-Agent": USER_AGENT,
};

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

function pickName(p: any) {
  return (
    p?.product_name ||
    p?.product_name_fr ||
    p?.product_name_en ||
    "Produit sans nom"
  );
}

export async function searchProducts(
  term: string,
  signal?: AbortSignal
): Promise<OFFProduct[]> {
  const q = term.trim();
  if (q.length < 2) return [];

  const url =
    `https://fr.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(q)}` +
    `&search_simple=1&action=process&json=1` +
    `&fields=${encodeURIComponent(FIELDS)}` +
    `&page_size=20`;

  const res = await fetch(url, { signal, headers });
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


export async function getProductByBarcode(
  barcode: string,
  signal?: AbortSignal
): Promise<OFFProduct | null> {
  const code = barcode.trim();
  if (!code) return null;

  const url =
    `https://fr.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json` +
    `?fields=${encodeURIComponent(FIELDS)}`;

  const res = await fetch(url, { signal, headers });
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

export function formatNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "—";
  return String(Math.round(n * 10) / 10);
}
