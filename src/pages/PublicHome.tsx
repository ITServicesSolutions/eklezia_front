import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, CalendarDays, LogIn, Heart,
  ChevronRight, ChevronLeft,
  Users, X, Newspaper,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFeed, type FeedItem } from '../api/feed';
import {
  fetchGospelNews, fetchExternalVerse,
  type GospelArticle, type ExternalVerse,
} from '../api/external';
import logo from '../assets/images/logo_eglise.jpeg';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { Tv2 } from 'lucide-react';

/* ── Couleurs ──────────────────────────────────────────── */
const B  = '#1a3a8a';
const BM = '#2952cc';
const BL = '#4f7af8';
const G  = '#c9a227';
const GL = '#f0d060';
const BG = '#f0f4ff';

/* ── Particules hero ───────────────────────────────────── */
const DOTS = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  s: Math.random() * 5 + 2, dur: Math.random() * 4 + 4,
  delay: Math.random() * 3, gold: i % 4 === 0,
}));

const Particles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {DOTS.map(d => (
      <motion.div key={d.id} className="absolute rounded-full"
        style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s,
          background: d.gold ? GL : 'rgba(255,255,255,.3)' }}
        animate={{ y: [-12, 12, -12], x: [-6, 6, -6], opacity: [.15, .65, .15] }}
        transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
    ))}
    {[{ x: 7, y: 18 }, { x: 87, y: 62 }].map((p, i) => (
      <motion.svg key={i} width="20" height="20" viewBox="0 0 20 20"
        className="absolute opacity-[0.07]"
        style={{ left: `${p.x}%`, top: `${p.y}%` }}
        animate={{ rotate: [0, 20, -20, 0], opacity: [.04, .12, .04] }}
        transition={{ duration: 9 + i * 2, repeat: Infinity, delay: i }}>
        <rect x="8" y="1" width="4" height="18" fill="white" />
        <rect x="1" y="7" width="18" height="4" fill="white" />
      </motion.svg>
    ))}
  </div>
);




/* ── Slides du carousel (photos à placer dans /public/) ─── */
const SLIDES = [
  { src: '/church1.jpg', caption: 'Temple Universitaire · Cotonou' },
  { src: '/church2.jpg', caption: 'Eglise Évangélique des Assemblées de Dieu du Bénin' },
];

/* ── Hero Carousel ─────────────────────────────────────── */
const Hero: React.FC<{ verse: ExternalVerse | null }> = ({ verse }) => {
  const [idx, setIdx]   = useState(0);
  const [imgOk, setImgOk] = useState<boolean[]>(SLIDES.map(() => true));
  const { scrollY } = useScroll();
  const op = useTransform(scrollY, [0, 300], [1, 0]);
  const y  = useTransform(scrollY, [0, 300], [0, 60]);

  /* Auto-play */
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const allBroken = imgOk.every(v => !v);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '88vh' }}>

      {/* ── Fond : soit photo, soit gradient ── */}
      <AnimatePresence initial={false}>
        {!allBroken && imgOk[idx] ? (
          /* Photo avec Ken Burns */
          <motion.div key={`slide-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.12 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: 7, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${SLIDES[idx].src})` }}
              onError={() => setImgOk(prev => { const n = [...prev]; n[idx] = false; return n; })}
            />
            {/* Overlay dégradé bleu pour lisibilité */}
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(180deg, ${B}99 0%, ${B}cc 40%, ${B}f0 100%)` }} />
          </motion.div>
        ) : (
          /* Fallback gradient animé */
          <motion.div key="gradient" className="absolute inset-0"
            style={{ background: `linear-gradient(150deg,${B} 0%,${BM} 55%,${BL} 100%)` }}>
            <Particles />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vague bas */}
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none z-10" viewBox="0 0 1440 50" preserveAspectRatio="none">
        <path d="M0,25 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill={BG} />
      </svg>

      {/* ── Contenu texte ── */}
      <motion.div style={{ y, opacity: op, minHeight: '88vh' }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-5 max-w-2xl mx-auto pt-24 pb-20">

        {/* Logo pulsé */}
        <motion.div className="flex justify-center mb-5"
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}>
          <div className="relative">
            {[1.35, 1.65].map((s, i) => (
              <motion.div key={i} className="absolute inset-0 rounded-full border-2 border-white/25"
                animate={{ scale: [1, s, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }} />
            ))}
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl border-[3px]" style={{ borderColor: GL }}>
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-[10px] font-black uppercase tracking-[.3em] mb-1" style={{ color: GL }}>
          Bienvenue à l'
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-3xl sm:text-4xl font-black text-white leading-tight mb-1">
          Église Évangélique des<br />
          <motion.span style={{ color: GL }}
            animate={{ textShadow: [`0 0 0px ${GL}`, `0 0 18px ${GL}88`, `0 0 0px ${GL}`] }}
            transition={{ duration: 2.8, repeat: Infinity }}>
            Assemblées de Dieu du Bénin
          </motion.span>
        </motion.h1>

        {/* Caption slide courant */}
        <AnimatePresence mode="wait">
          <motion.p key={idx}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="text-white/60 text-xs mb-5">
            {SLIDES[idx].caption}
          </motion.p>
        </AnimatePresence>

        {/* Verset */}
        {verse && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="w-full px-6 py-4 rounded-2xl mb-6 text-left"
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <BookOpen size={11} style={{ color: GL }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: GL }}>Verset du jour</span>
              </div>
              <Link to="/versets"
                className="text-[9px] font-bold px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,.15)', color: GL }}>
                Voir plus →
              </Link>
            </div>
            <p className="text-white/85 text-xs italic leading-relaxed">"{verse.text}"</p>
            <p className="text-center text-[10px] font-bold mt-1.5" style={{ color: GL }}>— {verse.reference}</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-3 justify-center">
          <a href="#actualites"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform"
            style={{ background: G, color: B }}>
            Actualités <ChevronRight size={14} />
          </a>
          <Link to="/login"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-all">
            <LogIn size={14} /> Connexion
          </Link>
        </motion.div>

        {/* Dots navigation */}
        <div className="flex gap-2 mt-8">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 24 : 8, height: 8,
                background: i === idx ? GL : 'rgba(255,255,255,.4)',
              }} />
          ))}
        </div>
      </motion.div>

      {/* Flèches latérales */}
      <button onClick={() => setIdx(i => (i - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)' }}>
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button onClick={() => setIdx(i => (i + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)' }}>
        <ChevronRight size={20} className="text-white" />
      </button>
    </section>
  );
};

/* ── Stats compactes ───────────────────────────────────── */
const Counter: React.FC<{ to: number; sfx?: string }> = ({ to, sfx = '' }) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n = 0;
      const go = () => { n += Math.ceil(to / 40); if (n >= to) { setV(to); return; } setV(n); requestAnimationFrame(go); };
      requestAnimationFrame(go);
      obs.disconnect();
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{sfx}</span>;
};

const Stats: React.FC = () => (
  <div className="flex justify-center gap-6 py-5 px-4" style={{ background: BG }}>
    {[
      { icon: <Users size={14} />, to: 500, sfx: '+', label: 'Fidèles' },
      { icon: <BookOpen size={14} />, to: 10, sfx: ' ans', label: "d'impact" },
      { icon: <Heart size={14} />, to: 52, sfx: '/an', label: 'Vies pour Jésus' },
    ].map((s, i) => (
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
        className="text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: BM }}>
          {s.icon}
          <span className="text-base font-black" style={{ color: B }}>
            <Counter to={s.to} sfx={s.sfx} />
          </span>
        </div>
        <p className="text-[10px] text-gray-400">{s.label}</p>
      </motion.div>
    ))}
  </div>
);

/* ── Carousel générique ────────────────────────────────── */



/* ── Contenu du jour (verset / message / vidéo) ─────────── */
const ytId = (url?: string | null) =>
  url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;

export const DailyContent: React.FC<{
  verse: FeedItem | undefined;
  fallbackVerse: ExternalVerse | null;
}> = ({ verse, fallbackVerse }) => {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const type = (verse?.data?.content_type ?? 'verse') as 'verse' | 'video' | 'message';
  const videoId = type === 'video' ? ytId(verse?.data?.video_url) : null;

  /* Contenu à afficher */
  const text      = verse?.data?.text ?? fallbackVerse?.text ?? "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.";
  const reference = verse?.data?.reference ?? fallbackVerse?.reference ?? 'Jean 3:16';

  const typeLabel = type === 'video' ? '🎬 Vidéo du jour' : type === 'message' ? '✉️ Message du jour' : '📖 Verset du jour';
  const typeIcon  = type === 'video' ? <BookOpen size={16} /> : type === 'message' ? <Sparkles size={16} /> : <BookOpen size={16} />;

  return (
    <section id="verset" className="py-8" style={{ background: '#fff', scrollMarginTop: '60px' }}>
      <div className="max-w-5xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
          style={{ background: `linear-gradient(135deg,${B} 0%,${BM} 100%)` }}>

          {/* Déco fond */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-[.06] bg-white" />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full opacity-[.06]" style={{ background: GL }} />
            <svg className="absolute left-6 top-6 opacity-[.04]" width="60" height="60" viewBox="0 0 60 60">
              <rect x="27" y="4" width="6" height="52" fill="white"/>
              <rect x="8" y="18" width="44" height="6" fill="white"/>
            </svg>
            <svg className="absolute right-10 bottom-8 opacity-[.03]" width="80" height="80" viewBox="0 0 80 80">
              <rect x="36" y="5" width="8" height="70" fill="white"/>
              <rect x="10" y="24" width="60" height="8" fill="white"/>
            </svg>
          </div>

          {/* En-tête */}
          <div className="flex items-center justify-between px-7 pt-6 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                style={{ background: 'rgba(255,255,255,.15)' }}>
                {typeIcon}
              </div>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: GL }}>
                {typeLabel}
              </span>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full capitalize"
              style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)' }}>
              {today}
            </span>
          </div>

          {/* Corps — centré */}
          <div className="px-7 pb-8 flex flex-col items-center text-center">
            {/* VIDÉO */}
            {type === 'video' && videoId && (
              <div className="w-full rounded-2xl overflow-hidden mb-4 shadow-2xl"
                style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Vidéo du jour"
                />
              </div>
            )}
            {type === 'video' && verse?.data?.text && (
              <p className="text-white/75 text-sm leading-relaxed">{verse.data.text}</p>
            )}

            {/* MESSAGE */}
            {type === 'message' && (
              <div className="space-y-3">
                <p className="text-white text-base leading-relaxed">{text}</p>
                {reference && (
                  <p className="text-sm font-bold" style={{ color: GL }}>— {reference}</p>
                )}
              </div>
            )}

            {/* VERSET (défaut) */}
            {type === 'verse' && (
              <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
                {/* Guillemets décoratifs */}
                <span className="text-6xl font-black leading-none select-none"
                  style={{ color: 'rgba(255,255,255,.12)', fontFamily: 'Georgia, serif', marginTop: -12 }}>"</span>
                <div>
                  <p className="text-white text-xl sm:text-2xl leading-relaxed italic mb-3">
                    {text}
                  </p>
                  <motion.p className="text-sm font-black" style={{ color: GL }}
                    animate={{ textShadow: [`0 0 0px ${GL}`, `0 0 16px ${GL}`, `0 0 0px ${GL}`] }}
                    transition={{ duration: 3, repeat: Infinity }}>
                    — {reference}
                  </motion.p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Émission de la semaine ──────────────────────────── */
interface Emission { id: number; title: string; description?: string; video_url: string; week_date: string; is_active: boolean; }



/* ── Page principale ───────────────────────────────────── */
const PublicHome: React.FC = () => {
  const [feed, setFeed]   = useState<FeedItem[]>([]);
  const [news, setNews]   = useState<GospelArticle[]>([]);
  const [verse, setVerse] = useState<ExternalVerse | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    Promise.all([
      getFeed(30).then(setFeed),
      fetchGospelNews().then(setNews),
      fetchExternalVerse().then(setVerse),
    ]).finally(() => setLoading(false));
  }, []);

  const [allEmissions, setAllEmissions] = useState<Emission[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api/v1/weekly-emission/`)
      .then(r => r.json())
      .then(d => setAllEmissions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const emission      = allEmissions.find(e => e.is_active) ?? null;
  const pastEmissions = allEmissions.filter(e => e !== emission);

  // Lecteur vidéo modal
  const [videoPlayer, setVideoPlayer] = useState<{ url: string; title: string } | null>(null);
  const ytIdFromUrl = (url?: string) =>
    url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;

  const events      = feed.filter(f => f.type === 'announcement' || (f.data?.start_date && f.data?.title));
  const localVerse  = feed.find(f => f.type === 'verse');
  const heroVerse   = localVerse
    ? { text: localVerse.data.text, reference: localVerse.data.reference }
    : verse;


  // Auto-rotation des actualités gospel
  const [newsIdx, setNewsIdx] = useState(0);
  useEffect(() => {
    if (news.length < 2) return;
    const t = setInterval(() => setNewsIdx(i => (i + 1) % Math.max(1, news.length - 3)), 5000);
    return () => clearInterval(t);
  }, [news.length]);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <PublicNavbar />

      {/* Hero */}
      <div className="pt-0">
        <Hero verse={heroVerse} />
      </div>

      {/* Stats inline */}
      <Stats />

      {/* Verset / Message / Vidéo du jour */}
      {/* ── Layout Magazine ── */}
      <section id="actualites" className="py-10" style={{ background: BG }}>
        <div className="max-w-screen-xl mx-auto px-5 lg:px-8 space-y-8">

          {/* ÉMISSION — pleine largeur */}
          {emission && (() => {
            const id = emission.video_url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
            const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
            return (
              <motion.div id="emission" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col md:flex-row"
                style={{ border: '1px solid #ede9fe', scrollMarginTop: '60px' }}>
                {/* Vignette vidéo */}
                <div className="relative md:w-1/2 flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                  {thumb
                    ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                        <Tv2 size={36} className="text-white opacity-30" />
                      </div>
                  }
                  <button onClick={() => setVideoPlayer({ url: emission.video_url, title: emission.title })}
                    className="absolute inset-0 flex items-center justify-center group">
                    <motion.div whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                      style={{ background: '#7c3aed' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                    </motion.div>
                  </button>
                </div>
                {/* Infos */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                        style={{ background: '#7c3aed' }}>
                        <Tv2 size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#7c3aed' }}>Émission de la semaine</span>
                      <span className="ml-auto text-[10px] text-gray-400">
                        {new Date(emission.week_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <h2 className="text-lg font-black mb-2 leading-snug" style={{ color: B }}>{emission.title}</h2>
                    {emission.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{emission.description}</p>
                    )}
                  </div>
                  <Link to="/direct"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black self-start"
                    style={{ background: '#7c3aed', color: '#fff' }}>
                    Regarder <ChevronRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })()}

          {/* Émissions précédentes */}
          {pastEmissions.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Émissions précédentes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {pastEmissions.map((e, i) => {
                  const id = e.video_url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
                  const thumb = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
                  return (
                    <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="rounded-xl overflow-hidden bg-white cursor-pointer transition-all"
                      style={{ border: '1px solid #ede9fe' }}
                      onClick={() => setVideoPlayer({ url: e.video_url, title: e.title })}>
                      <div className="relative" style={{ aspectRatio: '16/9' }}>
                        {thumb
                          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                              <Tv2 size={20} className="text-white opacity-30" />
                            </div>
                        }
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(0,0,0,.4)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#7c3aed"><polygon points="5,3 19,12 5,21" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-bold line-clamp-2" style={{ color: B }}>{e.title}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">
                          {new Date(e.week_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2 COLONNES : Événements | Actualités Gospel */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-96 rounded-2xl bg-white animate-pulse" />
              <div className="md:col-span-2 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-white animate-pulse" />)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* ÉVÉNEMENTS — colonne gauche (1/3) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background: B }}>
                    <CalendarDays size={12} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: B }}>Événements</span>
                </div>

                {events.length === 0 ? (
                  <div className="rounded-2xl p-5 text-center bg-white" style={{ border: `1px solid ${BG}` }}>
                    <p className="text-xs text-gray-400">Aucun événement</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.slice(0, 5).map((e: FeedItem, i: number) => {
                      const start = new Date(e.data.start_date);
                      const now = new Date();
                      const past = start < now;
                      const ongoing = !past && new Date(e.data.end_date ?? e.data.start_date) >= now;
                      return (
                        <motion.div key={e.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                          className="rounded-2xl overflow-hidden bg-white flex items-stretch"
                          style={{ border: `1px solid ${BG}` }}>
                          {/* Bande date */}
                          <div className="px-3 py-3 flex flex-col items-center justify-center flex-shrink-0 text-white"
                            style={{ background: past ? '#94a3b8' : ongoing ? '#10b981' : B, minWidth: 52 }}>
                            <span className="text-lg font-black leading-none">{start.getDate()}</span>
                            <span className="text-[9px] uppercase opacity-75">
                              {start.toLocaleDateString('fr-FR', { month: 'short' })}
                            </span>
                          </div>
                          <div className="px-3 py-2.5 flex-1 min-w-0">
                            <p className="text-xs font-bold line-clamp-1" style={{ color: B }}>{e.data.title}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">
                              {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {ongoing && <span className="ml-1 text-emerald-500 font-bold">● En cours</span>}
                              {past    && <span className="ml-1 text-gray-300">Passé</span>}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ACTUALITÉS GOSPEL — colonne droite (2/3) */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background: BM }}>
                    <Newspaper size={12} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: BM }}>Actualités Gospel</span>
                </div>

                {news.length === 0 ? (
                  <div className="rounded-2xl p-5 text-center bg-white" style={{ border: `1px solid ${BG}` }}>
                    <p className="text-xs text-gray-400">Chargement des actualités...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Article vedette — tourne automatiquement */}
                    {news[newsIdx] && (() => {
                      const a = news[newsIdx];
                      return (
                        <motion.a href={a.link} target="_blank" rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                          whileHover={{ y: -2 }}
                          className="rounded-2xl overflow-hidden bg-white flex flex-col cursor-pointer transition-all block"
                          style={{ border: `1px solid ${BG}` }}>
                          {a.thumbnail && (
                            <img src={a.thumbnail} alt="" className="w-full h-44 object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: BG, color: BM }}>{a.source}</span>
                              <span className="text-[9px] text-gray-400 ml-auto">{new Date(a.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <h3 className="font-black text-sm mb-1 line-clamp-2" style={{ color: B }}>{a.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2">{a.description}</p>
                          </div>
                        </motion.a>
                      );
                    })()}

                    {/* Articles secondaires */}
                    {[...news.slice(newsIdx + 1), ...news.slice(0, newsIdx)].slice(0, 3).map((a, i) => (
                      <motion.a key={i} href={a.link} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                        whileHover={{ x: 3 }}
                        className="rounded-2xl overflow-hidden bg-white flex gap-3 items-start cursor-pointer transition-all block"
                        style={{ border: `1px solid ${BG}` }}>
                        {a.thumbnail ? (
                          <img src={a.thumbnail} alt="" className="w-20 h-16 object-cover flex-shrink-0 rounded-l-2xl"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-20 h-16 flex-shrink-0 rounded-l-2xl flex items-center justify-center"
                            style={{ background: `${BM}15` }}>
                            <Newspaper size={16} style={{ color: BM, opacity: 0.3 }} />
                          </div>
                        )}
                        <div className="py-2.5 pr-3 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: BG, color: BM }}>{a.source}</span>
                            <span className="text-[8px] text-gray-400">{new Date(a.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <h3 className="font-bold text-xs line-clamp-2" style={{ color: B }}>{a.title}</h3>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />

      {/* ── Modal lecteur vidéo ── */}
      <AnimatePresence>
        {videoPlayer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setVideoPlayer(null)}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                    style={{ background: '#7c3aed' }}>
                    <Tv2 size={12} />
                  </div>
                  <p className="text-white font-bold text-sm truncate max-w-xs">{videoPlayer.title}</p>
                </div>
                <button onClick={() => setVideoPlayer(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Player */}
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-black"
                style={{ aspectRatio: '16/9' }}>
                {ytIdFromUrl(videoPlayer.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytIdFromUrl(videoPlayer.url)}?autoplay=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={videoPlayer.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
                    <p className="text-white/50 text-sm">Vidéo non disponible</p>
                  </div>
                )}
              </div>

              <p className="text-white/30 text-[10px] text-center mt-3">
                Cliquez en dehors pour fermer
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHome;
