// src/utils/colors.ts

/**
 * Génère une couleur HSL stable basée sur le nom du type
 * @param name - Nom du type de programme
 * @returns Chaîne de couleur HSL (ex: "hsl(120, 70%, 75%)")
 */

export const getColorForType = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 40%)`; // luminosité à 40% pour un fond soutenu
};