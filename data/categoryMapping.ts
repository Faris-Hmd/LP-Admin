export const categoryLabels: Record<string, string> = {
  PC: "بيتزا",
  LAPTOP: "ساندوتشات",
  WEBCAMS: "مقبلات",
  HARD_DRIVES: "مشروبات باردة",
  HEADSETS: "مشروبات ساخنة",
  KEYBOARDS: "حلويات",
  SPEAKERS: "سلطات",
  PRINTERS: "وجبات عائلية",
  MICROPHONES: "إضافات",
  MONITORS: "بيتزا إيطالية",
  SSD: "بيتزا شرقية",
  MOUSES: "وجبات سريعة",
  TABLETS: "أجهزة لوحية",
  PROJECTORS: "بروجكترات",
  SCANNERS: "ماسحات ضوئية",
  DESKTOP: "كمبيوتر مكتبي",
};

export const getCategoryLabel = (key: string): string => {
  return categoryLabels[key] || key.replace(/_/g, " ");
};
