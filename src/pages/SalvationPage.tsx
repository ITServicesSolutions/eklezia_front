import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCircle, User, Mail, Phone, MessageSquare, ChevronRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const B  = '#1a3a8a';
const BM = '#2952cc';
const G  = '#c9a227';
const GL = '#f0d060';
const BG = '#f0f4ff';

const API = import.meta.env.VITE_API_BASE_URL ?? 'https://eklezia.api.it-servicegroup.com';

const SalvationPage: React.FC = () => {
  const [step, setStep]         = useState<'prayer' | 'form' | 'done'>('prayer');
  const [firstName, setFirst]   = useState('');
  const [lastName, setLast]     = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { setError('Votre prénom est requis.'); return; }
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ first_name: firstName });
      if (lastName) params.append('last_name', lastName);
      if (email)    params.append('email', email);
      if (phone)    params.append('phone', phone);
      if (message)  params.append('message', message);

      const res = await fetch(`${API}/api/v1/salvation-calls/?${params}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      setStep('done');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-14"
        style={{ background: `linear-gradient(150deg,${B} 0%,${BM} 55%,#3b6fd4 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-[.06] bg-white" />
          <div className="absolute -left-8 bottom-0 w-48 h-48 rounded-full opacity-[.06]" style={{ background: G }} />
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width: 3 + i, height: 3 + i, left: `${15 + i * 14}%`, top: `${20 + (i % 2) * 40}%`,
                background: i % 2 === 0 ? GL : 'rgba(255,255,255,.3)' }}
              animate={{ y: [-10, 10, -10], opacity: [.2, .7, .2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }} />
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
            className="flex justify-center mb-5">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: `${G}40` }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
                <Heart size={28} className="text-white" fill="white" />
              </div>
            </div>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xs font-black uppercase tracking-[.3em] mb-2" style={{ color: GL }}>
            Décision de foi
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            Donner ma vie à<br />
            <span style={{ color: GL }}>Jésus-Christ</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="text-white/60 text-sm max-w-lg mx-auto">
            La décision la plus importante de votre vie vous attend. Dieu vous aime et vous appelle.
          </motion.p>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="max-w-3xl mx-auto px-5 py-12">
        <AnimatePresence mode="wait">

          {/* ÉTAPE 1 — Prière */}
          {step === 'prayer' && (
            <motion.div key="prayer"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              {/* Message évangélique */}
              <div className="rounded-3xl p-7 mb-6 bg-white shadow-sm" style={{ border: `1px solid ${BG}` }}>
                <h2 className="text-lg font-black mb-4" style={{ color: B }}>Pourquoi donner sa vie à Jésus ?</h2>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p>
                    Dieu vous a créé avec amour et désire avoir une relation personnelle avec vous.
                    Mais le péché a créé une séparation entre l'humanité et Dieu.
                  </p>
                  <p>
                    <strong style={{ color: B }}>La bonne nouvelle :</strong> Jésus-Christ, le Fils de Dieu,
                    est venu sur terre, a vécu une vie parfaite, est mort à la croix pour payer le prix
                    de nos péchés, et est ressuscité le troisième jour. Il a vaincu la mort pour nous !
                  </p>
                  <p>
                    En lui faisant confiance, vous recevez le pardon de vos péchés, la paix intérieure,
                    et la vie éternelle. C'est un don gratuit — vous ne pouvez pas le mériter,
                    vous pouvez seulement le recevoir par la foi.
                  </p>
                </div>

                {/* Verset clé */}
                <div className="mt-5 rounded-2xl p-5 text-center"
                  style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
                  <p className="text-white italic text-sm leading-relaxed mb-2">
                    "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque
                    croit en lui ne périsse point, mais qu'il ait la vie éternelle."
                  </p>
                  <p className="font-black text-xs" style={{ color: GL }}>— Jean 3:16</p>
                </div>
              </div>

              {/* Prière de salut */}
              <div className="rounded-3xl p-7 mb-6"
                style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={16} className="text-white" fill="white" />
                  <h2 className="text-white font-black text-sm uppercase tracking-wider">
                    Prière de salut
                  </h2>
                </div>
                <p className="text-white/90 text-sm leading-loose italic">
                  "Seigneur Jésus, je reconnais que je suis pécheur et que j'ai besoin de toi.
                  Je crois que tu es mort pour mes péchés et que tu es ressuscité.
                  Je te demande de pardonner tous mes péchés et d'entrer dans mon cœur et ma vie.
                  Je te reçois comme mon Seigneur et Sauveur personnel.
                  Je te donne ma vie aujourd'hui. Merci Seigneur de m'aimer.
                  <br /><strong>Amen."</strong>
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep('form')}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl"
                style={{ background: `linear-gradient(135deg,${B},${BM})`, color: '#fff' }}>
                <Heart size={20} fill="white" />
                J'ai prié cette prière — Enregistrer ma décision
                <ChevronRight size={18} />
              </motion.button>

              <p className="text-center text-xs text-gray-400 mt-3">
                En cliquant, vous serez contacté par un membre de l'église pour vous accompagner.
              </p>
            </motion.div>
          )}

          {/* ÉTAPE 2 — Formulaire */}
          {step === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>

              <div className="rounded-3xl p-7 bg-white shadow-sm mb-4" style={{ border: `1px solid ${BG}` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
                    <Heart size={18} className="text-white" fill="white" />
                  </div>
                  <div>
                    <h2 className="font-black text-base" style={{ color: B }}>Félicitations !</h2>
                    <p className="text-xs text-gray-400">Laissez vos coordonnées pour être accompagné</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-xs text-red-600 font-semibold"
                    style={{ background: '#fee2e2' }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                        Prénom *
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-3.5 text-gray-300" />
                        <input value={firstName} onChange={e => setFirst(e.target.value)}
                          placeholder="Votre prénom"
                          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                          style={{ background: BG, border: `1.5px solid ${BG}` }}
                          onFocus={e => e.target.style.borderColor = G}
                          onBlur={e => e.target.style.borderColor = BG} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                        Nom
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-3.5 text-gray-300" />
                        <input value={lastName} onChange={e => setLast(e.target.value)}
                          placeholder="Votre nom"
                          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                          style={{ background: BG, border: `1.5px solid ${BG}` }}
                          onFocus={e => e.target.style.borderColor = G}
                          onBlur={e => e.target.style.borderColor = BG} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-3.5 text-gray-300" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: BG, border: `1.5px solid ${BG}` }}
                        onFocus={e => e.target.style.borderColor = G}
                        onBlur={e => e.target.style.borderColor = BG} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3.5 text-gray-300" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+229 00 00 00 00"
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: BG, border: `1.5px solid ${BG}` }}
                        onFocus={e => e.target.style.borderColor = G}
                        onBlur={e => e.target.style.borderColor = BG} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                      Un mot (optionnel)
                    </label>
                    <div className="relative">
                      <MessageSquare size={14} className="absolute left-3 top-3.5 text-gray-300" />
                      <textarea value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Partagez ce que vous ressentez..."
                        rows={3} className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                        style={{ background: BG, border: `1.5px solid ${BG}` }}
                        onFocus={e => e.target.style.borderColor = G}
                        onBlur={e => e.target.style.borderColor = BG} />
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: `linear-gradient(135deg,${G},#e8b830)`, color: B }}>
                    {loading
                      ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                      : <><CheckCircle size={18} /> Confirmer ma décision</>}
                  </motion.button>
                </form>
              </div>

              <button onClick={() => setStep('prayer')}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Relire la prière
              </button>
            </motion.div>
          )}

          {/* ÉTAPE 3 — Confirmation */}
          {step === 'done' && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="flex justify-center mb-6">
                <div className="relative">
                  {[1, 1.5, 2].map((s, i) => (
                    <motion.div key={i} className="absolute inset-0 rounded-full"
                      style={{ background: `${G}30` }}
                      animate={{ scale: [1, s + 0.3, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
                  ))}
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                    style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
                    <CheckCircle size={36} className="text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-2xl font-black mb-2" style={{ color: B }}>
                Bienvenue dans la famille de Dieu !
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Votre décision a été enregistrée. Un membre de notre équipe pastorale vous contactera
                bientôt pour vous accueillir et vous accompagner dans vos premiers pas de foi.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="rounded-2xl p-5 max-w-md mx-auto"
                style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
                <p className="text-white italic text-sm leading-relaxed">
                  "Il y a de la joie devant les anges de Dieu pour un seul pécheur qui se repent."
                </p>
                <p className="text-xs font-black mt-2" style={{ color: GL }}>— Luc 15:10</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PublicFooter />
    </div>
  );
};

export default SalvationPage;
