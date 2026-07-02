import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Plus, X, Trash2, Square, Play, Youtube, Clock, Eye } from 'lucide-react';
import {
  fetchLivestreams,
  createLivestream,
  deleteLivestream,
  startLivestream,
  stopLivestream,
  extractYoutubeId,
  type Livestream,
} from '../api/livestreams';

const LiveStreams: React.FC = () => {
  const [lives, setLives] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Preview modal
  const [preview, setPreview] = useState<Livestream | null>(null);

  useEffect(() => { load(); }, []);

  const showToast = (t: string, icon: 'success' | 'error' = 'success') =>
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      .fire({ icon, title: t });

  const load = async () => {
    setLoading(true);
    try { setLives(await fetchLivestreams()); }
    catch { showToast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) { showToast('L\'URL YouTube est requise', 'error'); return; }
    const ytId = extractYoutubeId(videoUrl);
    if (!ytId) { showToast('URL YouTube invalide', 'error'); return; }
    setCreating(true);
    try {
      await createLivestream({ title, description, start_date: startDate, video_url: videoUrl });
      showToast('Live créé !', 'success');
      setShowCreate(false);
      resetForm();
      load();
    } catch { showToast('Erreur lors de la création', 'error'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({
      title: 'Supprimer ce live ?', icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler',
    });
    if (r.isConfirmed) {
      try { await deleteLivestream(id); showToast('Supprimé', 'success'); load(); }
      catch { showToast('Erreur de suppression', 'error'); }
    }
  };

  const handleStart = async (id: number) => {
    try { await startLivestream(id); showToast('Live démarré !', 'success'); load(); }
    catch { showToast('Erreur au démarrage', 'error'); }
  };

  const handleStop = async (id: number) => {
    const r = await Swal.fire({
      title: 'Terminer le live ?', text: 'Le live sera marqué comme terminé.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Terminer', cancelButtonText: 'Annuler',
    });
    if (r.isConfirmed) {
      try { await stopLivestream(id); showToast('Live terminé.', 'success'); load(); }
      catch { showToast('Erreur', 'error'); }
    }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setVideoUrl(''); setStartDate('');
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const active = lives.filter(l => l.is_live);
  const upcoming = lives.filter(l => !l.is_live && new Date(l.start_date) > new Date());
  const past = lives.filter(l => !l.is_live && new Date(l.start_date) <= new Date());

  if (loading) {
    return (
      <div className="bg-neo-bg min-h-screen flex items-center justify-center">
        <div className="neo-circle w-16 h-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neo-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neo-bg min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="neo-circle w-12 h-12 flex items-center justify-center">
              <Radio size={20} className="text-neo-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neo-text">Direct &amp; Lives</h1>
              <p className="text-sm text-neo-text-secondary">Gérez vos diffusions en direct</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="neo-btn-primary">
            <Plus size={16} /> Nouveau live
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'En direct',  value: active.length,   color: '#fc5c7d', icon: <Radio size={18} />, pulse: active.length > 0 },
            { label: 'À venir',    value: upcoming.length, color: '#6c63ff', icon: <Clock size={18} /> },
            { label: 'Rediffusions', value: past.length,   color: '#48bb78', icon: <Youtube size={18} /> },
          ].map(s => (
            <div key={s.label} className="neo-card-sm p-5 flex items-center gap-3">
              <div className="neo-circle w-10 h-10 flex items-center justify-center flex-shrink-0 relative" style={{ color: s.color }}>
                {s.icon}
                {s.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-neo-text">{s.value}</p>
                <p className="text-xs text-neo-text-secondary">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Empty state */}
        {lives.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="neo-card p-12 text-center"
          >
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Radio size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-neo-text mb-2">Aucun live créé</h3>
            <p className="text-neo-text-secondary text-sm mb-6">
              Créez votre premier live YouTube pour qu'il apparaisse sur l'application mobile.
            </p>
            <button onClick={() => setShowCreate(true)} className="neo-btn-primary">
              <Plus size={16} /> Créer un live
            </button>
          </motion.div>
        )}

        {/* Section: En direct */}
        {active.length > 0 && (
          <Section title="En direct" icon={<Radio size={15} />} color="#fc5c7d" count={active.length}>
            {active.map((l, i) => (
              <LiveCard key={l.id} live={l} index={i}
                onPreview={() => setPreview(l)}
                onStart={() => handleStart(l.id)}
                onStop={() => handleStop(l.id)}
                onDelete={() => handleDelete(l.id)}
                formatDate={formatDate}
              />
            ))}
          </Section>
        )}

        {/* Section: À venir */}
        {upcoming.length > 0 && (
          <Section title="À venir" icon={<Clock size={15} />} color="#6c63ff" count={upcoming.length}>
            {upcoming.map((l, i) => (
              <LiveCard key={l.id} live={l} index={i}
                onPreview={() => setPreview(l)}
                onStart={() => handleStart(l.id)}
                onStop={() => handleStop(l.id)}
                onDelete={() => handleDelete(l.id)}
                formatDate={formatDate}
              />
            ))}
          </Section>
        )}

        {/* Section: Rediffusions */}
        {past.length > 0 && (
          <Section title="Rediffusions" icon={<Youtube size={15} />} color="#48bb78" count={past.length}>
            {past.map((l, i) => (
              <LiveCard key={l.id} live={l} index={i}
                onPreview={() => setPreview(l)}
                onStart={() => handleStart(l.id)}
                onStop={() => handleStop(l.id)}
                onDelete={() => handleDelete(l.id)}
                formatDate={formatDate}
              />
            ))}
          </Section>
        )}

      </div>

      {/* ===== Modal — Créer live ===== */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            key="create-live"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(45,55,72,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setShowCreate(false); resetForm(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="neo-card p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="neo-circle w-10 h-10 flex items-center justify-center">
                    <Radio size={18} className="text-neo-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-neo-text">Nouveau live YouTube</h2>
                </div>
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="neo-icon-btn text-neo-text-secondary">
                  <X size={16} />
                </button>
              </div>

              {/* Info banner */}
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs mb-5"
                style={{ background: 'rgba(252,92,125,0.07)', color: '#fc5c7d', border: '1px solid rgba(252,92,125,0.15)' }}
              >
                <Youtube size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  Collez l'URL de votre live ou vidéo YouTube. Elle sera affichée directement
                  dans l'application mobile de l'église.
                </span>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Titre *
                  </label>
                  <input
                    type="text" required className="neo-input"
                    placeholder="Ex : Culte du dimanche 8 juin"
                    value={title} onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    URL YouTube *
                  </label>
                  <input
                    type="url" required className="neo-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                  />
                  {videoUrl && extractYoutubeId(videoUrl) && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={`https://img.youtube.com/vi/${extractYoutubeId(videoUrl)}/mqdefault.jpg`}
                        alt="thumbnail"
                        className="w-24 h-14 rounded-lg object-cover"
                      />
                      <p className="text-xs" style={{ color: '#48bb78' }}>
                        ✓ ID YouTube : <code className="font-mono">{extractYoutubeId(videoUrl)}</code>
                      </p>
                    </div>
                  )}
                  {videoUrl && !extractYoutubeId(videoUrl) && (
                    <p className="mt-1 text-xs" style={{ color: '#fc5c7d' }}>URL YouTube invalide</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    className="neo-inset w-full px-4 py-2.5 text-neo-text text-sm resize-none outline-none"
                    rows={2}
                    placeholder="Description courte..."
                    value={description} onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Date / heure de début
                  </label>
                  <input
                    type="datetime-local" className="neo-input"
                    value={startDate} onChange={e => setStartDate(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={creating} className="neo-btn-primary flex-1 justify-center">
                    {creating
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Création...</>
                      : <><Radio size={15} /> Créer le live</>}
                  </button>
                  <button type="button" onClick={() => { setShowCreate(false); resetForm(); }} className="neo-btn-ghost">
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Modal — Prévisualisation YouTube ===== */}
      <AnimatePresence>
        {preview && (
          <motion.div
            key="preview-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.88)' }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
              className="neo-card p-4 w-full max-w-4xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #c5ccd4' }}>
                <div>
                  <h2 className="text-lg font-bold text-neo-text">{preview.title}</h2>
                  {preview.description && <p className="text-xs text-neo-text-secondary mt-1">{preview.description}</p>}
                </div>
                <button onClick={() => setPreview(null)} className="neo-icon-btn text-neo-text-secondary">
                  <X size={16} />
                </button>
              </div>

              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                {extractYoutubeId(preview.video_url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeId(preview.video_url)}${preview.is_live ? '?autoplay=1' : ''}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={preview.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    URL invalide
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Composant section ──
function Section({ title, icon, color, count, children }: {
  title: string; icon: React.ReactNode; color: string; count: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="neo-circle w-8 h-8 flex items-center justify-center" style={{ color }}>
          {icon}
        </div>
        <h2 className="text-base font-bold text-neo-text">{title}</h2>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: `${color}18`, color }}
        >
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

// ── Carte live ──
function LiveCard({ live, index, onPreview, onStart, onStop, onDelete, formatDate }: {
  live: Livestream;
  index: number;
  onPreview: () => void;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
}) {
  const ytId = extractYoutubeId(live.video_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="neo-card p-4 flex items-center gap-4"
    >
      {/* Thumbnail */}
      <div
        className="w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative"
        onClick={onPreview}
      >
        {ytId ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play size={16} className="text-white" />
            </div>
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#fc5c7d,#c0392b)' }}
          >
            <Radio size={20} className="text-white" />
          </div>
        )}
        {live.is_live && (
          <div className="absolute top-1 left-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-neo-text text-sm leading-snug truncate">{live.title}</h3>
        {live.description && (
          <p className="text-xs text-neo-text-secondary mt-0.5 truncate">{live.description}</p>
        )}
        <p className="text-xs text-neo-text-secondary mt-1">
          {formatDate(live.start_date)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={onPreview} className="neo-icon-btn text-neo-primary" title="Prévisualiser">
          <Eye size={15} />
        </button>

        {!live.is_live && (
          <button onClick={onStart} className="neo-icon-btn" style={{ color: '#fc5c7d' }} title="Démarrer le live">
            <Radio size={15} />
          </button>
        )}
        {live.is_live && (
          <button onClick={onStop} className="neo-icon-btn" style={{ color: '#fc5c7d' }} title="Terminer le live">
            <Square size={15} />
          </button>
        )}

        <button onClick={onDelete} className="neo-icon-btn" style={{ color: '#fc5c7d' }} title="Supprimer">
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

export default LiveStreams;
