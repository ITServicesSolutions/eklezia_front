import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { requestPasswordReset } from '../api/auth';
import logo from '../assets/images/logo.jpeg';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Veuillez entrer votre adresse email'); return; }
    try {
      setLoading(true);
      setError(null);
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.');
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

        <div className="neo-card p-8">
          {/* Titre */}
          <div className="text-center mb-7">
            <h1 className="text-lg font-bold text-neo-text leading-snug">
              Eglise Évangélique des Assemblées de Dieu
            </h1>
            <p className="text-neo-primary font-semibold text-sm mb-1">Temple Universitaire</p>
            <p className="text-neo-text-secondary text-xs">Récupération de mot de passe</p>
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
                <h2 className="text-xl font-bold text-neo-text mb-2">Email envoyé !</h2>
                <p className="text-neo-text-secondary text-sm mb-1">Un lien de réinitialisation a été envoyé à</p>
                <p className="text-neo-primary font-semibold text-sm mb-6">{email}</p>
                <p className="text-neo-text-secondary text-xs mb-6">Vérifiez votre boîte de réception et vos spams.</p>
                <Link to="/login" className="neo-btn-primary inline-flex items-center gap-2 px-6 py-3">
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Info */}
                <div className="neo-inset rounded-xl p-4 mb-6 flex items-start gap-3">
                  <Send className="w-5 h-5 text-neo-primary flex-shrink-0 mt-0.5" />
                  <p className="text-neo-text-secondary text-sm">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
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

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-neo-text mb-1.5 uppercase tracking-wide">
                      Adresse email
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="neo-btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours…</>
                      : <><Send className="w-4 h-4" /> Envoyer le lien</>
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
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
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

export default ForgotPassword;
