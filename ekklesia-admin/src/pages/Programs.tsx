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

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [viewingProgram, setViewingProgram] = useState<Program | null>(null); // Nouvel état
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

  // Nouveau handler pour la visualisation
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
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des programmes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Programmes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez le planning de nos activités et événements
          </p>
        </div>

        {/* Bannière utilisateur / permissions */}
        <div
          className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
            currentUser
              ? 'bg-blue-500/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
              : 'bg-amber-500/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  currentUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-amber-100 dark:bg-amber-900'
                }`}
              >
                {currentUser ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div>
                {currentUser ? (
                  <div className="text-sm sm:text-base">
                    <span className="font-semibold">{currentUser.email}</span> • Rôle:{' '}
                    <span className="font-semibold">{currentUser.role?.name || 'Non déterminé'}</span> •{' '}
                    <span
                      className={`ml-1 ${
                        hasManagementPermission
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {hasManagementPermission ? 'Permissions complètes' : 'Lecture seule'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Session non détectée</span>
                    <button
                      onClick={handleReconnect}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                    >
                      Se reconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {hasManagementPermission && (
              <button
                onClick={() => {
                  if (showForm) {
                    handleCancel();
                  } else {
                    resetForm();
                    setShowForm(true);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{showForm ? 'Annuler' : 'Nouveau Programme'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
              </div>
              {error.includes('Session expirée') && (
                <button
                  onClick={handleReconnect}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Se reconnecter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Formulaire de création / édition */}
        {showForm && hasManagementPermission && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{editingProgram ? 'Modifier le programme' : 'Nouveau Programme'}</span>
                </h4>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label htmlFor="program_day" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Date du programme *
                    </label>
                    <input
                      type="date"
                      id="program_day"
                      name="program_day"
                      value={formData.program_day}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Heure de début */}
                  <div className="space-y-2">
                    <label htmlFor="hours_start" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      id="hours_start"
                      name="hours_start"
                      value={formData.hours_start}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Type de programme */}
                  <div className="space-y-2">
                    <label htmlFor="program_type_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Type de programme *
                    </label>
                    <select
                      id="program_type_id"
                      name="program_type_id"
                      value={formData.program_type_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    >
                      <option value={0} disabled>
                        Sélectionnez un type
                      </option>
                      {programTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div></div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-200"
                    placeholder="Décrivez le programme, les activités prévues, les intervenants..."
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {formData.description.length}/500 caractères
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editingProgram ? 'Mise à jour...' : 'Création...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{editingProgram ? 'Mettre à jour' : 'Créer le programme'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des programmes - Tableau */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Programmes
              <span className="ml-2 text-blue-600 dark:text-blue-400">({programs.length})</span>
            </h2>
          </div>

          {programs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun programme</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Aucun programme n'est prévu pour le moment.
                </p>
                {hasManagementPermission && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                  >
                    Créer le premier programme
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-4 p-4 lg:hidden">
                {paginatedPrograms.map((program) => {
                  const type = programTypes.find(t => t.id === program.program_type_id);
                  return (
                    <div key={program.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
                      <div className="flex flex-wrap items-center gap-3">
                        {type && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: getColorForType(type.name) }}>
                            {type.name}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(program.program_day)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(program.hours_start)}</span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{program.description || 'Aucune description'}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => handleViewClick(program)} className="rounded-lg p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-300" title="Voir" aria-label="Voir">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {hasManagementPermission && (
                          <button onClick={() => handleEditClick(program)} className="rounded-lg p-2 text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300" title="Modifier" aria-label="Modifier">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => handleDelete(program.id)} className="rounded-lg p-2 text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400 dark:hover:text-red-300" title="Supprimer" aria-label="Supprimer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedPrograms.map((program) => {
                    const type = programTypes.find(t => t.id === program.program_type_id);
                    return (
                      <tr key={program.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(program.program_day)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatTime(program.hours_start)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {type && (
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{ backgroundColor: getColorForType(type.name) }}
                            >
                              {type.name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                            {program.description || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* Bouton Voir - accessible à tous */}
                            <button
                              onClick={() => handleViewClick(program)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                              title="Voir"
                              aria-label="Voir"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {hasManagementPermission && (
                              <button
                                onClick={() => handleEditClick(program)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Modifier"
                                aria-label="Modifier"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(program.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                title="Supprimer"
                                aria-label="Supprimer"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{programs.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Programmes au total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {programs.filter(p => new Date(p.program_day) >= new Date()).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Programmes à venir</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {hasManagementPermission ? 'Actif' : 'Lecture'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vos permissions</div>
            </div>
          </div>
        </div>

        {/* Modal de visualisation */}
        {viewingProgram && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay avec flou */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
                aria-hidden="true"
                onClick={() => setViewingProgram(null)}
              ></div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modale */}
              <div className="inline-block w-full max-w-lg p-6 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:p-8">
                {/* Barre de dégradé en haut */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white" id="modal-title">
                      Détails du programme
                    </h3>
                    <div className="flex items-center mt-2 space-x-2">
                      {(() => {
                        const type = programTypes.find(t => t.id === viewingProgram.program_type_id);
                        return type ? (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: getColorForType(type.name) }}
                          >
                            {type.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Type inconnu</span>
                        );
                      })()}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ID: #{viewingProgram.id}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingProgram(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Date et Heure */}
                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-center mb-2 text-blue-700 dark:text-blue-300">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold">Date</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatDate(viewingProgram.program_day)}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center mb-2 text-purple-700 dark:text-purple-300">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Heure</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatTime(viewingProgram.hours_start)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="flex items-center mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Description
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {viewingProgram.description || 'Aucune description fournie.'}
                    </p>
                  </div>
                </div>

                {/* Dates de création et modification */}
                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-center mb-2 text-blue-700 dark:text-blue-300">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Créé le</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {viewingProgram.created_at ? new Date(viewingProgram.created_at).toLocaleString('fr-FR') : '—'}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center mb-2 text-purple-700 dark:text-purple-300">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-semibold">Modifié le</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {viewingProgram.updated_at ? new Date(viewingProgram.updated_at).toLocaleString('fr-FR') : '—'}
                    </p>
                  </div>
                </div>

                {/* Pied de page */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setViewingProgram(null)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
