import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { resetPassword } from '../api/auth';
import logo from '../assets/images/logo.jpeg';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!token) setError('Token de réinitialisation manquant ou invalide');
  }, [token]);

  const checkStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[a-z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    setStrength(s);
  };

  const strengthColor = strength < 50 ? '#fc5c7d' : strength < 75 ? '#ed8936' : '#48bb78';
  const strengthLabel = strength < 50 ? 'Faible' : strength < 75 ? 'Moyen' : 'Fort';
  const strengthTextColor = strength < 50 ? 'text-neo-error' : strength < 75 ? 'text-neo-warning' : 'text-neo-success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setError('Token de réinitialisation manquant'); return; }
    if (!newPassword || !confirmPassword) { setError('Veuillez remplir tous les champs'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (strength < 75) { setError('Le mot de passe est trop faible. Utilisez majuscules, minuscules et chiffres.'); return; }
    try {
      setLoading(true);
      setError(null);
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /* Token invalide */
  if (!token) {
    return (
      <div className="min-h-screen bg-neo-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card p-10 w-full max-w-md text-center"
        >
          <div className="neo-circle w-20 h-20 mx-auto mb-5 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-neo-error" />
          </div>
          <h2 className="text-xl font-bold text-neo-text mb-2">Lien invalide</h2>
          <p className="text-neo-text-secondary text-sm mb-6">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link to="/forgot-password" className="neo-btn-primary inline-flex items-center gap-2 px-6 py-3">
            Demander un nouveau lien
          </Link>
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

        {/* Card */}
        <div className="neo-card p-8">
          {/* Titre */}
          <div className="text-center mb-7">
            <h1 className="text-lg font-bold text-neo-text leading-snug">
              Eglise Evangélique des Assemblées de Dieu
            </h1>
            <p className="text-neo-primary font-semibold text-sm mb-1">Temple Universitaire</p>
            <p className="text-neo-text-secondary text-xs">Nouveau mot de passe</p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="neo-circle w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-neo-success" />
                </div>
                <h2 className="text-xl font-bold text-neo-text mb-2">Mot de passe modifié !</h2>
                <p className="text-neo-text-secondary text-sm mb-6">
                  Redirection vers la connexion…
                </p>
                <div className="neo-inset rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6c63ff, #a78bfa)' }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Info sécurité */}
                <div className="neo-inset rounded-xl p-4 mb-6 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-neo-primary flex-shrink-0 mt-0.5" />
                  <p className="text-neo-text-secondary text-sm">
                    Utilisez au moins 8 caractères avec des majuscules, minuscules et chiffres.
                  </p>
                </div>

                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mb-5 p-3 rounded-xl text-neo-error text-sm"
                      style={{ background: 'rgba(252,92,125,0.08)' }}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nouveau mot de passe */}
                  <div>
                    <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        className="neo-input pl-10 pr-10"
                        placeholder="Entrez votre nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); checkStrength(e.target.value); }}
                      />
                      <button type="button" className="absolute right-3 top-3.5" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <EyeOff className="w-5 h-5 text-neo-text-secondary" /> : <Eye className="w-5 h-5 text-neo-text-secondary" />}
                      </button>
                    </div>

                    {/* Barre de force */}
                    {newPassword && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-neo-text-secondary">Force</span>
                          <span className={`text-xs font-semibold ${strengthTextColor}`}>{strengthLabel}</span>
                        </div>
                        <div className="neo-inset rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full transition-all duration-300"
                            animate={{ width: `${strength}%` }}
                            style={{ background: strengthColor }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirmer */}
                  <div>
                    <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-neo-text-secondary" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        className="neo-input pl-10 pr-10"
                        placeholder="Confirmez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" className="absolute right-3 top-3.5" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff className="w-5 h-5 text-neo-text-secondary" /> : <Eye className="w-5 h-5 text-neo-text-secondary" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-neo-error mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Les mots de passe ne correspondent pas
                      </p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-xs text-neo-success mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Les mots de passe correspondent
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="neo-btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Modification en cours…</>
                      : <><ShieldCheck className="w-4 h-4" /> Modifier le mot de passe</>
                    }
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <>
              <div className="neo-divider my-5" />
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-neo-primary text-sm font-semibold hover:text-neo-primary-dark transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-neo-text-secondary mt-6">
          © {new Date().getFullYear()} EEAD-TU. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
