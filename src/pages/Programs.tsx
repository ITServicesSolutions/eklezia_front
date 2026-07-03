import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  type Program,
  type CreateProgramData,
} from '../api/programs';
import { getProgramTypes, type ProgramType } from '../api/programTypes';
import { getCurrentUser, canManageContent } from '../utils/auth';
import { getColorForType } from '../utils/colors';
import Pagination from '../components/Pagination';
import { Calendar, Clock, Plus, X, Eye, Edit3, Trash2, FileText, AlertTriangle } from 'lucide-react';

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [viewingProgram, setViewingProgram] = useState<Program | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [formData, setFormData] = useState<CreateProgramData>({
    program_day: new Date().toISOString().split('T')[0],
    hours_start: '08:00',
    description: '',
    program_type_id: 0,
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getPrograms();
      setPrograms(data);
    } catch (error: any) {
      console.error('Failed to fetch programs', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des programmes');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramTypes = async () => {
    try {
      const types = await getProgramTypes();
      setProgramTypes(types);
      if (types.length > 0 && formData.program_type_id === 0) {
        setFormData(prev => ({ ...prev, program_type_id: types[0].id }));
      }
    } catch (err) {
      console.error('Failed to load program types', err);
      setError('Impossible de charger les types de programme');
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    initializeUser();
    fetchPrograms();
    fetchProgramTypes();
  }, []);

  const hasManagementPermission = canManageContent(currentUser);
  const isAdmin = currentUser?.role?.name === 'admin';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'program_type_id' ? parseInt(value, 10) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      program_day: new Date().toISOString().split('T')[0],
      hours_start: '08:00',
      description: '',
      program_type_id: programTypes[0]?.id || 0,
    });
    setEditingProgram(null);
  };

  const handleEditClick = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      program_day: program.program_day,
      hours_start: program.hours_start.substring(0, 5),
      description: program.description || '',
      program_type_id: program.program_type_id,
    });
    setShowForm(true);
    setError(null);
  };

  const handleViewClick = (program: Program) => {
    setViewingProgram(program);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.program_day) {
      setError('La date du programme est requise');
      return;
    }
    if (!formData.hours_start) {
      setError('L\'heure de début est requise');
      return;
    }
    if (!formData.program_type_id || formData.program_type_id === 0) {
      setError('Veuillez sélectionner un type de programme');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        hours_start: formData.hours_start + ':00',
      };

      let savedProgram: Program;
      if (editingProgram) {
        savedProgram = await updateProgram(editingProgram.id, payload);
        setPrograms(prev =>
          prev.map(p => (p.id === savedProgram.id ? savedProgram : p))
        );
      } else {
        savedProgram = await createProgram(payload);
        setPrograms(prev => [...prev, savedProgram]);
      }

      resetForm();
      setShowForm(false);
      setError(null);
    } catch (error: any) {
      console.error('Failed to save program', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError("Vous n'avez pas les permissions nécessaires.");
      } else if (error.response?.status === 422) {
        setError('Données invalides. Vérifiez les champs du formulaire.');
      } else if (error.response?.data?.detail) {
        setError(`Erreur: ${error.response.data.detail}`);
      } else {
        setError('Erreur lors de l\'enregistrement du programme');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir supprimer ce programme ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fc5c7d',
      cancelButtonColor: '#6c63ff',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      Swal.fire({
        title: 'Supprimé!',
        text: 'Le programme a été supprimé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Failed to delete program', error);
      let errorMessage = 'Erreur lors de la suppression';
      if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.response?.status === 403) {
        errorMessage = "Vous n'avez pas les permissions nécessaires.";
      } else if (error.response?.data?.detail) {
        errorMessage = `Erreur: ${error.response.data.detail}`;
      }
      Swal.fire({
        title: 'Erreur',
        text: errorMessage,
        icon: 'error',
      });
    }
  };

  const handleReconnect = () => {
    localStorage.removeItem('ekklesia-token');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const totalPages = Math.max(1, Math.ceil(programs.length / itemsPerPage));
  const paginatedPrograms = programs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  if (loading && programs.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-neo-text mb-6">Programmes</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neo-text">Programmes</h3>
          <p className="text-sm text-neo-text-secondary">Découvrez le planning de nos activités et événements</p>
        </div>
        {hasManagementPermission && (
          <button
            onClick={() => {
              if (showForm) { handleCancel(); }
              else { resetForm(); setShowForm(true); }
            }}
            className="neo-btn-primary"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? 'Annuler' : 'Nouveau Programme'}</span>
          </button>
        )}
      </div>

      {/* Bannière utilisateur */}
      <div className="neo-card p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="neo-circle w-10 h-10 flex items-center justify-center">
              {currentUser ? (
                <Calendar size={18} className="text-neo-success" />
              ) : (
                <AlertTriangle size={18} className="text-neo-warning" />
              )}
            </div>
            <div>
              {currentUser ? (
                <div className="text-sm">
                  <span className="font-semibold text-neo-text">{currentUser.email}</span>
                  <span className="text-neo-text-secondary mx-1">•</span>
                  <span className="font-semibold text-neo-text">{currentUser.role?.name || 'Non déterminé'}</span>
                  <span className="text-neo-text-secondary mx-1">•</span>
                  <span className={hasManagementPermission ? 'text-neo-success' : 'text-neo-text-secondary'}>
                    {hasManagementPermission ? 'Permissions complètes' : 'Lecture seule'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neo-warning">Session non détectée</span>
                  <button onClick={handleReconnect} className="neo-btn-primary text-sm !py-1.5 !px-3">
                    Se reconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="neo-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-neo-error" />
              <span className="font-medium text-neo-error">{error}</span>
            </div>
            {error.includes('Session expirée') && (
              <button onClick={handleReconnect} className="neo-btn-primary text-sm !py-1.5 !px-3">
                Se reconnecter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && hasManagementPermission && (
        <div className="neo-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: '#d1d8e0' }}>
            <h4 className="text-lg font-bold text-neo-text flex items-center gap-2">
              <Plus size={20} className="text-neo-primary" />
              <span>{editingProgram ? 'Modifier le programme' : 'Nouveau Programme'}</span>
            </h4>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neo-text">Date du programme *</label>
                <input
                  type="date"
                  name="program_day"
                  value={formData.program_day}
                  onChange={handleInputChange}
                  className="neo-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neo-text">Heure de début *</label>
                <input
                  type="time"
                  name="hours_start"
                  value={formData.hours_start}
                  onChange={handleInputChange}
                  className="neo-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neo-text">Type de programme *</label>
                <select
                  name="program_type_id"
                  value={formData.program_type_id}
                  onChange={handleInputChange}
                  className="neo-input"
                  required
                >
                  <option value={0} disabled>Sélectionnez un type</option>
                  {programTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neo-text">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="neo-input resize-none"
                placeholder="Décrivez le programme, les activités prévues, les intervenants..."
                maxLength={500}
              />
              <div className="text-right text-xs text-neo-text-secondary">{formData.description.length}/500 caractères</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="neo-btn-primary">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{editingProgram ? 'Mise à jour...' : 'Création...'}</span></>
                ) : (
                  <><Calendar size={18} /><span>{editingProgram ? 'Mettre à jour' : 'Créer le programme'}</span></>
                )}
              </button>
              <button type="button" onClick={handleCancel} className="neo-btn-ghost">
                <X size={18} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="neo-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#d1d8e0' }}>
          <h2 className="text-lg font-bold text-neo-text">
            Programmes <span className="text-neo-primary">({programs.length})</span>
          </h2>
        </div>

        {programs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-neo-text mb-1">Aucun programme</h3>
            <p className="text-sm text-neo-text-secondary mb-4">Aucun programme n'est prévu pour le moment.</p>
            {hasManagementPermission && (
              <button onClick={() => { resetForm(); setShowForm(true); }} className="neo-btn-primary">
                <Plus size={18} /> Créer le premier programme
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {paginatedPrograms.map((program) => {
                const type = programTypes.find(t => t.id === program.program_type_id);
                return (
                  <div key={program.id} className="neo-card-sm p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {type && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: getColorForType(type.name) }}>
                          {type.name}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-neo-text">{formatDate(program.program_day)}</span>
                      <span className="text-sm text-neo-text-secondary">{formatTime(program.hours_start)}</span>
                    </div>
                    <p className="mt-2 text-sm text-neo-text-secondary">{program.description || 'Aucune description'}</p>
                    <div className="mt-3 flex gap-1">
                      <button onClick={() => handleViewClick(program)} className="neo-icon-btn" title="Voir">
                        <Eye size={16} className="text-neo-text-secondary" />
                      </button>
                      {hasManagementPermission && (
                        <button onClick={() => handleEditClick(program)} className="neo-icon-btn" title="Modifier">
                          <Edit3 size={16} className="text-neo-primary" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(program.id)} className="neo-icon-btn" title="Supprimer">
                          <Trash2 size={16} className="text-neo-error" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#d1d8e0' }}>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Heure</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#d1d8e0' }}>
                  {paginatedPrograms.map((program) => {
                    const type = programTypes.find(t => t.id === program.program_type_id);
                    return (
                      <tr key={program.id} className="transition-colors hover:bg-black/[0.02]">
                        <td className="px-5 py-4 text-sm text-neo-text whitespace-nowrap">{formatDate(program.program_day)}</td>
                        <td className="px-5 py-4 text-sm text-neo-text whitespace-nowrap">{formatTime(program.hours_start)}</td>
                        <td className="px-5 py-4">
                          {type && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: getColorForType(type.name) }}>
                              {type.name}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-neo-text-secondary max-w-xs truncate">{program.description || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button onClick={() => handleViewClick(program)} className="neo-icon-btn" title="Voir">
                              <Eye size={16} className="text-neo-text-secondary" />
                            </button>
                            {hasManagementPermission && (
                              <button onClick={() => handleEditClick(program)} className="neo-icon-btn" title="Modifier">
                                <Edit3 size={16} className="text-neo-primary" />
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDelete(program.id)} className="neo-icon-btn" title="Supprimer">
                                <Trash2 size={16} className="text-neo-error" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={programs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="programmes"
            />
          </>
        )}
      </div>

      {/* Statistiques */}
      <div className="neo-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neo-primary">{programs.length}</p>
            <p className="text-sm text-neo-text-secondary">Programmes au total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-success">
              {programs.filter(p => new Date(p.program_day) >= new Date()).length}
            </p>
            <p className="text-sm text-neo-text-secondary">Programmes à venir</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-accent">{hasManagementPermission ? 'Actif' : 'Lecture'}</p>
            <p className="text-sm text-neo-text-secondary">Vos permissions</p>
          </div>
        </div>
      </div>

      {/* Modal de visualisation */}
      {viewingProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setViewingProgram(null)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block w-full max-w-lg p-6 overflow-hidden text-left align-bottom transition-all transform sm:my-8 sm:align-middle sm:p-8">
              <div className="neo-card p-0 overflow-hidden relative">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neo-text">Détails du programme</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const type = programTypes.find(t => t.id === viewingProgram.program_type_id);
                          return type ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: getColorForType(type.name) }}>
                              {type.name}
                            </span>
                          ) : (
                            <span className="text-xs text-neo-text-secondary">Type inconnu</span>
                          );
                        })()}
                        <span className="text-xs text-neo-text-secondary">ID: #{viewingProgram.id}</span>
                      </div>
                    </div>
                    <button onClick={() => setViewingProgram(null)} className="neo-icon-btn flex-shrink-0">
                      <X size={18} className="text-neo-text-secondary" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-primary">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatDate(viewingProgram.program_day)}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-accent">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Heure</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatTime(viewingProgram.hours_start)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neo-text-secondary mb-2">
                      <FileText size={14} /> Description
                    </h4>
                    <div className="neo-inset p-4">
                      <p className="text-sm text-neo-text whitespace-pre-wrap">
                        {viewingProgram.description || 'Aucune description fournie.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-primary">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Créé le</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">
                        {viewingProgram.created_at ? new Date(viewingProgram.created_at).toLocaleString('fr-FR') : '—'}
                      </p>
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-accent">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Modifié le</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">
                        {viewingProgram.updated_at ? new Date(viewingProgram.updated_at).toLocaleString('fr-FR') : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#d1d8e0' }}>
                  <button onClick={() => setViewingProgram(null)} className="neo-btn-primary">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;
