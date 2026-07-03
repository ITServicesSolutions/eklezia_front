// utils/dateUtils.ts

/**
 * Convertit une chaîne de date en objet Date.
 * Supporte les formats courants :
 * - ISO : "2026-03-23T09:00:00.000Z"
 * - Avec espace : "2026-03-23 09:00:00"
 * - Français : "lundi 23 mars 2026 à 09:00"
 * - Américain : "03/23/2026 09:00"
 * - Timestamp numérique (secondes ou millisecondes)
 */
export function parseDate(dateStr: string | Date | number): Date | null {
  if (!dateStr) return null;

  // Si c'est déjà un objet Date valide, on le retourne
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }

  // Si c'est un nombre (timestamp)
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(dateStr).trim();

  // --- Tentative 1 : Parser directement avec new Date() ---
  let date = new Date(str);
  if (!isNaN(date.getTime())) return date;

  // --- Tentative 2 : Remplacer l'espace par 'T' et forcer UTC ---
  if (str.includes(' ')) {
    const iso = str.replace(' ', 'T');
    date = new Date(iso + 'Z');
    if (!isNaN(date.getTime())) return date;
  }

  // --- Tentative 3 : Format avec slashs (ex: "2026/03/23 09:00") ---
  if (str.includes('/')) {
    const avecSlash = str.replace(/\//g, '-');
    date = new Date(avecSlash + 'Z');
    if (!isNaN(date.getTime())) return date;
  }

  // --- Tentative 4 : Format français long (jour semaine jour mois année à HH:MM) ---
  const matchFrench = str.match(/(\d{1,2})\s+([a-zéûîâ]+)\s+(\d{4})\s+à\s+(\d{1,2}):(\d{2})/i);
  if (matchFrench) {
    const day = parseInt(matchFrench[1], 10);
    const monthStr = matchFrench[2].toLowerCase();
    const year = parseInt(matchFrench[3], 10);
    const hour = parseInt(matchFrench[4], 10);
    const minute = parseInt(matchFrench[5], 10);

    const monthMap: { [key: string]: number } = {
      janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
      juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11
    };
    const month = monthMap[monthStr];
    if (month !== undefined) {
      return new Date(year, month, day, hour, minute);
    }
  }

  // --- Tentative 5 : Format américain (MM/DD/YYYY HH:MM) ---
  const matchUS = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (matchUS) {
    const month = parseInt(matchUS[1], 10) - 1;
    const day = parseInt(matchUS[2], 10);
    const year = parseInt(matchUS[3], 10);
    const hour = parseInt(matchUS[4], 10);
    const minute = parseInt(matchUS[5], 10);
    return new Date(year, month, day, hour, minute);
  }

  // --- Tentative 6 : Timestamp si la chaîne ne contient que des chiffres ---
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    // Si le nombre a 10 chiffres (secondes) ou 13 (millisecondes)
    if (num > 1000000000) {
      date = new Date(num * (num < 10000000000 ? 1000 : 1));
      if (!isNaN(date.getTime())) return date;
    }
  }

  console.warn('Échec du parsing pour :', str);
  return null;
}

/**
 * Formate une date en français pour l'affichage (jour, mois, année)
 */
export function formatDateFrench(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'Date invalide';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Extrait l'heure d'une date au format "HH:MM"
 */
export function formatTimeFrench(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}