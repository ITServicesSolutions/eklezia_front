import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProgramTypes,
  createProgramType,
  updateProgramTypePatch,
  deleteProgramType,
  type ProgramType,
  type ProgramTypeCreate,
  type ProgramTypeUpdate,
} from '../api/programTypes';
import { getCurrentUser, canManageContent } from '../utils/auth';
import { getColorForType } from '../utils/colors';
import Pagination from '../components/Pagination';
import {
  Plus, Pencil, Trash2, Eye, X, Tags, CheckCircle, AlertCircle, Clock,
} from 'lucide-react';

const ProgramTypes: React.FC = () => {
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingType, setViewingType] = useState<ProgramType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [formData, setFormData] = useState<ProgramTypeCreate>({
    name: '',
    description: '',
  });

  console.log('ProgramTypes monté');

  const fetchProgramTypes = async () => {
    try {
      setLoading(true);
      const data = await getProgramTypes();
      setProgramTypes(data);
    } catch (error: any) {
      console.error('Failed to fetch program types', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des types de programme');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    initializeUser();
    fetchProgramTypes();
  }, []);

  const hasManagementPermission = canManageContent(currentUser);
  const isAdmin = currentUser?.role?.name === 'admin';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  const handleEditClick = (type: ProgramType) => {
    setEditingId(type.id);
    setFormData({ name: type.name, description: type.description || '' });
    setShowForm(true);
    setError(null);
  };

  const handleViewClick = (type: ProgramType) => {
    setViewingType(type);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingId) {
        const updateData: ProgramTypeUpdate = {};
        if (formData.name !== programTypes.find(t => t.id === editingId)?.name) {
          updateData.name = formData.name;
        }
        if (formData.description !== programTypes.find(t => t.id === editingId)?.description) {
          updateData.description = formData.description;
        }
        if (Object.keys(updateData).length > 0) {
          const updated = await updateProgramTypePatch(editingId, updateData);
          setProgramTypes(prev => prev.map(t => (t.id === editingId ? updated : t)));
        }
      } else {
        const created = await createProgramType(formData);
        setProgramTypes(prev => [...prev, created]);
      }
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (error: any) {
      console.error('Failed to save program type', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError("Vous n'avez pas les permissions nécessaires.");
      } else if (error.response?.status === 400 && error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Erreur lors de l'enregistrement");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir supprimer ce type de programme ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteProgramType(id);
      setProgramTypes(prev => prev.filter(t => t.id !== id));
      Swal.fire({ title: 'Supprimé !', text: 'Le type de programme a été supprimé.', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error: any) {
      console.error('Failed to delete program type', error);
      let errorMessage = 'Erreur lors de la suppression';
      if (error.response?.status === 401) errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      else if (error.response?.status === 403) errorMessage = "Vous n'avez pas les permissions nécessaires.";
      else if (error.response?.data?.detail) errorMessage = error.response.data.detail;
      Swal.fire({ title: 'Erreur', text: errorMessage, icon: 'error' });
    }
  };

  const handleReconnect = () => {
    localStorage.removeItem('ekklesia-token');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const totalPages = Math.max(1, Math.ceil(programTypes.length / itemsPerPage));
  const paginatedProgramTypes = programTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  if (loading && programTypes.length === 0) {
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
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="neo-circle w-12 h-12 flex items-center justify-center">
              <Tags size={20} className="text-neo-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neo-text">Types de programme</h1>
              <p className="text-sm text-neo-text-secondary">
                Gérez les catégories de programmes
              </p>
            </div>
          </div>
          {hasManagementPermission && (
            <button
              onClick={() => {
                if (showForm) { handleCancel(); } else { resetForm(); setShowForm(true); }
              }}
              className="neo-btn-primary"
            >
              <Plus size={16} />
              {showForm ? 'Annuler' : 'Nouveau type'}
            </button>
          )}
        </motion.div>

        {/* Info bar — utilisateur connecté + permissions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="neo-inset p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          {currentUser ? (
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-neo-success flex-shrink-0" />
              <span className="text-sm text-neo-text">
                <span className="font-semibold">{currentUser.email}</span>
                {' '}&bull;{' '}Rôle :{' '}
                <span className="font-semibold capitalize">{currentUser.role?.name || 'Non déterminé'}</span>
                {' '}&bull;{' '}
                <span className={hasManagementPermission ? 'text-neo-success font-medium' : 'text-neo-text-secondary'}>
                  {hasManagementPermission ? 'Peut gérer' : 'Lecture seule'}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-neo-warning flex-shrink-0" />
              <span className="text-sm text-neo-text font-medium">Session non détectée</span>
              <button onClick={handleReconnect} className="neo-btn-primary text-xs px-3 py-1.5">
                Se reconnecter
              </button>
            </div>
          )}
          <span className="text-xs text-neo-text-secondary">
            {programTypes.length} type{programTypes.length !== 1 ? 's' : ''} au total
          </span>
        </motion.div>

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="neo-inset p-4 mb-5 flex items-center justify-between gap-3 border-l-4 border-neo-error"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} style={{ color: '#fc5c7d' }} />
                <span className="text-sm font-medium text-neo-text">{error}</span>
              </div>
              {error.includes('Session') && (
                <button onClick={handleReconnect} className="neo-btn-primary text-xs px-3 py-1.5">
                  Se reconnecter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulaire animé — create / edit */}
        <AnimatePresence>
          {showForm && hasManagementPermission && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="neo-card p-6 mb-6"
            >
              <h4 className="text-lg font-bold text-neo-text mb-5 flex items-center gap-2">
                <Plus size={18} className="text-neo-primary" />
                {editingId ? 'Modifier le type' : 'Nouveau type'}
              </h4>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Nom du type *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="neo-input"
                    placeholder="Ex: Culte, Étude biblique, Prière..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="neo-inset w-full px-4 py-2.5 text-neo-text text-sm resize-none outline-none"
                    placeholder="Description optionnelle du type..."
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-neo-text-secondary mt-1">
                    {formData.description?.length || 0}/500
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isSubmitting} className="neo-btn-primary">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingId ? 'Mise à jour...' : 'Création...'}
                      </span>
                    ) : (
                      editingId ? 'Mettre à jour' : 'Créer'
                    )}
                  </button>
                  <button type="button" onClick={handleCancel} className="neo-btn-ghost">
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid cards programme types */}
        {programTypes.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Tags size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-neo-text mb-2">Aucun type</h3>
            <p className="text-neo-text-secondary text-sm mb-6">
              Commencez par créer un type de programme.
            </p>
            {hasManagementPermission && (
              <button onClick={() => { resetForm(); setShowForm(true); }} className="neo-btn-primary">
                <Plus size={16} />
                Créer le premier type
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {paginatedProgramTypes.map((type, i) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="neo-card-sm p-5 flex flex-col gap-3"
                >
                  {/* Couleur dot + nom */}
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getColorForType(type.name) }}
                    />
                    <h3 className="font-bold text-neo-text text-lg leading-tight truncate flex-1">
                      {type.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neo-text-secondary flex-1 line-clamp-2">
                    {type.description || 'Aucune description'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-transparent"
                    style={{ borderColor: '#c5ccd4' }}
                  >
                    <div className="flex items-center gap-1 text-xs text-neo-text-secondary">
                      <Clock size={12} />
                      <span>{formatDate(type.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewClick(type)}
                        className="neo-icon-btn text-neo-text-secondary hover:text-neo-primary"
                        title="Voir"
                      >
                        <Eye size={15} />
                      </button>
                      {hasManagementPermission && (
                        <button
                          onClick={() => handleEditClick(type)}
                          className="neo-icon-btn text-neo-primary"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(type.id)}
                          className="neo-icon-btn"
                          style={{ color: '#fc5c7d' }}
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={programTypes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="types"
            />
          </>
        )}

        {/* Modal detail — AnimatePresence overlay */}
        <AnimatePresence>
          {viewingType && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(45,55,72,0.45)', backdropFilter: 'blur(4px)' }}
              onClick={() => setViewingType(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="neo-card p-6 w-full max-w-lg"
                onClick={e => e.stopPropagation()}
              >
                {/* Top accent */}
                <div
                  className="h-1.5 rounded-full mb-5"
                  style={{ background: `linear-gradient(90deg, ${getColorForType(viewingType.name)}, #6c63ff)` }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neo-text">{viewingType.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: getColorForType(viewingType.name) }}
                      />
                      <span className="text-xs text-neo-text-secondary">ID #{viewingType.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingType(null)}
                    className="neo-icon-btn text-neo-text-secondary"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <div className="neo-inset p-4 rounded-xl">
                    <p className="text-neo-text text-sm whitespace-pre-wrap">
                      {viewingType.description || 'Aucune description fournie.'}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="neo-inset p-3 rounded-xl">
                    <p className="text-xs text-neo-text-secondary mb-1">Créé le</p>
                    <p className="text-sm font-semibold text-neo-text">{formatDate(viewingType.created_at)}</p>
                  </div>
                  <div className="neo-inset p-3 rounded-xl">
                    <p className="text-xs text-neo-text-secondary mb-1">Modifié le</p>
                    <p className="text-sm font-semibold text-neo-text">{formatDate(viewingType.updated_at)}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setViewingType(null)} className="neo-btn-primary">
                    Fermer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ProgramTypes;
