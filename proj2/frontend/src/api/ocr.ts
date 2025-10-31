// src/api/ocr.ts

export type OCRMenuItem = {
  id?: string | number;
  name?: string;
  description?: string;
  price?: number | string;
  calories?: number | string;
  category?: string;
  ingredients?: string[] | string;
  isVegetarian?: boolean;
  isNonVeg?: boolean;
  servings?: number | string;
  image?: string;
};

type OCRResult = { items: OCRMenuItem[] };

// ✅ Direct local backend URL — no env needed
const BASE = "http://127.0.0.1:8000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---- POST /ocr/parse-menu ---- (PDF upload via FormData)
export async function parseMenuPDF(file: File): Promise<OCRMenuItem[]> {
  const fd = new FormData();
  fd.append("file", file); // backend expects `file`

  const resp = await fetch(`${BASE}/ocr/parse-menu`, {
    method: "POST",
    headers: {
      ...authHeaders(), // don't set Content-Type for FormData
    },
    body: fd,
  });

  if (!resp.ok) {
    const msg = await safeText(resp);
    throw new Error(`OCR PDF failed: ${resp.status} ${resp.statusText}${msg ? `: ${msg}` : ""}`);
  }

  const data = (await resp.json()) as OCRResult;
  return data.items ?? [];
}

// ---- POST /ocr/parse-menu-text ----
// 🔁 Send as form-encoded (or you could use ?text_content=... in the URL).
export async function parseMenuText(text_content: string): Promise<OCRMenuItem[]> {
  const body = new URLSearchParams({ text_content });

  const resp = await fetch(`${BASE}/ocr/parse-menu-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      ...authHeaders(),
    },
    body, // backend signature: text_content: str (query/form param)
  });

  if (!resp.ok) {
    const msg = await safeText(resp);
    throw new Error(`OCR text failed: ${resp.status} ${resp.statusText}${msg ? `: ${msg}` : ""}`);
  }

  const data = (await resp.json()) as OCRResult;
  return data.items ?? [];
}

// ---- Normalize OCR items into your neutral shape (unchanged) ----
export function normalizeOCRItems(items: OCRMenuItem[], restaurantId: string) {
  return (items || []).map((it) => {
    const id = String(it.id ?? randomId());
    const price = toNum(it.price, 0);
    const calories = toNum(it.calories, 0);
    const servings = toNum(it.servings, 1);
    const ingredients = Array.isArray(it.ingredients)
      ? it.ingredients
      : typeof it.ingredients === "string"
      ? it.ingredients.split(/,\s*/g)
      : [];

    const meat = /(chicken|beef|pork|mutton|pepperoni|fish|shrimp|bacon)/i;
    const looksNonVeg = meat.test(it.name || "") || meat.test(it.description || "");

    return {
      id,
      restaurantId,
      name: it.name ?? "Item",
      description: it.description ?? "",
      price,
      calories,
      ingredients,
      category: it.category ?? "Uncategorized",
      isVegetarian: it.isVegetarian ?? !looksNonVeg,
     // isNonVeg: it.isNonVeg ?? looksNonVeg,
      servings,
      image: it.image ?? "",
    };
  });
}

// ---- Utility helpers ----
function toNum(v: number | string | undefined, def = 0) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : def;
  }
  return def;
}

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

async function safeText(resp: Response) {
  try { return await resp.text(); } catch { return ""; }
}
