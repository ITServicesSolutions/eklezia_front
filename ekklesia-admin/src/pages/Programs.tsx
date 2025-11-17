import React, { useState, useEffect } from 'react';
import { getPrograms, createProgram } from '../api/programs';

export interface Program {
  id: number;
  program_day: string;
  hours_start: string;
  description: string;
  user_id: number;
}

export interface CreateProgramData {
  program_day: string;
  hours_start: string;
  description: string;
}

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProgram, setNewProgram] = useState<CreateProgramData>({
    program_day: new Date().toISOString().split('T')[0],
    hours_start: '08:00',
    description: ''
  });

  const getUserInfoFromToken = () => {
    try {
      const token = localStorage.getItem('ekklesia-token');
      if (!token) {
        return { role: null, email: null };
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.sub || payload.email;
      
      let role = null;
      if (email) {
        if (email.includes('admin') || email === 'administrateur@itss.com') {
          role = 'admin';
        } else if (email.includes('moderateur') || email.includes('moderator')) {
          role = 'moderator';
        }
      }
      
      return { role, email };
      
    } catch (error) {
      console.error('Erreur décodage token:', error);
      return { role: null, email: null };
    }
  };

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

  useEffect(() => {
    fetchPrograms();
    const userInfo = getUserInfoFromToken();
    setUserRole(userInfo.role);
    setUserEmail(userInfo.email);
  }, []);

  const hasAdminOrModeratorRole = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProgram.program_day) {
      setError('La date du programme est requise');
      return;
    }

    if (!newProgram.hours_start) {
      setError('L\'heure de début est requise');
      return;
    }

    try {
      setIsSubmitting(true);
      const programToCreate = {
        ...newProgram,
        hours_start: newProgram.hours_start + ':00'
      };
      
      const createdProgram = await createProgram(programToCreate);
      setPrograms([...programs, createdProgram]);
      setNewProgram({
        program_day: new Date().toISOString().split('T')[0],
        hours_start: '08:00',
        description: ''
      });
      setShowForm(false);
      setError(null);
    } catch (error: any) {
      console.error('Failed to add program', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas les permissions pour créer un programme');
      } else if (error.response?.status === 422) {
        setError('Données invalides. Vérifiez les champs du formulaire.');
      } else if (error.response?.data?.detail) {
        setError(`Erreur: ${error.response.data.detail}`);
      } else {
        setError('Erreur lors de l\'ajout du programme');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReconnect = () => {
    localStorage.removeItem('ekklesia-token');
    window.location.href = '/login';
  };

  // Fonction pour formater la date en français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonction pour formater l'heure
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (loading) {
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Programmes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez le planning de nos activités et événements
          </p>
        </div>

        {/* User Info Banner */}
        <div className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
          userRole 
            ? 'bg-blue-500/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200' 
            : 'bg-amber-500/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                userRole ? 'bg-blue-100 dark:bg-blue-900' : 'bg-amber-100 dark:bg-amber-900'
              }`}>
                {userRole ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                {userEmail ? (
                  <div className="text-sm sm:text-base">
                    <span className="font-semibold">{userEmail}</span> • 
                    Rôle: <span className="font-semibold">{userRole || 'Non déterminé'}</span> • 
                    <span className={`ml-1 ${hasAdminOrModeratorRole() ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {hasAdminOrModeratorRole() ? 'Permissions complètes' : 'Lecture seule'}
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
            
            {hasAdminOrModeratorRole() && (
              <button
                onClick={() => setShowForm(!showForm)}
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

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

        {/* Add Program Form */}
        {showForm && hasAdminOrModeratorRole() && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nouveau Programme</span>
                </h4>
              </div>
              
              <form onSubmit={handleAdd} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="program_day" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Date du programme *
                    </label>
                    <input
                      type="date"
                      id="program_day"
                      name="program_day"
                      value={newProgram.program_day}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hours_start" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      id="hours_start"
                      name="hours_start"
                      value={newProgram.hours_start}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newProgram.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-200"
                    placeholder="Décrivez le programme, les activités prévues, les intervenants..."
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {newProgram.description.length}/500 caractères
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
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Créer le programme</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Programs Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Programmes à venir
              <span className="ml-2 text-blue-600 dark:text-blue-400">({programs.length})</span>
            </h2>
          </div>

          {programs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun programme</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Aucun programme n'est prévu pour le moment.
                </p>
                {hasAdminOrModeratorRole() && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                  >
                    Créer le premier programme
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program, index) => (
                <div 
                  key={program.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <div className="flex justify-between items-center text-white">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">{formatDate(program.program_day)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatTime(program.hours_start)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Programme
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {program.description || 'Aucune description disponible'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        #{program.id}
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
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
                {hasAdminOrModeratorRole() ? 'Actif' : 'Lecture'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vos permissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;