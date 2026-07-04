import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HandCoins, BookOpen, CheckCircle, ExternalLink, ChevronLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const B  = '#1a3a8a';
const BM = '#2952cc';
const G  = '#c9a227';
const GL = '#f0d060';
const BG = '#f0f4ff';
const API = import.meta.env.VITE_API_BASE_URL ?? 'https://eklezia.api.it-servicegroup.com';

type DonType = 'don' | 'offrande' | 'dime';

const TYPE_CFG: Record<DonType, { label: string; icon: React.ReactNode; desc: string; color: string; grad: string }> = {
  dime: {
    label: 'Dîme',
    icon: <BookOpen size={18} />,
    desc: '10% de vos revenus selon Malachie 3:10',
    color: B,
    grad: `linear-gradient(135deg,${B},${BM})`,
  },
  offrande: {
    label: 'Offrande',
    icon: <Heart size={18} />,
    desc: 'Don libre en action de grâce à Dieu',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#7c3aed,#a855f7)',
  },
  don: {
    label: 'Don général',
    icon: <HandCoins size={18} />,
    desc: 'Soutien à la mission et aux activités de l\'église',
    color: G,
    grad: `linear-gradient(135deg,${G},#e8b830)`,
  },
};

const AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

const DonsPage: React.FC = () => {
  const [step, setStep]       = useState<'select' | 'pay' | 'done'>('select');
  const [donType, setDonType] = useState<DonType>('offrande');
  const [amount, setAmount]   = useState<number | ''>('');
  const [custom, setCustom]   = useState(false);
  const [fullName, setName]   = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const cfg = TYPE_CFG[donType];

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setError('Veuillez entrer un montant valide.'); return; }
    if (!phone.trim()) { setError('Le numéro de téléphone est requis pour le paiement mobile.'); return; }
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({
        donation_type: donType,
        amount: String(amount),
        phone,
      });
      if (fullName) params.append('full_name', fullName);
      if (email)    params.append('email', email);

      const res = await fetch(`${API}/api/v1/public-donations/init?${params}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');

      // Ouvre KkiaPay dans un nouvel onglet
      window.open(data.payment_url, '_blank', 'noopener');
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Erreur de paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-12"
        style={{ background: `linear-gradient(150deg,${B} 0%,${BM} 55%,#3b6fd4 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-[.06] bg-white" />
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width: 3 + i, height: 3 + i, left: `${15 + i * 16}%`, top: `${25 + (i%2)*35}%`,
                background: i%2===0 ? GL : 'rgba(255,255,255,.3)' }}
              animate={{ y: [-8, 8, -8], opacity: [.2, .7, .2] }}
              transition={{ duration: 3+i*.5, repeat: Infinity, delay: i*.3 }} />
          ))}
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <Link to="/home" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-5 transition-colors">
            <ChevronLeft size={13} /> Accueil
          </Link>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
              <HandCoins size={26} className="text-white" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-3xl font-black text-white mb-2">
            Dons & <span style={{ color: GL }}>Offrandes</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-white/55 text-sm">
            Soutenez l'œuvre de Dieu par votre générosité
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xs italic mt-2" style={{ color: GL }}>
            "Donnez, et il vous sera donné." — Luc 6:38
          </motion.p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 py-10">
        <AnimatePresence mode="wait">

          {/* ── Étape 1 : sélection type + montant + coordonnées ── */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Choix type */}
              <div className="rounded-3xl p-6 bg-white shadow-sm mb-4" style={{ border: `1px solid ${BG}` }}>
                <h2 className="font-black text-sm mb-4" style={{ color: B }}>Type de don</h2>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(TYPE_CFG) as [DonType, typeof TYPE_CFG[DonType]][]).map(([k, c]) => (
                    <button key={k} onClick={() => setDonType(k)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor: donType === k ? c.color : 'transparent',
                        background: donType === k ? `${c.color}12` : BG,
                        boxShadow: donType === k ? `0 4px 16px ${c.color}30` : 'none',
                      }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                        style={{ background: donType === k ? c.grad : '#cbd5e1' }}>
                        {c.icon}
                      </div>
                      <span className="text-xs font-black" style={{ color: donType === k ? c.color : '#64748b' }}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3 italic">{cfg.desc}</p>
              </div>

              {/* Montant */}
              <div className="rounded-3xl p-6 bg-white shadow-sm mb-4" style={{ border: `1px solid ${BG}` }}>
                <h2 className="font-black text-sm mb-4" style={{ color: B }}>Montant (FCFA)</h2>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustom(false); }}
                      className="py-3 rounded-xl text-sm font-bold transition-all border-2"
                      style={{
                        borderColor: amount === a && !custom ? cfg.color : 'transparent',
                        background: amount === a && !custom ? `${cfg.color}15` : BG,
                        color: amount === a && !custom ? cfg.color : '#64748b',
                      }}>
                      {a.toLocaleString('fr-FR')}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setCustom(true); setAmount(''); }}
                  className="w-full py-2 rounded-xl text-sm font-bold border-2 transition-all mb-2"
                  style={{
                    borderColor: custom ? cfg.color : `${BG}`,
                    background: custom ? `${cfg.color}10` : BG,
                    color: custom ? cfg.color : '#94a3b8',
                  }}>
                  Autre montant
                </button>
                {custom && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <input type="number" min="100" value={amount}
                      onChange={e => setAmount(Number(e.target.value) || '')}
                      placeholder="Entrez le montant en FCFA"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all mt-2"
                      style={{ background: BG, border: `2px solid ${cfg.color}` }} />
                  </motion.div>
                )}
                {amount && (
                  <p className="text-center text-xs font-black mt-3" style={{ color: cfg.color }}>
                    {Number(amount).toLocaleString('fr-FR')} FCFA · {cfg.label}
                  </p>
                )}
              </div>

              {/* Coordonnées */}
              <div className="rounded-3xl p-6 bg-white shadow-sm mb-4" style={{ border: `1px solid ${BG}` }}>
                <h2 className="font-black text-sm mb-4" style={{ color: B }}>Vos informations</h2>
                <form onSubmit={handlePay} className="space-y-3">
                  <input value={fullName} onChange={e => setName(e.target.value)}
                    placeholder="Nom complet (optionnel)"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: BG, border: `1.5px solid ${BG}` }}
                    onFocus={e => e.target.style.borderColor = cfg.color}
                    onBlur={e => e.target.style.borderColor = BG} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Numéro de téléphone Mobile Money * (ex: +22960000000)"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: BG, border: `1.5px solid ${BG}` }}
                    onFocus={e => e.target.style.borderColor = cfg.color}
                    onBlur={e => e.target.style.borderColor = BG} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Email (optionnel — pour reçu)"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: BG, border: `1.5px solid ${BG}` }}
                    onFocus={e => e.target.style.borderColor = cfg.color}
                    onBlur={e => e.target.style.borderColor = BG} />

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600"
                      style={{ background: '#fee2e2' }}>
                      <AlertCircle size={13} /> {error}
                    </div>
                  )}

                  <motion.button type="submit" disabled={loading || !amount}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    style={{ background: cfg.grad, color: donType === 'don' ? B : '#fff' }}>
                    {loading
                      ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                      : <><ExternalLink size={16} /> Payer {amount ? `${Number(amount).toLocaleString('fr-FR')} FCFA` : ''} via KkiaPay</>}
                  </motion.button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-3">
                  {['MTN', 'Moov', 'VISA', 'MC'].map(p => (
                    <span key={p} className="text-[9px] font-black px-2 py-1 rounded bg-gray-100 text-gray-500">{p}</span>
                  ))}
                </div>
                <p className="text-center text-[9px] text-gray-400 mt-2">
                  Paiement sécurisé par KkiaPay · La page de paiement s'ouvrira dans un nouvel onglet
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Étape 2 : Confirmation ── */}
          {step === 'done' && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="flex justify-center mb-6">
                <div className="relative">
                  {[1.4, 1.8].map((s, i) => (
                    <motion.div key={i} className="absolute inset-0 rounded-full"
                      style={{ background: `${G}25` }}
                      animate={{ scale: [1, s, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} />
                  ))}
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                    style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
                    <CheckCircle size={36} className="text-white" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-2xl font-black mb-2" style={{ color: B }}>Merci pour votre générosité !</h2>
              <p className="text-gray-500 text-sm mb-3 max-w-sm mx-auto leading-relaxed">
                La page de paiement KkiaPay s'est ouverte dans un nouvel onglet.
                Complétez le paiement sur cette page.
              </p>

              <div className="rounded-2xl p-4 max-w-sm mx-auto mb-6"
                style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
                <p className="text-white italic text-sm">
                  "Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie."
                </p>
                <p className="text-xs font-black mt-2" style={{ color: GL }}>— 2 Corinthiens 9:7</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={() => { setStep('select'); setAmount(''); setCustom(false); }}
                  className="px-5 py-2.5 rounded-full text-sm font-bold"
                  style={{ background: BG, color: B }}>
                  Faire un autre don
                </button>
                <Link to="/home"
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${G},#e8b830)`, color: B }}>
                  Retour à l'accueil
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PublicFooter />
    </div>
  );
};

export default DonsPage;
