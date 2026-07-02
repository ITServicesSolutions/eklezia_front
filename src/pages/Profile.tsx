import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsersMe, updateCurrentUser } from '../api/users';
import { resetPasswordProfile } from '../api/auth';
import { Save, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, Shield } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  phone_number?: string;
  role: {
    id: number;
    name: string;
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Édition du profil
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Changement de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUsersMe();
      setUser(data);
      setFormData({
        name: data.name || '',
        phone_number: data.phone_number || '',
      });
      setError(null);
    } catch (err: any) {
      setError('Impossible de charger le profil');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateCurrentUser(formData);
      setUser(prev => ({ ...prev!, ...updated }));
      setIsEditing(false);
      setSuccessMessage('Profil mis à jour avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.new.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setLoading(true);
      await resetPasswordProfile(passwordData.current, passwordData.new);
      setPasswordSuccess('Mot de passe modifié avec succès');
      setPasswordData({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || err.message || 'Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading && !user) {
    return (
      <div className="bg-neo-bg min-h-screen flex items-center justify-center">
        <div className="neo-circle w-16 h-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neo-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neo-bg min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header — Avatar + Nom + Badge rôle */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-6 mb-8"
        >
          <div className="neo-circle w-24 h-24 flex items-center justify-center flex-shrink-0">
            <span
              className="text-2xl font-bold text-white select-none"
              style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {user?.name ? getInitials(user.name) : <UserIcon size={32} className="text-neo-primary" />}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neo-text">{user?.name || user?.email}</h1>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold text-white bg-neo-primary capitalize">
              {user?.role.name}
            </span>
          </div>
        </motion.div>

        {/* Messages success / error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="neo-inset p-4 mb-5 border-l-4 border-neo-error"
            >
              <p className="text-sm font-medium" style={{ color: '#fc5c7d' }}>{error}</p>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="neo-inset p-4 mb-5 border-l-4 border-neo-success"
            >
              <p className="text-sm font-medium" style={{ color: '#48bb78' }}>{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card — Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="neo-card p-6"
        >
          {/* Header section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="neo-circle w-10 h-10 flex items-center justify-center">
                <UserIcon size={18} className="text-neo-primary" />
              </div>
              <h2 className="text-lg font-bold text-neo-text">Informations personnelles</h2>
            </div>

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="neo-btn-primary text-sm px-4 py-2">
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="neo-btn-primary text-sm px-4 py-2"
                >
                  <Save size={15} />
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user?.name || '', phone_number: user?.phone_number || '' });
                  }}
                  className="neo-btn-ghost text-sm px-4 py-2"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Grid 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                Nom complet
              </label>
              <div className="relative">
                <UserIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neo-text-secondary pointer-events-none"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="neo-input pl-9"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neo-text-secondary pointer-events-none"
                />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="neo-input pl-9"
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
            </div>

            {/* Email désactivé */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative opacity-70">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neo-text-secondary pointer-events-none"
                />
                <div className="neo-inset px-4 py-2.5 pl-9 rounded-xl text-neo-text-secondary text-sm">
                  {user?.email || ''}
                </div>
              </div>
              <p className="text-xs text-neo-text-secondary mt-1.5 ml-1">L'email ne peut pas être modifié</p>
            </div>
          </div>
        </motion.div>

        {/* Card — Sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="neo-card p-6 mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="neo-circle w-10 h-10 flex items-center justify-center">
                <Shield size={18} className="text-neo-primary" />
              </div>
              <h2 className="text-lg font-bold text-neo-text">Sécurité</h2>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="neo-btn-ghost text-sm px-4 py-2"
              >
                <Lock size={15} />
                Changer le mot de passe
              </button>
            )}
          </div>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.form
                key="pwdform"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePasswordChange}
                className="space-y-4 overflow-hidden"
              >
                {passwordError && (
                  <div className="neo-inset p-3 border-l-4 border-neo-error">
                    <p className="text-sm" style={{ color: '#fc5c7d' }}>{passwordError}</p>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="neo-inset p-3 border-l-4 border-neo-success">
                    <p className="text-sm" style={{ color: '#48bb78' }}>{passwordSuccess}</p>
                  </div>
                )}

                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      required
                      className="neo-input pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-text-secondary hover:text-neo-primary transition-colors"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      required
                      minLength={8}
                      className="neo-input pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-text-secondary hover:text-neo-primary transition-colors"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmer mot de passe */}
                <div>
                  <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      required
                      className="neo-input pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-text-secondary hover:text-neo-primary transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="neo-btn-primary text-sm">
                    {loading ? 'Modification...' : 'Mettre à jour'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ current: '', new: '', confirm: '' });
                      setPasswordError(null);
                    }}
                    className="neo-btn-ghost text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {!showPasswordForm && (
            <p className="text-sm text-neo-text-secondary">
              Modifiez votre mot de passe pour sécuriser votre compte.
            </p>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
