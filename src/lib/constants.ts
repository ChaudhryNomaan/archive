export const CAT_MAP: Record<string, string[]> = {
  "WOMEN": ["accessories", "footwear", "knitwear", "outerwear", "tailoring"],
  "MEN": ["accessories", "footwear", "knitwear", "outerwear", "tailoring"],
  "LAB": ["Prototyping", "Hardware"],
  "COMMUNE": ["Editorial", "Film", "Soundtrack", "Manifesto"]
};

export const ASSETS = Array.from({ length: 45 }, (_, i) => ({
  v: `/images/vid${i + 1}.mp4`, 
  i: `/images/img${i + 1}.jpg`
}));