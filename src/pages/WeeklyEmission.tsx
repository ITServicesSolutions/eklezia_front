import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv2, Plus, Trash2, Edit2, X, Check, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface Emission {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  week_date: string;
  is_active: boolean;
  created_at: string;
}

const ytId = (url: string) =>
  url?.match(/(?:v=|youtu\.be\/|live\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;

const WeeklyEmission: React.FC = () => {
  const [items, setItems]       = useState<Emission[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Emission | null>(null);

  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [videoUrl, setVideoUrl]   = useState('');
  const [weekDate, setWeekDate]   = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive]   = useState(true);
  const [saving, setSaving]       = useState(false);

  const toast = (t: string, icon: 'success' | 'error' = 'success') =>
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      .fire({ icon, title: t });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/weekly-emission/');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { toast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setDesc(''); setVideoUrl('');
    setWeekDate(new Date().toISOString().split('T')[0]);
    setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (e: Emission) => {
    setEditing(e);
    setTitle(e.title); setDesc(e.description ?? '');
    setVideoUrl(e.video_url);
    setWeekDate(e.week_date?.split('T')[0] ?? new Date().toISOString().split('T')[0]);
    setIsActive(e.is_active);
    setShowForm(true);
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!title.trim())    { toast('Titre requis', 'error'); return; }
    if (!videoUrl.trim()) { toast('URL vidéo requise', 'error'); return; }
    if (!ytId(videoUrl))  { toast('URL YouTube invalide', 'error'); return; }
    setSaving(true);
    try {
      const params = new URLSearchParams({
        title, video_url: videoUrl, week_date: weekDate, is_active: String(isActive),
      });
      if (description) params.append('description', description);

      if (editing) {
        await axiosInstance.put(`/api/v1/weekly-emission/${editing.id}?${params}`);
      } else {
        await axiosInstance.post(`/api/v1/weekly-emission/?${params}`);
      }
      toast(editing ? 'Émission modifiée' : 'Émission créée');
      setShowForm(false);
      load();
    } catch { toast('Erreur lors de l\'enregistrement', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (e: Emission) => {
    const r = await Swal.fire({ title: 'Supprimer cette émission ?', text: e.title,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler', confirmButtonColor: '#ef4444' });
    if (!r.isConfirmed) return;
    try {
      await axiosInstance.delete(`/api/v1/weekly-emission/${e.id}`);
      toast('Supprimée'); load();
    } catch { toast('Erreur', 'error'); }
  };

  const handleToggle = async (e: Emission) => {
    const params = new URLSearchParams({
      title: e.title, video_url: e.video_url,
      is_active: String(!e.is_active),
      week_date: e.week_date?.split('T')[0] ?? '',
    });
    if (e.description) params.append('description', e.description);
    try {
      await axiosInstance.put(`/api/v1/weekly-emission/${e.id}?${params}`);
      load();
    } catch { toast('Erreur', 'error'); }
  };

  const thumb = (url: string) => {
    const id = ytId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '4px 4px 10px #c5ccd4' }}>
            <Tv2 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neo-text">Émission de la semaine</h1>
            <p className="text-xs text-neo-text-secondary">Vidéo hebdomadaire du pasteur</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '4px 4px 10px #c5ccd4,-2px -2px 6px #fff' }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative neo-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-neo-text">{editing ? 'Modifier' : 'Nouvelle émission'}</h2>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl"
                  style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  <X size={16} className="text-neo-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Titre de l'émission</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Message du dimanche — La foi qui déplace les montagnes"
                    className="neo-input w-full text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">URL YouTube</label>
                  <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..." className="neo-input w-full text-sm" />
                  {videoUrl && thumb(videoUrl) && (
                    <img src={thumb(videoUrl)!} alt="Aperçu"
                      className="mt-2 w-full h-36 object-cover rounded-xl" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Description (optionnel)</label>
                  <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
                    placeholder="Résumé du message, texte de référence..."
                    className="neo-input w-full text-sm resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Date de la semaine</label>
                  <input type="date" value={weekDate} onChange={e => setWeekDate(e.target.value)}
                    className="neo-input w-full text-sm" />
                </div>

                {editing && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                    <span className="text-sm text-neo-text">Afficher sur le site (émission active)</span>
                  </label>
                )}

                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
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
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="neo-card p-4 h-28 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="neo-card p-10 text-center text-neo-text-secondary">
          <Tv2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune émission. Ajoutez la première.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(e => (
            <motion.div key={e.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`neo-card p-4 flex gap-4 items-start ${!e.is_active ? 'opacity-60' : ''}`}>
              {thumb(e.video_url) && (
                <img src={thumb(e.video_url)!} alt=""
                  className="w-24 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {e.is_active
                    ? <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#7c3aed' }}>● Actif</span>
                    : <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Masqué</span>
                  }
                  <span className="text-[9px] text-neo-text-secondary ml-auto">
                    Semaine du {new Date(e.week_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neo-text line-clamp-1">{e.title}</h3>
                {e.description && <p className="text-xs text-neo-text-secondary line-clamp-1 mt-0.5">{e.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(e)} title={e.is_active ? 'Masquer' : 'Activer'}
                  className="w-8 h-8 flex items-center justify-center rounded-xl"
                  style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  {e.is_active ? <Eye size={14} className="text-violet-500" /> : <EyeOff size={14} className="text-gray-400" />}
                </button>
                <button onClick={() => openEdit(e)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl"
                  style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  <Edit2 size={14} className="text-indigo-500" />
                </button>
                <button onClick={() => handleDelete(e)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl"
                  style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyEmission;
