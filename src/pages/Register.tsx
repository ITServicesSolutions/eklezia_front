import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, Check } from 'lucide-react';
import { registerUser } from '../api/auth';
import logo from '../assets/images/logo.jpeg';

interface RegisterFormData {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '', email: '', phone_number: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const passwordOk = formData.password.length >= 6;
  const passwordsMatch = formData.password === formData.confirmPassword && !!formData.confirmPassword;

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Tous les champs obligatoires doivent être remplis'); return false;
    }
    if (!passwordOk) { setError('Le mot de passe doit contenir au moins 6 caractères'); return false; }
    if (!passwordsMatch) { setError('Les mots de passe ne correspondent pas'); return false; }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { setError('Adresse email invalide'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number || undefined,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { email: formData.email } }), 4000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neo-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neo-card p-10 w-full max-w-md text-center"
        >
          <div className="neo-circle w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-neo-success" />
          </div>
          <h2 className="text-2xl font-bold text-neo-text mb-2">Compte créé !</h2>
          <p className="text-neo-text-secondary mb-1">
            Bienvenue <span className="font-semibold text-neo-primary">{formData.name}</span>
          </p>
          <p className="text-neo-text-secondary text-sm mb-6">Redirection vers la connexion…</p>
          <div className="neo-inset rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6c63ff, #a78bfa)' }}
            />
          </div>
          <p className="text-xs text-neo-text-secondary mt-4">
            Ou <Link to="/login" className="text-neo-primary font-medium hover:text-neo-primary-dark">cliquez ici</Link>
          </p>
        </motion.div>
      </div>
    );
  }

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

        <div className="neo-card p-8">
          <div className="text-center mb-7">
            <h1 className="text-lg font-bold text-neo-text leading-snug">
              Eglise Évangélique des Assemblées de Dieu
            </h1>
            <p className="text-neo-primary font-semibold text-sm mb-1">Temple Universitaire</p>
            <p className="text-neo-text-secondary text-xs">Créer un compte administrateur</p>
          </div>

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
            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input name="name" type="text" required className="neo-input pl-10" placeholder="Votre nom complet" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input name="email" type="email" required className="neo-input pl-10" placeholder="votre@email.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input name="phone_number" type="tel" className="neo-input pl-10" placeholder="+229 01 XX XX XX XX" value={formData.phone_number} onChange={handleChange} />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input name="password" type={showPassword ? 'text' : 'password'} required className="neo-input pl-10 pr-10" placeholder="Min. 6 caractères" value={formData.password} onChange={handleChange} />
                <button type="button" className="absolute right-3 top-3.5" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5 text-neo-text-secondary" /> : <Eye className="w-5 h-5 text-neo-text-secondary" />}
                </button>
              </div>
            </div>

            {/* Confirmer */}
            <div>
              <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">Confirmer *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} required className="neo-input pl-10 pr-10" placeholder="Répétez le mot de passe" value={formData.confirmPassword} onChange={handleChange} />
                <button type="button" className="absolute right-3 top-3.5" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff className="w-5 h-5 text-neo-text-secondary" /> : <Eye className="w-5 h-5 text-neo-text-secondary" />}
                </button>
              </div>
            </div>

            {/* Indicateurs */}
            {(formData.password || formData.confirmPassword) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-inset rounded-xl p-3 space-y-1.5">
                <div className={`flex items-center gap-2 text-xs font-medium ${passwordOk ? 'text-neo-success' : 'text-neo-text-secondary'}`}>
                  <Check className="w-3.5 h-3.5" /> Au moins 6 caractères
                </div>
                <div className={`flex items-center gap-2 text-xs font-medium ${passwordsMatch ? 'text-neo-success' : 'text-neo-text-secondary'}`}>
                  <Check className="w-3.5 h-3.5" /> Les mots de passe correspondent
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="neo-btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Création en cours…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="neo-divider my-5" />

          <p className="text-center text-sm text-neo-text-secondary">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-neo-primary font-semibold hover:text-neo-primary-dark transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Se connecter
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

export default Register;
