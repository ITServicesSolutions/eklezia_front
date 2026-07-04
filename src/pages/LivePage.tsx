import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Filter, CalendarDays, ChevronLeft, WifiOff, X, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import axiosInstance from '../api/axiosInstance';

const B  = '#1a3a8a';
const BM = '#2952cc';

const BG = '#f0f4ff';


interface LiveSession {
  id: number; title: string; description: string;
  is_live: boolean; is_ended: boolean;
  video_url: string; start_date: string;
  thumbnail_url?: string;
}

type FilterType = 'all' | 'live' | 'rediff' | 'upcoming';

const ytId = (url?: string) =>
  url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;

/* Classification par rapport à la date du jour */
const classify = (s: LiveSession): 'live' | 'upcoming' | 'rediff' => {
  if (s.is_live) return 'live';
  const start = new Date(s.start_date);
  const now   = new Date();
  return start > now ? 'upcoming' : 'rediff';
};

/* ── Carte vidéo ──────────────────────────────────────── */
const VideoCard: React.FC<{
  s: LiveSession; index: number;
  onPlay: (url: string, title: string) => void;
}> = ({ s, index, onPlay }) => {
  const id    = ytId(s.video_url);
  const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  const date  = new Date(s.start_date);

  const cls = classify(s);
  const badge = cls === 'live'
    ? { label: '● EN DIRECT', bg: '#ef4444', pulse: true }
    : cls === 'rediff'
    ? { label: 'REDIFFUSION', bg: '#64748b', pulse: false }
    : { label: 'À VENIR',     bg: BM,        pulse: false };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: `0 16px 40px ${B}20` }}
      className="rounded-2xl overflow-hidden bg-white flex flex-col cursor-pointer transition-all"
      style={{ border: `1px solid ${BG}` }}
      onClick={() => s.video_url && onPlay(s.video_url, s.title)}>

      {/* Miniature */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        {thumb
          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
              <Radio size={28} className="text-white opacity-25" />
            </div>
        }
        {/* Overlay play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl bg-white/90">
            <Play size={18} style={{ color: B }} />
          </div>
        </div>
        {/* Badge */}
        <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full text-white ${badge.pulse ? 'animate-pulse' : ''}`}
          style={{ background: badge.bg }}>
          {badge.label}
        </span>
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-xs line-clamp-2" style={{ color: B }}>{s.title}</h3>
        <p className="text-[10px] text-gray-400">
          {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}
          {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

/* ── Page ─────────────────────────────────────────────── */
const LivePage: React.FC = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterType>('all');
  const [month, setMonth]       = useState('');
  const [player, setPlayer]     = useState<{ url: string; title: string } | null>(null);

  const load = () =>
    axiosInstance.get('/api/v1/livestreams/')
      .then(r => setSessions(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const active = sessions.find(s => s.is_live);

  /* Filtrage */
  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (filter !== 'all') return classify(s) === filter;
      return true;
    }).filter(s => {
      if (!month) return true;
      return s.start_date.startsWith(month);
    });
  }, [sessions, filter, month]);

  /* Mois disponibles */
  const months = useMemo(() => {
    const set = new Set(sessions.map(s => s.start_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [sessions]);

  /* Galerie = non-live sessions */
  const galerie = filtered.filter(s => !s.is_live);


  const FILTERS: { k: FilterType; label: string; count: number }[] = [
    { k: 'all',      label: 'Tous',         count: sessions.length },
    { k: 'live',     label: '● En direct',  count: sessions.filter(s => classify(s) === 'live').length },
    { k: 'upcoming', label: 'À venir',      count: sessions.filter(s => classify(s) === 'upcoming').length },
    { k: 'rediff',   label: 'Rediffusions', count: sessions.filter(s => classify(s) === 'rediff').length },
  ];

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-10"
        style={{ background: `linear-gradient(150deg,${B} 0%,${BM} 60%,#3b6fd4 100%)` }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-[.07] bg-white pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-5">
          <Link to="/home" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-5 transition-colors">
            <ChevronLeft size={13} /> Accueil
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              {active && (
                <motion.div className="absolute inset-0 rounded-xl bg-red-500"
                  animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
              )}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white relative z-10"
                style={{ background: active ? '#ef4444' : 'rgba(255,255,255,.15)' }}>
                <Radio size={22} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">Culte en direct</h1>
                {active && <span className="text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse bg-red-500 text-white">● LIVE</span>}
              </div>
              <p className="text-white/50 text-xs mt-0.5">{sessions.length} diffusion{sessions.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Barre de filtres sticky ── */}
      <div className="sticky top-[48px] z-30 bg-white shadow-sm border-b" style={{ borderColor: BG }}>
        <div className="max-w-5xl mx-auto px-5 py-3 flex flex-wrap items-center gap-3">
          {/* Type */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={filter === f.k
                  ? { background: f.k === 'live' ? '#ef4444' : B, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }
                  : { background: BG, color: '#64748b' }
                }>
                {f.label} <span className="opacity-60">({f.count})</span>
              </button>
            ))}
          </div>

          {/* Mois */}
          {months.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]"
              style={{ background: BG, color: '#64748b' }}>
              <CalendarDays size={11} />
              <select value={month} onChange={e => setMonth(e.target.value)}
                className="bg-transparent outline-none text-[11px] font-semibold cursor-pointer">
                <option value="">Toutes les dates</option>
                {months.map(m => (
                  <option key={m} value={m}>
                    {new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset */}
          {(filter !== 'all' || month) && (
            <button onClick={() => { setFilter('all'); setMonth(''); }}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              Réinitialiser
            </button>
          )}

          <span className="ml-auto text-[10px] text-gray-400">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10 space-y-10">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-52 rounded-2xl bg-white animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* ── Live actif ── */}
            <AnimatePresence>
              {active && (filter === 'all' || filter === 'live') && (
                <motion.div key="live-active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                    style={{ border: '2px solid #ef4444' }}
                    onClick={() => setPlayer({ url: active.video_url, title: active.title })}>
                    <div className="px-5 py-3 flex items-center gap-3"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                      <motion.div className="w-2.5 h-2.5 rounded-full bg-white"
                        animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                      <span className="text-white font-black text-sm">En direct maintenant · {active.title}</span>
                    </div>
                    <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                      {ytId(active.video_url) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId(active.video_url)}?autoplay=1&rel=0&modestbranding=1`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          allowFullScreen title={active.title}
                          onClick={e => e.stopPropagation()} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
                          <WifiOff size={40} className="text-white opacity-20" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pas de live ── */}
            {!active && (filter === 'all' || filter === 'live') && sessions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-10 text-center bg-white" style={{ border: `1px solid ${BG}` }}>
                <WifiOff size={32} className="mx-auto mb-3 opacity-20" style={{ color: B }} />
                <p className="font-black text-sm mb-1" style={{ color: B }}>Pas de diffusion en ce moment</p>
                <p className="text-xs text-gray-400">Le prochain culte sera diffusé prochainement</p>
              </motion.div>
            )}

            {/* ── Galerie ── */}
            {galerie.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white" style={{ background: B }}>
                    <Filter size={13} />
                  </div>
                  <h2 className="font-black text-sm" style={{ color: B }}>Galerie</h2>
                  <div className="flex-1 h-px ml-2" style={{ background: `${B}20` }} />
                  <span className="text-[10px] text-gray-400">{galerie.length} vidéo{galerie.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galerie.map((s, i) => (
                    <VideoCard key={s.id} s={s} index={i} onPlay={(url, title) => setPlayer({ url, title })} />
                  ))}
                </div>
              </div>
            )}

            {/* Aucun résultat */}
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <Radio size={36} className="mx-auto mb-3 opacity-20" style={{ color: B }} />
                <p className="text-sm text-gray-400">Aucune diffusion pour ce filtre</p>
              </div>
            )}
          </>
        )}
      </div>

      <PublicFooter />

      {/* ── Modal lecteur ── */}
      <AnimatePresence>
        {player && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPlayer(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-bold text-sm truncate max-w-sm">{player.title}</p>
                <button onClick={() => setPlayer(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20">
                  <X size={18} />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                {ytId(player.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId(player.url)}?autoplay=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen title={player.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
                    <p className="text-white/40 text-sm">Vidéo non disponible</p>
                  </div>
                )}
              </div>
              <p className="text-white/25 text-[10px] text-center mt-3">Cliquez en dehors pour fermer</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LivePage;
