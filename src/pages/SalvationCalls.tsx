import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { Heart, CheckCircle, Clock, Trash2, Phone, Mail, MessageSquare, TrendingUp } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface Call {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  message?: string;
  is_contacted: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  this_week: number;
  this_month: number;
  pending: number;
}

const G  = '#c9a227';
const B  = '#1a3a8a';

const SalvationCalls: React.FC = () => {
  const [calls, setCalls]   = useState<Call[]>([]);
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'pending' | 'done'>('all');

  const toast = (t: string, icon: 'success' | 'error' = 'success') =>
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
      .fire({ icon, title: t });

  const load = async () => {
    setLoading(true);
    try {
      const [callsRes, statsRes] = await Promise.all([
        axiosInstance.get('/api/v1/salvation-calls/'),
        axiosInstance.get('/api/v1/salvation-calls/stats'),
      ]);
      setCalls(Array.isArray(callsRes.data) ? callsRes.data : []);
      setStats(statsRes.data);
    } catch { toast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (c: Call) => {
    try {
      await axiosInstance.put(`/api/v1/salvation-calls/${c.id}/contacted`);
      load();
      toast(c.is_contacted ? 'Marqué comme non contacté' : 'Marqué comme contacté ✓');
    } catch { toast('Erreur', 'error'); }
  };

  const handleDelete = async (c: Call) => {
    const r = await Swal.fire({
      title: 'Supprimer cette décision ?',
      text: `${c.first_name} ${c.last_name ?? ''}`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
    });
    if (!r.isConfirmed) return;
    try {
      await axiosInstance.delete(`/api/v1/salvation-calls/${c.id}`);
      toast('Supprimé'); load();
    } catch { toast('Erreur', 'error'); }
  };

  const filtered = calls.filter(c => {
    if (filter === 'pending') return !c.is_contacted;
    if (filter === 'done')    return c.is_contacted;
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: `linear-gradient(135deg,${G},#e8b830)`, boxShadow: '4px 4px 10px #c5ccd4' }}>
          <Heart size={20} fill="white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-neo-text">Appel au salut</h1>
          <p className="text-xs text-neo-text-secondary">Décisions de foi enregistrées</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total,      icon: <Heart size={16} fill="white" />, bg: `linear-gradient(135deg,${G},#e8b830)` },
            { label: 'Ce mois', value: stats.this_month, icon: <TrendingUp size={16} />,         bg: `linear-gradient(135deg,${B},#2952cc)` },
            { label: 'Cette semaine', value: stats.this_week, icon: <TrendingUp size={16} />,    bg: 'linear-gradient(135deg,#10b981,#34d399)' },
            { label: 'À contacter', value: stats.pending, icon: <Clock size={16} />,              bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-4 text-white flex flex-col gap-1"
              style={{ background: s.bg, boxShadow: '4px 4px 12px #c5ccd4' }}>
              <div className="flex items-center justify-between">
                {s.icon}
                <span className="text-2xl font-black">{s.value}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-5">
        {([
          { k: 'all',     label: `Tous (${calls.length})` },
          { k: 'pending', label: `À contacter (${calls.filter(c => !c.is_contacted).length})` },
          { k: 'done',    label: `Contactés (${calls.filter(c => c.is_contacted).length})` },
        ] as const).map(({ k, label }) => (
          <button key={k} onClick={() => setFilter(k)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={filter === k
              ? { background: `linear-gradient(135deg,${G},#e8b830)`, color: B, boxShadow: '3px 3px 8px #c5ccd4' }
              : { background: '#e8ecef', color: '#718096', boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="neo-card p-4 h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="neo-card p-10 text-center text-neo-text-secondary">
          <Heart size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucune décision{filter !== 'all' ? ' dans ce filtre' : ''} pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div key={c.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                className={`neo-card p-4 flex gap-4 items-start transition-all ${c.is_contacted ? 'opacity-70' : ''}`}>

                {/* Avatar initiales */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: c.is_contacted ? '#94a3b8' : `linear-gradient(135deg,${G},#e8b830)` }}>
                  {c.first_name[0]}{c.last_name?.[0] ?? ''}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-neo-text">
                      {c.first_name} {c.last_name ?? ''}
                    </span>
                    {c.is_contacted
                      ? <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">✓ Contacté</span>
                      : <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">À contacter</span>
                    }
                    <span className="text-[9px] text-neo-text-secondary ml-auto">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-[10px] text-neo-text-secondary">
                    {c.email && <span className="flex items-center gap-1"><Mail size={10} />{c.email}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={10} />{c.phone}</span>}
                  </div>
                  {c.message && (
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] text-neo-text-secondary italic">
                      <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">"{c.message}"</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(c)} title={c.is_contacted ? 'Marquer non contacté' : 'Marquer contacté'}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110"
                    style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                    <CheckCircle size={15} className={c.is_contacted ? 'text-green-500' : 'text-gray-300'} />
                  </button>
                  <button onClick={() => handleDelete(c)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl"
                    style={{ boxShadow: '3px 3px 6px #c5ccd4,-3px -3px 6px #fff' }}>
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SalvationCalls;
