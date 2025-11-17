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

  // State pour le formulaire d'ajout - CORRIGÉ pour matcher le backend
  const [newProgram, setNewProgram] = useState<CreateProgramData>({
    program_day: new Date().toISOString().split('T')[0], // format YYYY-MM-DD
    hours_start: '08:00',
    description: ''
  });
  const [showForm, setShowForm] = useState(false);

  // Fonction pour récupérer le rôle depuis le token (comme pour Events)
  const getUserInfoFromToken = () => {
    try {
      const token = localStorage.getItem('ekklesia-token');
      if (!token) {
        console.log('Aucun token trouvé');
        return { role: null, email: null };
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload complet:', payload);
      
      const email = payload.sub || payload.email;
      
      // DÉTERMINER LE RÔLE PAR L'EMAIL
      let role = null;
      if (email) {
        // Si l'email contient "admin" ou est l'email administrateur, on considère admin
        if (email.includes('admin') || email === 'administrateur@itss.com') {
          role = 'admin';
        }
        // Vous pouvez ajouter d'autres règles ici selon vos emails
        else if (email.includes('moderateur') || email.includes('moderator')) {
          role = 'moderator';
        }
      }
      
      console.log('Email détecté:', email);
      console.log('Rôle déduit:', role);
      
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
    // Récupérer les infos utilisateur depuis le token
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
      // Préparer les données pour l'API
      const programToCreate = {
        ...newProgram,
        // S'assurer que hours_start est au format HH:MM:SS
        hours_start: newProgram.hours_start + ':00'
      };
      
      console.log('Données envoyées:', programToCreate);
      
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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour forcer le rechargement si token expiré
  const handleReconnect = () => {
    localStorage.removeItem('ekklesia-token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Programmes</h3>
        
        {/* Bouton conditionnel */}
        {hasAdminOrModeratorRole() && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showForm ? 'Annuler' : 'Ajouter un programme'}
          </button>
        )}
      </div>

      {/* Message d'information sur l'utilisateur */}
      <div className={`mb-4 p-3 rounded ${
        userRole ? 'bg-blue-100 border border-blue-400 text-blue-700' : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
      }`}>
        {userEmail ? (
          <div>
            Utilisateur: <strong>{userEmail}</strong> | 
            Rôle: <strong>{userRole || 'Non déterminé'}</strong> | 
            Permissions: <strong>{hasAdminOrModeratorRole() ? 'Admin/Moderator' : 'Lecture seule'}</strong>
            {!hasAdminOrModeratorRole() && ' - Contactez un administrateur pour modifier les programmes'}
          </div>
        ) : (
          <div>
            <strong>Attention:</strong> Impossible de détecter l'utilisateur. 
            <button 
              onClick={handleReconnect}
              className="ml-2 px-2 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
            >
              Se reconnecter
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          {error.includes('Session expirée') && (
            <button 
              onClick={handleReconnect}
              className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Se reconnecter
            </button>
          )}
        </div>
      )}

      {/* Formulaire conditionnel */}
      {showForm && hasAdminOrModeratorRole() && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Nouveau Programme
          </h4>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="program_day" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Date du programme *
                </label>
                <input
                  type="date"
                  id="program_day"
                  name="program_day"
                  value={newProgram.program_day}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="hours_start" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Heure de début *
                </label>
                <input
                  type="time"
                  id="hours_start"
                  name="hours_start"
                  value={newProgram.hours_start}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newProgram.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Description du programme..."
                maxLength={500}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Créer le programme
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-x-auto">
        {programs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Aucun programme trouvé
          </div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Heure</th>
                <th scope="col" className="px-6 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {new Date(program.program_day).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {program.hours_start}
                  </td>
                  <td className="px-6 py-4">
                    {program.description || 'Aucune description'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Programs;