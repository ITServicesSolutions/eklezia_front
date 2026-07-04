import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { loginUser } from '../api/auth';
import PublicNavbar from '../components/PublicNavbar';
import logo from '../assets/images/logo_eglise.jpeg';

const B  = '#1a3a8a';
const BM = '#2952cc';
const G  = '#c9a227';
const GL = '#f0d060';

export interface LoginCredentials {
  username: string;
  password: string;
  source?: string;
}

const Login: React.FC = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ username: email, password, source: 'web' });
      if (response.access_token) {
        localStorage.setItem('ekklesia-token', response.access_token);
        localStorage.setItem('ekklesia-role', response.role || 'user');
        navigate(['admin', 'moderator'].includes(response.role) ? '/dashboard' : '/home');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg,${B} 0%,${BM} 55%,#3b6fd4 100%)` }}>

      {/* Navbar publique */}
      <PublicNavbar />

      {/* Déco fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10" style={{ background: G }} />
        <svg className="absolute right-12 bottom-20 opacity-[.04]" width="120" height="120" viewBox="0 0 100 100">
          <rect x="44" y="8"  width="12" height="84" fill="white"/>
          <rect x="12" y="36" width="76" height="12" fill="white"/>
        </svg>
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div className="flex justify-center mb-6"
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}>
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full border-2 border-white/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }} />
              <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] shadow-2xl"
                style={{ borderColor: GL }}>
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>

          {/* Titre */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-black text-white leading-tight">
              Église Évangélique des<br />
              <span style={{ color: GL }}>Assemblées de Dieu du Bénin</span>
            </h1>
            <p className="text-white/55 text-xs mt-1">Temple Universitaire · Cotonou</p>
          </div>

          {/* Card formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl p-7 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>

            <h2 className="text-white font-black text-sm text-center mb-5 uppercase tracking-widest">
              Connexion
            </h2>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(252,92,125,0.15)', color: '#fca5a5', border: '1px solid rgba(252,92,125,0.3)' }}>
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                    onFocus={e => e.target.style.borderColor = GL}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPwd ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                    onFocus={e => e.target.style.borderColor = GL}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Mot de passe oublié */}
              <div className="text-right">
                <Link to="/forgot-password"
                  className="text-xs font-semibold hover:text-white transition-colors"
                  style={{ color: GL }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton */}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg,${G},#e8b830)`, color: B }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Connexion…</>
                  : <><LogIn size={16} /> Se connecter</>}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-white/50">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-bold hover:text-white transition-colors" style={{ color: GL }}>
                  Créer un compte
                </Link>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-[10px] text-white/25 mt-5">
            © {new Date().getFullYear()} EEAD-TU · Tout l'Évangile à toute la ville
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
