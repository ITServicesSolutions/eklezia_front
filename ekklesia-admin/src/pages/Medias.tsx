import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMedias, createMedia, deleteMedia } from '../api/medias';
import { getEvents } from '../api/events';
import { getCurrentUser, canManageContent } from '../utils/auth';

export interface Media {
  id: number;
  title?: string;
  type: 'image' | 'video';
  url: string;
  file_path: string;
  event_id: number;
  delete_user_id?: number | null;
  delete_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Event {
  id: number;
  title: string;
}

const Medias: React.FC = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  // Nouveaux états pour le modal d'aperçu
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL;

  if (!backendUrl) {
    throw new Error('Missing VITE_API_BASE_URL (or VITE_API_URL) for backend requests.');
  }

  const fetchMedias = async () => {
    try {
      setLoading(true);
      const data = await getMedias();
      setMedias(data);
    } catch (error) {
      console.error('Failed to fetch medias', error);
      setError('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events', error);
      setError('Erreur lors du chargement des événements');
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    initializeUser();
    fetchMedias();
    fetchEvents();
  }, []);

  const hasManagementPermission = canManageContent(currentUser);

  const handleDelete = async (id: number) => {
    try {
      await deleteMedia(id);
      setMedias(medias.filter(media => media.id !== id));
      setDeletingMediaId(null);
    } catch (error) {
      console.error('Failed to delete media', error);
      setError('Erreur lors de la suppression du média');
      setDeletingMediaId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || eventId <= 0) {
      setError('Veuillez sélectionner un événement et un fichier.');
      return;
    }

    try {
      setIsUploading(true);
      await createMedia(eventId, file);
      setEventId(0);
      setFile(null);
      setShowForm(false);
      setError(null);
      fetchMedias();
    } catch (error: any) {
      console.error('Failed to create media', error);
      setError(error.message || 'Erreur lors de l\'ajout du média');
    } finally {
      setIsUploading(false);
    }
  };

  // Filtrer les médias selon l'événement sélectionné
  const filteredMedias = selectedEventId
    ? medias.filter(m => m.event_id === selectedEventId)
    : medias;

  const stats = {
    total: filteredMedias.length,
    images: filteredMedias.filter(m => m.type === 'image').length,
    videos: filteredMedias.filter(m => m.type === 'video').length,
  };

  // Fonction pour ouvrir le modal d'aperçu
  const openMediaModal = (media: Media) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de la médiathèque...</p>
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
            Médiathèque
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez et organisez vos médias par événement
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl mr-4">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedEventId ? 'Médias dans cet événement' : 'Total des médias'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl mr-4">
                <span className="text-2xl">🖼️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Images</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.images}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl mr-4">
                <span className="text-2xl">🎥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vidéos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.videos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
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
            </div>
          </div>
        )}

        {/* En-tête avec bouton d'ajout et navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            {selectedEventId !== null && (
              <button
                onClick={() => setSelectedEventId(null)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour aux dossiers</span>
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedEventId
                  ? events.find(e => e.id === selectedEventId)?.title || 'Événement'
                  : 'Tous les dossiers'}
                <span className="ml-2 text-blue-600 dark:text-blue-400">({stats.total})</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {selectedEventId
                  ? 'Médias de cet événement'
                  : 'Cliquez sur un dossier pour voir ses médias'}
              </p>
            </div>
          </div>

          {hasManagementPermission && (
            <button
              onClick={() => {
                // Si on ouvre le formulaire et qu'on est dans un événement, pré-sélectionner cet événement
                if (!showForm && selectedEventId) {
                  setEventId(selectedEventId);
                }
                setShowForm(!showForm);
              }}
              className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{showForm ? 'Annuler' : 'Ajouter un média'}</span>
            </button>
          )}
        </div>

        {/* Formulaire d'upload */}
        {showForm && hasManagementPermission && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-white hover:text-gray-200 transition-colors duration-200 group"
                >
                  <svg className="w-6 h-6 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium">
                    Annuler
                  </span>
                </button>

                <h4 className="text-xl font-bold text-white text-center flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Uploader un média</span>
                </h4>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="event_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Événement associé *
                    </label>
                    {events.length > 0 ? (
                      <select
                        id="event_id"
                        value={eventId}
                        onChange={(e) => setEventId(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        required
                      >
                        <option value="">Sélectionnez un événement</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title} (ID: {event.id})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          Aucun événement disponible. Veuillez d'abord{' '}
                          <Link to="/events" className="font-semibold underline">
                            créer un événement
                          </Link>
                          .
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="file_input" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Fichier *
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="file_input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {file ? file.name : 'PNG, JPG, MP4, AVI (MAX. 10MB)'}
                          </p>
                        </div>
                        <input
                          onChange={handleFileChange}
                          className="hidden"
                          id="file_input"
                          type="file"
                          accept="image/*,video/*"
                          required
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUploading || events.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Upload en cours...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Uploader le média</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contenu principal : dossiers ou médias */}
        {selectedEventId === null ? (
          // Vue dossiers (événements)
          events.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun événement</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Créez d'abord un événement pour pouvoir y ajouter des médias.
                </p>
                {hasManagementPermission && (
                  <Link
                    to="/events"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                  >
                    Créer un événement
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {events.map(event => {
                const eventMedias = medias.filter(m => m.event_id === event.id);
                const previewMedias = eventMedias.slice(0, 4);

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  >
                    {/* Badge avec le nombre de médias */}
                    <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{eventMedias.length}</span>
                    </div>

                    {/* Partie supérieure : fond dégradé foncé et icône de dossier */}
                    <div className="h-36 bg-gradient-to-br from-blue-500 to-gray-600 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="relative">
                        {/* Icône de dossier avec effet 3D */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-400 rounded-t-lg transform translate-y-1 blur-sm opacity-70"></div>
                          <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-500 w-20 h-16 rounded-t-lg shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                            <svg className="w-10 h-10 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-2 bg-black bg-opacity-20 blur rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Miniatures en superposition */}
                    {previewMedias.length > 0 && (
                      <div className="absolute left-4 right-4 -mt-8 flex justify-center space-x-2">
                        {previewMedias.map((m, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg transform hover:scale-110 transition-transform duration-200"
                            style={{ transform: `rotate(${idx * 2 - 2}deg)` }}
                          >
                            <img
                              src={`${backendUrl}/${m.file_path.replace('app/', '')}`}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Contenu texte */}
                    <div className="p-6 pt-10 text-center">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1">
                        {event.title}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {eventMedias.length} média{eventMedias.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-opacity duration-700"></div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Vue médias d'un événement spécifique
          filteredMedias.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun média</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Cet événement ne contient pas encore de médias.
                </p>
                {hasManagementPermission && (
                  <button
                    onClick={() => {
                      setEventId(selectedEventId);
                      setShowForm(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                  >
                    Ajouter un média
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedias.map((media) => {
                const mediaUrl = `${backendUrl}/${media.file_path.replace('app/', '')}`;
                const isDeleting = deletingMediaId === media.id;

                return (
                  <div
                    key={media.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group relative"
                  >
                    {isDeleting && (
                      <div className="absolute inset-0 bg-black bg-opacity-80 z-10 flex items-center justify-center rounded-2xl p-4">
                        <div className="text-center text-white">
                          <div className="w-12 h-12 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold mb-2">Confirmer la suppression</h4>
                          <p className="text-sm text-gray-300 mb-4">
                            Êtes-vous sûr de vouloir supprimer ce média ?
                          </p>
                          <div className="flex space-x-3 justify-center">
                            <button
                              onClick={() => handleDelete(media.id)}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Oui, supprimer</span>
                            </button>
                            <button
                              onClick={() => setDeletingMediaId(null)}
                              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative">
                      {media.type === 'image' ? (
                        <img
                          src={mediaUrl}
                          alt={media.title || 'Media'}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Non+Disponible';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                          <div className="text-5xl mb-3">🎥</div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vidéo</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cliquez pour voir</p>
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          media.type === 'image'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {media.type === 'image' ? '🖼️ Image' : '🎥 Vidéo'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-2">
                        {media.title || `Media ${media.id}`}
                      </h5>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Événement: #{media.event_id}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        {/* Bouton Voir remplacé par un déclencheur de modal */}
                        <button
                          onClick={() => openMediaModal(media)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Voir</span>
                        </button>
                        {hasManagementPermission && (
                          <button
                            onClick={() => setDeletingMediaId(media.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Modal d'aperçu des médias */}
        {showMediaModal && selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMediaModal(false)}
          >
            <div
              className="relative max-w-5xl w-full max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton de fermeture */}
              <button
                onClick={() => setShowMediaModal(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Contenu du média */}
              {selectedMedia.type === 'image' ? (
                <img
                  src={`${backendUrl}/${selectedMedia.file_path.replace('app/', '')}`}
                  alt={selectedMedia.title || 'Media'}
                  className="max-w-full max-h-[80vh] mx-auto object-contain rounded-lg"
                />
              ) : (
                <video
                  controls
                  autoPlay={false}
                  className="max-w-full max-h-[80vh] mx-auto rounded-lg"
                >
                  <source
                    src={`${backendUrl}/${selectedMedia.file_path.replace('app/', '')}`}
                    type="video/mp4"
                  />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              )}

              {/* Titre optionnel */}
              {selectedMedia.title && (
                <p className="text-white text-center mt-4 text-lg">{selectedMedia.title}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medias;