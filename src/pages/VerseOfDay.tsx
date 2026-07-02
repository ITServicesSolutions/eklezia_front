import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, MessageSquare, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import {
  getAllVerses, createOrUpdateVerse, deleteVerse,
  type VerseOfDay as VerseType,
} from '../api/feed';

type ContentType = 'verse' | 'video' | 'message';

const TYPE_CONFIG: Record<ContentType, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  verse:   { label: 'Verset biblique', icon: <BookOpen size={16} />,     color: '#1a3a8a', desc: 'Un verset de la Bible avec sa référence' },
  video:   { label: 'Vidéo',          icon: <Video size={16} />,         color: '#7c3aed', desc: 'Une courte vidéo YouTube (message, prédication...)' },
  message: { label: 'Message',        icon: <MessageSquare size={16} />, color: '#c9a227', desc: 'Un message, une dévotion ou une pensée du jour' },
};

const VerseOfDay: React.FC = () => {
  const [items, setItems]   = useState<VerseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<VerseType | null>(null);

  const [contentType, setContentType] = useState<ContentType>('verse');
  const [text, setText]       = useState('');
  const [reference, setRef]   = useState('');
  const [videoUrl, setVideo]  = useState('');
  const [verseDate, setDate]  = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]   = useState(false);

  const toast = (t: string, icon: 'success' | 'error' = 'success') =>
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      .fire({ icon, title: t });

  const load = async () => {
    setLoading(true);
    try { setItems(await getAllVerses()); }
    catch { toast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setContentType('verse'); setText(''); setRef(''); setVideo('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const openEdit = (v: VerseType) => {
    setEditing(v);
    setContentType((v.content_type ?? 'verse') as ContentType);
    setText(v.text ?? ''); setRef(v.reference ?? '');
    setVideo(v.video_url ?? ''); setDate(v.date);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contentType === 'video' && !videoUrl.trim()) { toast('URL vidéo requise', 'error'); return; }
    if (contentType !== 'video' && !text.trim())    { toast('Texte requis', 'error'); return; }
    setSaving(true);
    try {
      await createOrUpdateVerse({
        content_type: contentType,
        text: text || undefined,
        reference: reference || undefined,
        video_url: videoUrl || undefined,
        verse_date: verseDate,
      });
      toast('Contenu enregistré');
      setShowForm(false);
      load();
    } catch { toast('Erreur lors de l\'enregistrement', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (v: VerseType) => {
    const r = await Swal.fire({ title: 'Supprimer ?', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler', confirmButtonColor: '#ef4444' });
    if (!r.isConfirmed) return;
    try { await deleteVerse(v.id); toast('Supprimé'); load(); }
    catch { toast('Erreur', 'error'); }
  };

  const cfg = TYPE_CONFIG[contentType];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#1a3a8a,#2952cc)', boxShadow: '4px 4px 10px #c5ccd4' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neo-text">Contenu du jour</h1>
            <p className="text-xs text-neo-text-secondary">Verset, vidéo ou message quotidien</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#1a3a8a,#2952cc)', boxShadow: '4px 4px 10px #c5ccd4,-2px -2px 6px #fff' }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Modal formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative neo-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>

              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-neo-text">{editing ? 'Modifier' : 'Nouveau contenu'}</h2>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl"
                  style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  <X size={16} className="text-neo-text-secondary" />
                </button>
              </div>

              {/* Sélection du type */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {(Object.entries(TYPE_CONFIG) as [ContentType, typeof TYPE_CONFIG[ContentType]][]).map(([k, c]) => (
                  <button key={k} type="button" onClick={() => setContentType(k)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold"
                    style={{
                      borderColor: contentType === k ? c.color : 'transparent',
                      background: contentType === k ? `${c.color}15` : 'transparent',
                      color: contentType === k ? c.color : '#718096',
                      boxShadow: contentType === k ? `inset 2px 2px 6px ${c.color}20` : '4px 4px 8px #c5ccd4,-4px -4px 8px #fff',
                    }}>
                    <span style={{ color: contentType === k ? c.color : '#a0aec0' }}>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-neo-text-secondary mb-4 px-1">{cfg.desc}</p>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Date de publication</label>
                  <input type="date" value={verseDate} onChange={e => setDate(e.target.value)} className="neo-input w-full text-sm" />
                </div>

                {/* URL Vidéo (si video) */}
                {contentType === 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-neo-text-secondary mb-1">URL YouTube</label>
                    <input value={videoUrl} onChange={e => setVideo(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..." className="neo-input w-full text-sm" />
                    {videoUrl && (() => {
                      const id = videoUrl.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
                      return id ? (
                        <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="Preview"
                          className="mt-2 w-full h-32 object-cover rounded-xl" />
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Texte */}
                {contentType !== 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-neo-text-secondary mb-1">
                      {contentType === 'verse' ? 'Texte du verset' : 'Contenu du message'}
                    </label>
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                      placeholder={contentType === 'verse' ? 'Car Dieu a tant aimé le monde...' : 'Votre message du jour...'}
                      className="neo-input w-full text-sm resize-none" />
                  </div>
                )}

                {/* Description courte pour vidéo */}
                {contentType === 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Description (optionnel)</label>
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                      placeholder="Courte description de la vidéo..." className="neo-input w-full text-sm resize-none" />
                  </div>
                )}

                {/* Référence / Source */}
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">
                    {contentType === 'verse' ? 'Référence biblique (ex: Jean 3:16)' : 'Source / Auteur (optionnel)'}
                  </label>
                  <input value={reference} onChange={e => setRef(e.target.value)}
                    placeholder={contentType === 'verse' ? 'Jean 3:16' : 'Pasteur, source...'}
                    className="neo-input w-full text-sm" />
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}cc)` }}>
                  {saving
                    ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                    : <Check size={16} />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="neo-card p-4 h-20 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="neo-card p-10 text-center text-neo-text-secondary">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun contenu. Ajoutez-en un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(v => {
            const t = (v.content_type ?? 'verse') as ContentType;
            const c = TYPE_CONFIG[t];
            const isToday = v.date === today;
            return (
              <motion.div key={v.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="neo-card p-4 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: c.color }}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: c.color }}>
                      {c.label}
                    </span>
                    {isToday && <span className="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Aujourd'hui</span>}
                    <span className="text-[9px] text-neo-text-secondary ml-auto">
                      {new Date(v.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {t === 'video' && v.video_url && (() => {
                    const id = v.video_url.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
                    return id ? <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" className="w-24 h-14 rounded-lg object-cover mt-1" /> : null;
                  })()}
                  {v.text && <p className="text-sm text-neo-text line-clamp-2 italic">"{v.text}"</p>}
                  {v.reference && <p className="text-xs font-bold mt-0.5" style={{ color: c.color }}>— {v.reference}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(v)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl"
                    style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                    <Edit2 size={14} className="text-indigo-500" />
                  </button>
                  <button onClick={() => handleDelete(v)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl"
                    style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerseOfDay;
