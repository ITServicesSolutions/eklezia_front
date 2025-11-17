import React, { useState, useEffect } from 'react';
import { getEvents, createEvent } from '../api/events';

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

// Type pour les filtres
type EventFilter = 'all' | 'upcoming' | 'ongoing' | 'past';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentFilter, setCurrentFilter] = useState<EventFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEvent, setNewEvent] = useState<CreateEventData>({
    title: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (error: any) {
      console.error('Failed to fetch events', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des événements');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le statut de l'événement
  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'past';
  };

  // Fonction pour filtrer les événements
  const filterEvents = (filter: EventFilter) => {
    setCurrentFilter(filter);
    
    switch (filter) {
      case 'upcoming':
        setFilteredEvents(events.filter(event => 
          getEventStatus(event.start_date, event.end_date) === 'upcoming'
        ));
        break;
      case 'ongoing':
        setFilteredEvents(events.filter(event => 
          getEventStatus(event.start_date, event.end_date) === 'ongoing'
        ));
        break;
      case 'past':
        setFilteredEvents(events.filter(event => 
          getEventStatus(event.start_date, event.end_date) === 'past'
        ));
        break;
      case 'all':
      default:
        setFilteredEvents(events);
        break;
    }
  };

  useEffect(() => {
    fetchEvents();
    const userInfo = getUserInfoFromToken();
    setUserRole(userInfo.role);
    setUserEmail(userInfo.email);
  }, []);

  // Quand les events changent, on met à jour les events filtrés
  useEffect(() => {
    filterEvents(currentFilter);
  }, [events]);

  const hasAdminOrModeratorRole = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.title.trim()) {
      setError('Le titre de l\'événement est requis');
      return;
    }

    if (!newEvent.start_date || !newEvent.end_date) {
      setError('Les dates de début et de fin sont requises');
      return;
    }

    if (new Date(newEvent.end_date) <= new Date(newEvent.start_date)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    try {
      setIsSubmitting(true);
      const eventToCreate = {
        ...newEvent,
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(newEvent.end_date).toISOString()
      };
      
      const createdEvent = await createEvent(eventToCreate);
      const updatedEvents = [...events, createdEvent];
      setEvents(updatedEvents);
      setNewEvent({
        title: '',
        description: '',
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
      });
      setShowForm(false);
      setError(null);
    } catch (error: any) {
      console.error('Failed to add event', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas les permissions pour créer un événement');
      } else if (error.response?.status === 422) {
        setError('Données invalides. Vérifiez les champs du formulaire.');
      } else if (error.response?.data?.detail) {
        setError(`Erreur: ${error.response.data.detail}`);
      } else {
        setError('Erreur lors de l\'ajout de l\'événement');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
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
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'En cours';
      case 'upcoming': return 'À venir';
      case 'past': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  // Fonction pour obtenir le nombre d'événements par statut
  const getEventCountByStatus = (status: EventFilter) => {
    if (status === 'all') return events.length;
    
    return events.filter(event => 
      getEventStatus(event.start_date, event.end_date) === status
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des événements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Événements
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez tous nos événements à venir et replongez dans les moments passés
          </p>
        </div>

        {/* User Info Banner */}
        <div className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
          userRole 
            ? 'bg-purple-500/10 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200' 
            : 'bg-amber-500/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                userRole ? 'bg-purple-100 dark:bg-purple-900' : 'bg-amber-100 dark:bg-amber-900'
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
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{showForm ? 'Annuler' : 'Nouvel Événement'}</span>
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

        {/* Add Event Form */}
        {showForm && hasAdminOrModeratorRole() && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nouvel Événement</span>
                </h4>
              </div>
              
              <form onSubmit={handleAdd} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Titre de l'événement *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="Donnez un titre à votre événement..."
                    required
                    maxLength={100}
                  />
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {newEvent.title.length}/100 caractères
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-200"
                    placeholder="Décrivez votre événement en détail..."
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {newEvent.description.length}/500 caractères
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Date et heure de début *
                    </label>
                    <input
                      type="datetime-local"
                      id="start_date"
                      name="start_date"
                      value={newEvent.start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Date et heure de fin *
                    </label>
                    <input
                      type="datetime-local"
                      id="end_date"
                      name="end_date"
                      value={newEvent.end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      required
                    />
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
                        <span>Créer l'événement</span>
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

        {/* Events Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentFilter === 'all' && 'Tous les événements'}
              {currentFilter === 'upcoming' && 'Événements à venir'}
              {currentFilter === 'ongoing' && 'Événements en cours'}
              {currentFilter === 'past' && 'Événements passés'}
              <span className="ml-2 text-purple-600 dark:text-purple-400">({filteredEvents.length})</span>
            </h2>
            
            {/* Filtres fonctionnels */}
            <div className="flex space-x-2">
              <button 
                onClick={() => filterEvents('all')}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentFilter === 'all' 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Tous ({getEventCountByStatus('all')})
              </button>
              <button 
                onClick={() => filterEvents('upcoming')}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentFilter === 'upcoming' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                À venir ({getEventCountByStatus('upcoming')})
              </button>
              <button 
                onClick={() => filterEvents('ongoing')}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentFilter === 'ongoing' 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                En cours ({getEventCountByStatus('ongoing')})
              </button>
              <button 
                onClick={() => filterEvents('past')}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentFilter === 'past' 
                    ? 'bg-gray-600 text-white border-gray-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Passés ({getEventCountByStatus('past')})
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentFilter === 'all' && 'Aucun événement'}
                  {currentFilter === 'upcoming' && 'Aucun événement à venir'}
                  {currentFilter === 'ongoing' && 'Aucun événement en cours'}
                  {currentFilter === 'past' && 'Aucun événement passé'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {currentFilter === 'all' && 'Aucun événement n\'est planifié pour le moment.'}
                  {currentFilter === 'upcoming' && 'Aucun événement à venir n\'est planifié.'}
                  {currentFilter === 'ongoing' && 'Aucun événement n\'est en cours actuellement.'}
                  {currentFilter === 'past' && 'Aucun événement passé n\'a été trouvé.'}
                </p>
                {hasAdminOrModeratorRole() && currentFilter === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
                  >
                    Créer le premier événement
                  </button>
                )}
                {currentFilter !== 'all' && (
                  <button
                    onClick={() => filterEvents('all')}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Voir tous les événements
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event.start_date, event.end_date);
                return (
                  <div 
                    key={event.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start p-6 pb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6 pt-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Début</div>
                            <div className="text-sm">
                              {formatDate(event.start_date)} à {formatTime(event.start_date)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                          <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-lg">
                            <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Fin</div>
                            <div className="text-sm">
                              {formatDate(event.end_date)} à {formatTime(event.end_date)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                          {event.description || 'Aucune description disponible pour cet événement.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{event.id}
                        </span>
                        <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm font-medium">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getEventCountByStatus('all')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Événements total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getEventCountByStatus('upcoming')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">À venir</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getEventCountByStatus('ongoing')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">En cours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
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

export default Events;