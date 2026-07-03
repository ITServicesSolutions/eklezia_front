import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getCurrentUser, canManageContent } from '../utils/auth';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../api/events';
import Pagination from '../components/Pagination';
import { Calendar, Clock, Plus, X, Eye, Edit3, Trash2, FileText, AlertTriangle } from 'lucide-react';

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

type EventFilter = 'all' | 'upcoming' | 'ongoing' | 'past';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentFilter, setCurrentFilter] = useState<EventFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [newEvent, setNewEvent] = useState<CreateEventData>({
    title: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

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

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'past';
  };

  const filterEvents = (filter: EventFilter) => {
    setCurrentFilter(filter);

    switch (filter) {
      case 'upcoming':
        setFilteredEvents(
          events.filter(event => getEventStatus(event.start_date, event.end_date) === 'upcoming')
        );
        break;
      case 'ongoing':
        setFilteredEvents(
          events.filter(event => getEventStatus(event.start_date, event.end_date) === 'ongoing')
        );
        break;
      case 'past':
        setFilteredEvents(
          events.filter(event => getEventStatus(event.start_date, event.end_date) === 'past')
        );
        break;
      case 'all':
      default:
        setFilteredEvents(events);
        break;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    initializeUser();
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents(currentFilter);
  }, [events, currentFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter]);

  const hasManagementPermission = canManageContent(currentUser);
  const isAdmin = currentUser?.role?.name === 'admin';

  const handleAddOrUpdate = async (e: React.FormEvent) => {
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
      const eventToSave = {
        ...newEvent,
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(newEvent.end_date).toISOString(),
      };

      if (editingEvent) {
        const updatedEvent = await updateEvent(editingEvent.id, eventToSave);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        Swal.fire({
          title: 'Succès',
          text: 'Événement modifié avec succès',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const createdEvent = await createEvent(eventToSave);
        setEvents(prev => [...prev, createdEvent]);
        Swal.fire({
          title: 'Succès',
          text: 'Événement créé avec succès',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      setNewEvent({
        title: '',
        description: '',
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
      setShowForm(false);
      setEditingEvent(null);
      setError(null);
    } catch (error: any) {
      console.error('Failed to save event', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas les permissions nécessaires');
      } else if (error.response?.status === 422) {
        setError('Données invalides. Vérifiez les champs du formulaire.');
      } else if (error.response?.data?.detail) {
        setError(`Erreur: ${error.response.data.detail}`);
      } else {
        setError(editingEvent ? 'Erreur lors de la modification' : 'Erreur lors de la création');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fc5c7d',
      cancelButtonColor: '#6c63ff',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await deleteEvent(id);
        setEvents(prev => prev.filter(e => e.id !== id));
        Swal.fire({
          title: 'Supprimé',
          text: 'L\'événement a été supprimé',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error('Failed to delete event', error);
        Swal.fire({
          title: 'Erreur',
          text: error.response?.data?.detail || 'Impossible de supprimer l\'événement',
          icon: 'error',
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      start_date: new Date(event.start_date).toISOString().slice(0, 16),
      end_date: new Date(event.end_date).toISOString().slice(0, 16),
    });
    setShowForm(true);
    setError(null);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return '#48bb78';
      case 'upcoming': return '#6c63ff';
      case 'past': return '#718096';
      default: return '#718096';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ongoing': return 'rgba(72, 187, 120, 0.12)';
      case 'upcoming': return 'rgba(108, 99, 255, 0.12)';
      case 'past': return 'rgba(113, 128, 150, 0.12)';
      default: return 'rgba(113, 128, 150, 0.12)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'En cours';
      case 'upcoming': return 'À venir';
      case 'past': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const getEventCountByStatus = (status: EventFilter) => {
    if (status === 'all') return events.length;
    return events.filter(event => getEventStatus(event.start_date, event.end_date) === status).length;
  };

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-neo-text mb-6">Événements</h3>
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
          <h3 className="text-2xl font-bold text-neo-text">Événements</h3>
          <p className="text-sm text-neo-text-secondary">Découvrez tous nos événements à venir et replongez dans les moments passés</p>
        </div>
        {hasManagementPermission && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setNewEvent({
                title: '',
                description: '',
                start_date: new Date().toISOString().slice(0, 16),
                end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
              });
              setShowForm(!showForm);
              setError(null);
            }}
            className="neo-btn-primary"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? 'Annuler' : 'Nouvel Événement'}</span>
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
              <span>{editingEvent ? 'Modifier l\'événement' : 'Nouvel Événement'}</span>
            </h4>
          </div>
          <form onSubmit={handleAddOrUpdate} className="p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neo-text">Titre de l'événement *</label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                className="neo-input"
                placeholder="Donnez un titre à votre événement..."
                required
                maxLength={100}
              />
              <div className="text-right text-xs text-neo-text-secondary">{newEvent.title.length}/100 caractères</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neo-text">Description</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                rows={4}
                className="neo-input resize-none"
                placeholder="Décrivez votre événement en détail..."
                maxLength={500}
              />
              <div className="text-right text-xs text-neo-text-secondary">{newEvent.description.length}/500 caractères</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neo-text">Date et heure de début *</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={newEvent.start_date}
                  onChange={handleInputChange}
                  className="neo-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neo-text">Date et heure de fin *</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={newEvent.end_date}
                  onChange={handleInputChange}
                  className="neo-input"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="neo-btn-primary">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{editingEvent ? 'Modification...' : 'Création...'}</span></>
                ) : (
                  <><Calendar size={18} /><span>{editingEvent ? 'Mettre à jour' : 'Créer l\'événement'}</span></>
                )}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingEvent(null); }} className="neo-btn-ghost">
                <X size={18} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres et liste */}
      <div className="neo-card overflow-hidden">
        <div className="px-5 py-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ borderColor: '#d1d8e0' }}>
          <h2 className="text-lg font-bold text-neo-text">
            {currentFilter === 'all' && 'Tous les événements'}
            {currentFilter === 'upcoming' && 'Événements à venir'}
            {currentFilter === 'ongoing' && 'Événements en cours'}
            {currentFilter === 'past' && 'Événements passés'}
            <span className="text-neo-primary ml-2">({filteredEvents.length})</span>
          </h2>

          <div className="flex gap-2">
            {(['all', 'upcoming', 'ongoing', 'past'] as EventFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => filterEvents(filter)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  currentFilter === filter
                    ? 'text-white'
                    : 'text-neo-text-secondary hover:text-neo-text'
                }`}
                style={
                  currentFilter === filter
                    ? { background: filter === 'ongoing' ? '#48bb78' : filter === 'upcoming' ? '#6c63ff' : filter === 'past' ? '#718096' : '#6c63ff', boxShadow: '3px 3px 6px #c5ccd4, -3px -3px 6px #ffffff' }
                    : {}
                }
              >
                {filter === 'all' ? 'Tous' : filter === 'upcoming' ? 'À venir' : filter === 'ongoing' ? 'En cours' : 'Passés'} ({getEventCountByStatus(filter)})
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-neo-text mb-1">
              {currentFilter === 'all' && 'Aucun événement'}
              {currentFilter === 'upcoming' && 'Aucun événement à venir'}
              {currentFilter === 'ongoing' && 'Aucun événement en cours'}
              {currentFilter === 'past' && 'Aucun événement passé'}
            </h3>
            <p className="text-sm text-neo-text-secondary mb-4">
              {currentFilter === 'all' && "Aucun événement n'est planifié pour le moment."}
              {currentFilter === 'upcoming' && "Aucun événement à venir n'est planifié."}
              {currentFilter === 'ongoing' && "Aucun événement n'est en cours actuellement."}
              {currentFilter === 'past' && 'Aucun événement passé n\'a été trouvé.'}
            </p>
            {hasManagementPermission && currentFilter === 'all' && (
              <button onClick={() => setShowForm(true)} className="neo-btn-primary">
                <Plus size={18} /> Créer le premier événement
              </button>
            )}
            {currentFilter !== 'all' && (
              <button onClick={() => filterEvents('all')} className="neo-btn-ghost">
                Voir tous les événements
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {paginatedEvents.map(event => {
                const status = getEventStatus(event.start_date, event.end_date);
                return (
                  <div key={event.id} className="neo-card-sm p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-neo-text">{event.title}</h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ color: getStatusColor(status), background: getStatusBg(status) }}
                      >
                        {getStatusText(status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neo-text-secondary">{event.description || 'Aucune description'}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Debut</p>
                        <p className="text-neo-text">{formatShortDate(event.start_date)}</p>
                        <p className="text-xs text-neo-text-secondary">{formatTime(event.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Fin</p>
                        <p className="text-neo-text">{formatShortDate(event.end_date)}</p>
                        <p className="text-xs text-neo-text-secondary">{formatTime(event.end_date)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-1">
                      <button onClick={() => setViewingEvent(event)} className="neo-icon-btn" title="Voir">
                        <Eye size={16} className="text-neo-text-secondary" />
                      </button>
                      {hasManagementPermission && (
                        <button onClick={() => handleEditClick(event)} className="neo-icon-btn" title="Modifier">
                          <Edit3 size={16} className="text-neo-primary" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(event.id)} className="neo-icon-btn" title="Supprimer">
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
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Titre</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Début</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Fin</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Statut</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#d1d8e0' }}>
                  {paginatedEvents.map(event => {
                    const status = getEventStatus(event.start_date, event.end_date);
                    return (
                      <tr key={event.id} className="transition-colors hover:bg-black/[0.02]">
                        <td className="px-5 py-4 text-sm font-semibold text-neo-text whitespace-nowrap">{event.title}</td>
                        <td className="px-5 py-4 text-sm text-neo-text-secondary max-w-xs truncate">{event.description || '—'}</td>
                        <td className="px-5 py-4 text-sm text-neo-text-secondary whitespace-nowrap">{formatShortDate(event.start_date)} {formatTime(event.start_date)}</td>
                        <td className="px-5 py-4 text-sm text-neo-text-secondary whitespace-nowrap">{formatShortDate(event.end_date)} {formatTime(event.end_date)}</td>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: getStatusColor(status), background: getStatusBg(status) }}
                          >
                            {getStatusText(status)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button onClick={() => setViewingEvent(event)} className="neo-icon-btn" title="Voir">
                              <Eye size={16} className="text-neo-text-secondary" />
                            </button>
                            {hasManagementPermission && (
                              <button onClick={() => handleEditClick(event)} className="neo-icon-btn" title="Modifier">
                                <Edit3 size={16} className="text-neo-primary" />
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDelete(event.id)} className="neo-icon-btn" title="Supprimer">
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
              totalItems={filteredEvents.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="evenements"
            />
          </>
        )}
      </div>

      {/* Statistiques */}
      <div className="neo-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neo-primary">{getEventCountByStatus('all')}</p>
            <p className="text-sm text-neo-text-secondary">Événements total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-primary">{getEventCountByStatus('upcoming')}</p>
            <p className="text-sm text-neo-text-secondary">À venir</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-success">{getEventCountByStatus('ongoing')}</p>
            <p className="text-sm text-neo-text-secondary">En cours</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-accent">{hasManagementPermission ? 'Actif' : 'Lecture'}</p>
            <p className="text-sm text-neo-text-secondary">Vos permissions</p>
          </div>
        </div>
      </div>

      {/* Modal de visualisation */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setViewingEvent(null)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-bottom transition-all transform sm:my-8 sm:align-middle sm:p-8">
              <div className="neo-card p-0 overflow-hidden relative">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neo-text">{viewingEvent.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getStatusColor(getEventStatus(viewingEvent.start_date, viewingEvent.end_date)), background: getStatusBg(getEventStatus(viewingEvent.start_date, viewingEvent.end_date)) }}
                        >
                          {getStatusText(getEventStatus(viewingEvent.start_date, viewingEvent.end_date))}
                        </span>
                        <span className="text-xs text-neo-text-secondary">ID: #{viewingEvent.id}</span>
                      </div>
                    </div>
                    <button onClick={() => setViewingEvent(null)} className="neo-icon-btn flex-shrink-0">
                      <X size={18} className="text-neo-text-secondary" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neo-text-secondary mb-2">
                      <FileText size={14} /> Description
                    </h4>
                    <div className="neo-inset p-4">
                      <p className="text-sm text-neo-text whitespace-pre-wrap">
                        {viewingEvent.description || 'Aucune description fournie.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-primary">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Début</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatDate(viewingEvent.start_date)}</p>
                      <p className="text-xs text-neo-text-secondary">{formatTime(viewingEvent.start_date)}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-accent">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Fin</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatDate(viewingEvent.end_date)}</p>
                      <p className="text-xs text-neo-text-secondary">{formatTime(viewingEvent.end_date)}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#d1d8e0' }}>
                  <div className="flex items-center gap-1 text-xs text-neo-text-secondary">
                    <Calendar size={14} /> Créé par l'utilisateur #{viewingEvent.user_id}
                  </div>
                  <button onClick={() => setViewingEvent(null)} className="neo-btn-primary">
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

export default Events;
