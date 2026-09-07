export type Category = {
  slug: string;
  name: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { slug: "gpu", name: "GPU", icon: "Component" },
  { slug: "full-cases", name: "Full Cases", icon: "MonitorSmartphone" },
  { slug: "cpu", name: "CPU", icon: "Cpu" },
  { slug: "ram", name: "RAM", icon: "CircuitBoard" },
  { slug: "storage", name: "Storage", icon: "HardDrive" },
  { slug: "motherboard", name: "Motherboard", icon: "Microchip" },
  { slug: "monitor", name: "Monitor", icon: "Monitor" },
  { slug: "psu", name: "PSU", icon: "PlugZap" },
  { slug: "case", name: "Case", icon: "Server" },
  { slug: "accessories", name: "Accessories", icon: "Headphones" },
  { slug: "gaming", name: "Equipment", icon: "Wrench" },
];

export const CITIES = [
  "دمشق",
  "ريف دمشق",
  "حلب",
  "حمص",
  "حماة",
  "اللاذقية",
  "طرطوس",
  "دير الزور",
  "الحسكة",
  "الرقة",
  "إدلب",
  "درعا",
  "السويداء",
  "القنيطرة",
];

export const DEFAULT_CITY = "دمشق";

export const CONDITION_LABEL: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
};

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
