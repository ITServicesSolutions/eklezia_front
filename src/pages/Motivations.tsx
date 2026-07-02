import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Trash2, Edit2, X, Check, Eye, EyeOff } from 'lucide-react';
import {
  getAllMotivations,
  createMotivation,
  updateMotivation,
  deleteMotivation,
  type Motivation,
} from '../api/feed';

const Motivations: React.FC = () => {
  const [items, setItems] = useState<Motivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Motivation | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = (t: string, icon: 'success' | 'error' = 'success') =>
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })
      .fire({ icon, title: t });

  const load = async () => {
    setLoading(true);
    try { setItems(await getAllMotivations()); }
    catch { toast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle(''); setContent(''); setImageUrl(''); setIsPublished(true);
    setShowForm(true);
  };

  const openEdit = (m: Motivation) => {
    setEditing(m);
    setTitle(m.title); setContent(m.content); setImageUrl(m.image_url || ''); setIsPublished(m.is_published);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast('Titre et contenu requis', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateMotivation(editing.id, { title, content, image_url: imageUrl || undefined, is_published: isPublished });
      } else {
        await createMotivation({ title, content, image_url: imageUrl || undefined });
      }
      toast(editing ? 'Motivation modifiée' : 'Motivation créée');
      setShowForm(false);
      load();
    } catch { toast('Erreur lors de l\'enregistrement', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (m: Motivation) => {
    const result = await Swal.fire({
      title: 'Supprimer cette motivation ?',
      text: m.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMotivation(m.id);
      toast('Supprimée');
      load();
    } catch { toast('Erreur', 'error'); }
  };

  const handleTogglePublish = async (m: Motivation) => {
    try {
      await updateMotivation(m.id, { title: m.title, content: m.content, image_url: m.image_url || undefined, is_published: !m.is_published });
      load();
    } catch { toast('Erreur', 'error'); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', boxShadow: '4px 4px 10px #c5ccd4' }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neo-text">Motivations</h1>
            <p className="text-xs text-neo-text-secondary">Messages d'encouragement et dévotions</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', boxShadow: '4px 4px 10px #c5ccd4,-2px -2px 6px #fff' }}
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative neo-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-neo-text">{editing ? 'Modifier' : 'Nouvelle motivation'}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  <X size={16} className="text-neo-text-secondary" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Titre</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Un titre accrocheur..." className="neo-input w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">Contenu</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Message d'encouragement, dévotion..." className="neo-input w-full text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary mb-1">URL image (optionnel)</label>
                  <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="neo-input w-full text-sm" />
                </div>
                {editing && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded" />
                    <span className="text-sm text-neo-text">Publié (visible par tous)</span>
                  </label>
                )}
                <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
                  {saving ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <Check size={16} />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="neo-card p-4 h-28 animate-pulse bg-neo-bg" />)}</div>
      ) : items.length === 0 ? (
        <div className="neo-card p-10 text-center text-neo-text-secondary">
          <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune motivation. Créez-en une.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(m => (
            <motion.div key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`neo-card p-4 flex gap-4 items-start ${!m.is_published ? 'opacity-60' : ''}`}>
              {m.image_url && (
                <img src={m.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-neo-text truncate">{m.title}</span>
                  {!m.is_published && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Masqué</span>}
                  <span className="text-[10px] text-neo-text-secondary ml-auto">{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className="text-sm text-neo-text-secondary line-clamp-2">{m.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleTogglePublish(m)} title={m.is_published ? 'Masquer' : 'Publier'} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  {m.is_published ? <Eye size={14} className="text-amber-500" /> : <EyeOff size={14} className="text-gray-400" />}
                </button>
                <button onClick={() => openEdit(m)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                  <Edit2 size={14} className="text-indigo-500" />
                </button>
                <button onClick={() => handleDelete(m)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
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

export default Motivations;
