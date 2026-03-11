import { CAT_MAP, ASSETS } from './constants';
import { slugify } from '@/utils/slugify';

export const MASTER_VAULT: any[] = [];

Object.keys(CAT_MAP).forEach((cat, ci) => {
  CAT_MAP[cat].forEach((sub, si) => {
    for (let i = 1; i <= 34; i++) {
      const catPath = slugify(cat);
      const subPath = slugify(sub);
      const imageIndex = ((i - 1) % 10) + 1;
      const localBase = `/${catPath}/${subPath}/${imageIndex}`;
      const idx = (ci + si + i) % ASSETS.length;

      MASTER_VAULT.push({
        id: `velos-${catPath}-${subPath}-${i}`,
        category: cat,
        subCategory: sub,
        name: cat === "COMMUNE" ? `${sub.toUpperCase()} // VOL.${i < 10 ? '0'+i : i}` : `${sub.toUpperCase()} UNIT ${100 + i}`,
        price: (450 + (si * 50) + (i * 15)).toFixed(2),
        sku: `VL-26-${cat.slice(0, 2)}-${si}${i}`,
        basePath: localBase,
        fallbackIdx: idx,
        description: cat === "COMMUNE" ? "A visual exploration..." : "A modular garment...",
        techSpecs: cat === "COMMUNE" ? ["Digital Format", "4K"] : ["3L Gore-Tex", "Magnetic"],
        materials: cat === "COMMUNE" ? "Digital Media" : "Laminated Nylon",
        care: cat === "COMMUNE" ? "N/A" : "Clean with damp cloth."
      });
    }
  });
});