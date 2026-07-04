import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, Video, MessageSquare, ChevronLeft,
  Filter, Calendar, Search, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const B  = '#1a3a8a';
const BM = '#2952cc';
const G  = '#c9a227';
const GL = '#f0d060';
const BG = '#f0f4ff';

interface VerseItem {
  id: number;
  content_type: 'verse' | 'video' | 'message';
  text?: string;
  reference?: string;
  video_url?: string;
  date: string;
  created_at: string;
}

type FilterType = 'all' | 'verse' | 'video' | 'message';

const TYPE_CFG = {
  verse:   { label: 'Verset',  icon: <BookOpen size={13} />,      color: B,        light: '#e0e7ff', grad: `linear-gradient(135deg,${B},${BM})` },
  video:   { label: 'Vidéo',   icon: <Video size={13} />,         color: '#7c3aed', light: '#ede9fe', grad: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
  message: { label: 'Message', icon: <MessageSquare size={13} />, color: '#b45309', light: '#fef3c7', grad: `linear-gradient(135deg,${G},#e8b830)` },
};

const ytId = (url?: string) =>
  url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;

/* ── Card ────────────────────────────────────────────────── */
const VerseCard: React.FC<{ item: VerseItem; isToday: boolean; index: number }> = ({ item, isToday, index }) => {
  const [playing, setPlaying] = useState(false);
  const t   = (item.content_type ?? 'verse') as 'verse' | 'video' | 'message';
  const cfg = TYPE_CFG[t];
  const id  = t === 'video' ? ytId(item.video_url) : null;
  const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;

  const dateLabel = new Date(item.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
      whileHover={{ y: -5, boxShadow: `0 20px 48px ${cfg.color}22` }}
      className="rounded-2xl overflow-hidden bg-white flex flex-col"
      style={{ border: isToday ? `2px solid ${G}` : `1px solid ${BG}` }}
    >
      {/* Bande type + date */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: cfg.grad }}>
        <div className="flex items-center gap-1.5 text-white">
          {cfg.icon}
          <span className="text-[9px] font-black uppercase tracking-widest">{cfg.label}</span>
          {isToday && (
            <span className="ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: GL, color: B }}>● Aujourd'hui</span>
          )}
        </div>
        <span className="text-[9px] text-white/60 capitalize">{dateLabel}</span>
      </div>

      {/* Corps */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Vidéo */}
        {t === 'video' && (
          <div className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
            {playing && id ? (
              <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen title={item.text ?? ''} />
            ) : (
              <>
                {thumb
                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"
                      style={{ background: cfg.grad }}>
                      <Video size={28} className="text-white opacity-30" />
                    </div>
                }
                <button onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group">
                  <motion.div whileHover={{ scale: 1.1 }}
                    className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl"
                    style={{ background: cfg.color }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </motion.div>
                </button>
              </>
            )}
          </div>
        )}

        {/* Verset */}
        {t === 'verse' && (
          <>
            <div className="flex gap-2 items-start">
              <span className="text-4xl font-black leading-none select-none flex-shrink-0 -mt-1"
                style={{ color: `${B}12`, fontFamily: 'Georgia,serif' }}>"</span>
              <p className="text-sm text-gray-700 leading-relaxed italic">{item.text}</p>
            </div>
            {item.reference && (
              <motion.p className="text-xs font-black text-right" style={{ color: G }}
                animate={isToday ? { textShadow: [`0 0 0px ${G}`, `0 0 10px ${G}`, `0 0 0px ${G}`] } : {}}
                transition={{ duration: 2.5, repeat: isToday ? Infinity : 0 }}>
                — {item.reference}
              </motion.p>
            )}
          </>
        )}

        {/* Message */}
        {t === 'message' && (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
            {item.reference && (
              <p className="text-xs font-bold" style={{ color: G }}>— {item.reference}</p>
            )}
          </>
        )}

        {t === 'video' && item.text && (
          <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
        )}
      </div>
    </motion.div>
  );
};

/* ── Page ─────────────────────────────────────────────────── */
const VersetsPage: React.FC = () => {
  const [items, setItems]       = useState<VerseItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterType, setType]   = useState<FilterType>('all');
  const [filterMonth, setMonth] = useState('');
  const [search, setSearch]     = useState('');

  const { scrollY } = useScroll();
  const heroY  = useTransform(scrollY, [0, 250], [0, 50]);
  const heroOp = useTransform(scrollY, [0, 200], [1, 0]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://eklezia.api.it-servicegroup.com';
    fetch(`${baseUrl}/api/v1/verse-of-day/`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Filtre */
  const filtered = useMemo(() => {
    return items.filter(v => {
      if (filterType !== 'all' && v.content_type !== filterType) return false;
      if (filterMonth && !v.date.startsWith(filterMonth)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const inText = v.text?.toLowerCase().includes(q);
        const inRef  = v.reference?.toLowerCase().includes(q);
        if (!inText && !inRef) return false;
      }
      return true;
    });
  }, [items, filterType, filterMonth, search]);

  const todayItem = filtered.find(v => v.date === today);
  const others    = filtered.filter(v => v.date !== today);
  const hasFilter = filterType !== 'all' || filterMonth || search.trim();

  /* Mois disponibles */
  const months = useMemo(() => {
    const set = new Set(items.map(v => v.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [items]);

  /* Compteurs par type */
  const counts = useMemo(() => ({
    all:     items.length,
    verse:   items.filter(v => v.content_type === 'verse').length,
    video:   items.filter(v => v.content_type === 'video').length,
    message: items.filter(v => v.content_type === 'message').length,
  }), [items]);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <PublicNavbar />

      {/* ── Hero animé ── */}
      <section className="relative overflow-hidden"
        style={{ background: `linear-gradient(150deg,${B} 0%,${BM} 60%,#3b6fd4 100%)`, minHeight: 220 }}>

        {/* Déco */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-[.07] bg-white"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }} />
          <motion.div className="absolute -left-8 bottom-0 w-40 h-40 rounded-full opacity-[.07]"
            style={{ background: G }}
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} />
          {/* Particules */}
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2, height: Math.random() * 4 + 2,
                left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%`,
                background: i % 3 === 0 ? GL : 'rgba(255,255,255,.3)',
              }}
              animate={{ y: [-8, 8, -8], opacity: [.2, .7, .2] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative z-10 max-w-5xl mx-auto px-5 pt-24 pb-8">
          <Link to="/home"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-5 transition-colors">
            <ChevronLeft size={13} /> Accueil
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)' }}>
              <BookOpen size={22} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Versets & Messages
              </h1>
              <p className="text-white/50 text-xs mt-0.5">
                {items.length} publication{items.length > 1 ? 's' : ''} au total
              </p>
            </motion.div>
          </div>

          {/* Compteurs animés */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex gap-3 flex-wrap">
            {([['verse','Versets'], ['video','Vidéos'], ['message','Messages']] as const).map(([k, l]) => (
              <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
                {TYPE_CFG[k].icon}
                <span className="font-black text-white">{counts[k]}</span> {l}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Barre de filtres sticky ── */}
      <div className="sticky top-[48px] z-30 shadow-sm"
        style={{ background: '#fff', borderBottom: `1px solid ${BG}` }}>
        <div className="max-w-5xl mx-auto px-5 py-3 flex flex-wrap items-center gap-3">

          {/* Filtre type */}
          <div className="flex gap-1.5 flex-wrap">
            {([
              { k: 'all',     label: 'Tous',     icon: <Filter size={11} /> },
              { k: 'verse',   label: 'Versets',  icon: <BookOpen size={11} /> },
              { k: 'video',   label: 'Vidéos',   icon: <Video size={11} /> },
              { k: 'message', label: 'Messages', icon: <MessageSquare size={11} /> },
            ] as const).map(({ k, label, icon }) => (
              <button key={k} onClick={() => setType(k)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={filterType === k
                  ? { background: k === 'all' ? B : TYPE_CFG[k as 'verse'|'video'|'message']?.color ?? B, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }
                  : { background: BG, color: '#64748b' }
                }>
                {icon} {label}
                <span className="ml-0.5 opacity-60">
                  ({k === 'all' ? counts.all : counts[k as keyof typeof counts]})
                </span>
              </button>
            ))}
          </div>

          {/* Filtre mois */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]"
            style={{ background: BG, color: '#64748b' }}>
            <Calendar size={11} />
            <select value={filterMonth} onChange={e => setMonth(e.target.value)}
              className="bg-transparent outline-none text-[11px] font-semibold cursor-pointer">
              <option value="">Toutes les dates</option>
              {months.map(m => (
                <option key={m} value={m}>
                  {new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          {/* Recherche */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-1 min-w-32"
            style={{ background: BG }}>
            <Search size={11} className="text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="bg-transparent outline-none text-[11px] w-full text-gray-600 placeholder-gray-400" />
            {search && (
              <button onClick={() => setSearch('')} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
          </div>

          {/* Reset */}
          {hasFilter && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => { setType('all'); setMonth(''); setSearch(''); }}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              Réinitialiser
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <motion.div key={i} className="h-48 rounded-2xl bg-white animate-pulse"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: BG }}>
              <BookOpen size={28} className="opacity-20" style={{ color: B }} />
            </div>
            <p className="text-gray-400 text-sm font-semibold">Aucun résultat</p>
            <p className="text-gray-300 text-xs mt-1">Essayez d'autres filtres</p>
          </motion.div>
        ) : (
          <>
            {/* Résultat count */}
            <motion.p layout className="text-xs text-gray-400 font-semibold mb-4">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              {hasFilter ? ' · filtrés' : ''}
            </motion.p>

            {/* Aujourd'hui en vedette */}
            <AnimatePresence mode="popLayout">
              {todayItem && (
                <motion.div key="today-section" layout className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <motion.span className="w-2 h-2 rounded-full"
                      style={{ background: G }}
                      animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: G }}>
                      Aujourd'hui
                    </span>
                  </div>
                  <VerseCard item={todayItem} isToday index={0} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Séparateur */}
            <AnimatePresence>
              {todayItem && others.length > 0 && (
                <motion.div layout key="sep"
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex-1 h-px" style={{ background: `${B}18` }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Publications précédentes
                  </span>
                  <div className="flex-1 h-px" style={{ background: `${B}18` }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grille */}
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {others.map((item, i) => (
                  <VerseCard key={item.id} item={item} isToday={false} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      <PublicFooter />
    </div>
  );
};

export default VersetsPage;
