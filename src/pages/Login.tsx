import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser } from '../api/auth';
import logo from '../assets/images/logo.jpeg';

export interface LoginCredentials {
  username: string;
  password: string;
  source?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ username: email, password, source: 'web' });
      if (response.access_token) {
        localStorage.setItem('ekklesia-token', response.access_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="neo-circle w-24 h-24 flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        {/* Card */}
        <div className="neo-card p-8">
          {/* Titre */}
          <div className="text-center mb-7">
            <h1 className="text-lg font-bold text-neo-text leading-snug">
              Eglise Évangélique des Assemblées de Dieu
            </h1>
            <p className="text-neo-primary font-semibold text-sm mb-1">Temple Universitaire</p>
            <p className="text-neo-text-secondary text-xs">Espace administrateur</p>
          </div>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-5 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(252,92,125,0.08)', color: '#fc5c7d' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input
                  type="email"
                  required
                  className="neo-input pl-10"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="neo-input pl-10 pr-10"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5 text-neo-text-secondary" />
                    : <Eye className="w-5 h-5 text-neo-text-secondary" />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-neo-primary font-medium hover:text-neo-primary-dark transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="neo-btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion…</>
                : <><ArrowRight className="w-4 h-4" /> Se connecter</>
              }
            </button>
          </form>

          <div className="neo-divider my-5" />

          <p className="text-center text-sm text-neo-text-secondary">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-neo-primary font-semibold hover:text-neo-primary-dark transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neo-text-secondary mt-6">
          © {new Date().getFullYear()} EEAD-TU. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
