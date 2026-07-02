/* Actualités gospel et versets depuis des APIs publiques gratuites */

export interface GospelArticle {
  title: string;
  pubDate: string;
  link: string;
  description: string;
  thumbnail?: string | null;
  source: string;
}

export interface ExternalVerse {
  text: string;
  reference: string;
}

/* Versets français de secours (Louis Segond) */
const FALLBACK_VERSES: ExternalVerse[] = [
  { text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", reference: "Jean 3:16" },
  { text: "Je puis tout par celui qui me fortifie.", reference: "Philippiens 4:13" },
  { text: "L'Éternel est mon berger : je ne manquerai de rien.", reference: "Psaumes 23:1" },
  { text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", reference: "Jérémie 29:11" },
  { text: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu ; je te fortifie, je viens à ton secours.", reference: "Ésaïe 41:10" },
  { text: "Remets ton sort à l'Éternel, mets en lui ta confiance, et il agira.", reference: "Psaumes 37:5" },
  { text: "Heureux ceux qui ont le cœur pur, car ils verront Dieu.", reference: "Matthieu 5:8" },
  { text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", reference: "Matthieu 11:28" },
  { text: "C'est par la grâce que vous êtes sauvés, par le moyen de la foi.", reference: "Éphésiens 2:8" },
  { text: "En toutes choses nous sommes plus que vainqueurs par celui qui nous a aimés.", reference: "Romains 8:37" },
];

/* Sources RSS exclusivement évangéliques confirmées */
const RSS_SOURCES = [
  { url: 'https://evangeliques.info/feed/',          name: 'Évangéliques.info' },   // FR
  { url: 'https://www.charismanews.com/feed/',       name: 'Charisma News' },        // Pentecôtiste
  { url: 'https://www.faithwire.com/feed/',          name: 'Faithwire' },             // Évangélique
  { url: 'https://www.christianpost.com/rss/',       name: 'Christian Post' },        // Chrétien général
  { url: 'https://www.christianheadlines.com/feed/', name: 'Christian Headlines' },   // Évangélique
];

const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 200);

function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
}

export async function fetchGospelNews(): Promise<GospelArticle[]> {
  const results: GospelArticle[] = [];

  await Promise.allSettled(
    RSS_SOURCES.map(async ({ url, name }) => {
      const res = await fetchWithTimeout(
        `${RSS2JSON}?rss_url=${encodeURIComponent(url)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.status !== 'ok' || !Array.isArray(data.items)) return;

      for (const item of data.items) {
        const thumb = item.thumbnail
          || (item.enclosure?.type?.startsWith('image/') ? item.enclosure.link : null)
          || null;
        results.push({
          title: item.title || '',
          pubDate: item.pubDate || new Date().toISOString(),
          link: item.link || '#',
          description: stripHtml(item.description || item.content || ''),
          thumbnail: thumb,
          source: name,
        });
      }
    })
  );

  return results
    .filter(a => a.title)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 12);
}

export async function fetchExternalVerse(): Promise<ExternalVerse> {
  try {
    const res = await fetchWithTimeout(
      'https://labs.bible.org/api/?passage=random&type=json',
      4000
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.text) {
      return {
        text: data[0].text,
        reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse} (NLT)`,
      };
    }
  } catch { /* fallback */ }

  return FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
}
