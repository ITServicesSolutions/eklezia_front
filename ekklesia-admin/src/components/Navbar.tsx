import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersMe } from '../api/users';
import { logoutUser } from '../api/auth';
import { LogOut, User, Settings, Bell, Search, Calendar, FileText, Users, X } from 'lucide-react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Types
interface Program {
  id: number;
  program_day: string;
  description: string;
}

interface Event {
  id: number;
  title: string;
  start_date: string;
  description: string;
}

interface UserResult {
  id: number;
  email: string;
  role: { name: string };
}

interface SearchResults {
  programs: Program[];
  events: Event[];
  users: UserResult[];
}

interface CurrentUser {
  email: string;
  role: { name: string };
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({ programs: [], events: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 400);

  // États pour stocker toutes les données (chargement unique)
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Récupération utilisateur + chargement de toutes les données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem('ekklesia-token');
        if (!token) throw new Error('Non authentifié.');

        const baseURL = 'https://eklezia.api.it-servicegroup.com';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Récupération utilisateur
        const userData = await getUsersMe();
        setUser(userData);

        // Chargement de toutes les données pour la recherche
        const [programsRes, eventsRes, usersRes] = await Promise.all([
          fetch(`${baseURL}/api/v1/programs/`, { headers }),
          fetch(`${baseURL}/api/v1/events/`, { headers }),
          fetch(`${baseURL}/api/v1/users/`, { headers })
        ]);

        const [programs, events, users] = await Promise.all([
          programsRes.ok ? programsRes.json() : [],
          eventsRes.ok ? eventsRes.json() : [],
          usersRes.ok ? usersRes.json() : []
        ]);

        setAllPrograms(Array.isArray(programs) ? programs : []);
        setAllEvents(Array.isArray(events) ? events : []);
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  // Filtrage local des résultats en fonction de debouncedQuery
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults({ programs: [], events: [], users: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const queryLower = debouncedQuery.toLowerCase();

    // Filtrer les programmes (recherche dans description)
    const filteredPrograms = allPrograms.filter(prog =>
      prog.description.toLowerCase().includes(queryLower)
    );

    // Filtrer les événements (recherche dans title et description)
    const filteredEvents = allEvents.filter(event =>
      event.title.toLowerCase().includes(queryLower) ||
      event.description.toLowerCase().includes(queryLower)
    );

    // Filtrer les utilisateurs (recherche dans email et nom du rôle)
    const filteredUsers = allUsers.filter(userItem =>
      userItem.email.toLowerCase().includes(queryLower) ||
      userItem.role.name.toLowerCase().includes(queryLower)
    );

    setSearchResults({
      programs: filteredPrograms,
      events: filteredEvents,
      users: filteredUsers,
    });
    setIsSearching(false);
  }, [debouncedQuery, allPrograms, allEvents, allUsers]);

  // Fermeture du dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermeture de la modal avec Echap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalResults = searchResults.programs.length + searchResults.events.length + searchResults.users.length;

  const openModal = () => {
    setShowResults(false);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm dark:bg-gray-900/95 dark:border-gray-700">
      {/* Logo + Titre */}
      <div className="flex items-center space-x-3">
        <div className="w-15 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">EEAD-TU</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            Eglise Evangelique des Assemblees de Dieu
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Temple Universitaire</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div ref={searchRef} className="flex-1 max-w-xl mx-4 relative">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher programmes, événements, utilisateurs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-800 dark:border-gray-600 dark:text-white
                     transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400
                     text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults({ programs: [], events: [], users: [] });
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown des résultats */}
        {showResults && (searchQuery.trim() !== '' || totalResults > 0) && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-96 overflow-y-auto z-50">
            {initialLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : isSearching ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : totalResults === 0 && searchQuery.trim() !== '' ? (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                Aucun résultat trouvé pour "{searchQuery}"
              </div>
            ) : (
              <>
                {/* Programmes */}
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50">
                    Programmes ({searchResults.programs.length})
                  </div>
                  {searchResults.programs.length > 0 ? (
                    searchResults.programs.map((program) => (
                      <div
                        key={`prog-${program.id}`}
                        className="flex items-start w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-default"
                      >
                        <FileText size={16} className="mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {program.description.substring(0, 60)}...
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(program.program_day)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">Aucun programme trouvé</div>
                  )}
                </div>

                {/* Événements */}
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50">
                    Événements ({searchResults.events.length})
                  </div>
                  {searchResults.events.length > 0 ? (
                    searchResults.events.map((event) => (
                      <div
                        key={`evt-${event.id}`}
                        className="flex items-start w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-default"
                      >
                        <Calendar size={16} className="mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(event.start_date)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">Aucun événement trouvé</div>
                  )}
                </div>

                {/* Utilisateurs */}
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50">
                    Utilisateurs ({searchResults.users.length})
                  </div>
                  {searchResults.users.length > 0 ? (
                    searchResults.users.map((userItem) => (
                      <div
                        key={`user-${userItem.id}`}
                        className="flex items-start w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-default"
                      >
                        <Users size={16} className="mr-3 mt-0.5 text-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {userItem.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {userItem.role.name}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 italic">Aucun utilisateur trouvé</div>
                  )}
                </div>

                {/* Lien vers la modal */}
                {totalResults > 0 && (
                  <button
                    onClick={openModal}
                    className="w-full mt-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center border-t border-gray-100 dark:border-gray-700"
                  >
                    Voir tous les résultats
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Section utilisateur (inchangée) */}
      <div className="flex items-center space-x-3">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white 
                          hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                {user?.email.split('@')[0]}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role.name}
              </span>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <User size={18} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                            border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{user?.role.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Settings size={16} className="mr-3 text-gray-400" />
                  Paramètres
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 
                           hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} className="mr-3" />
                  Déconnexion
                </button>
              </div>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
            </>
          )}
        </div>
      </div>

      {/* MODAL des résultats complets - centrage renforcé */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div
            ref={modalRef}
            className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden m-auto" // m-auto ajouté
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Résultats pour "{searchQuery}"
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({totalResults} résultat{totalResults > 1 ? 's' : ''})
                </span>
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corps : 3 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Programmes */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center">
                  <FileText size={16} className="mr-2 text-blue-500" />
                  Programmes ({searchResults.programs.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {searchResults.programs.length > 0 ? (
                    searchResults.programs.map((program) => (
                      <div key={program.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {program.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(program.program_day)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Aucun programme trouvé</p>
                  )}
                </div>
              </div>

              {/* Événements */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center">
                  <Calendar size={16} className="mr-2 text-green-500" />
                  Événements ({searchResults.events.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {searchResults.events.length > 0 ? (
                    searchResults.events.map((event) => (
                      <div key={event.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(event.start_date)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Aucun événement trouvé</p>
                  )}
                </div>
              </div>

              {/* Utilisateurs */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center">
                  <Users size={16} className="mr-2 text-purple-500" />
                  Utilisateurs ({searchResults.users.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {searchResults.users.length > 0 ? (
                    searchResults.users.map((userItem) => (
                      <div key={userItem.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{userItem.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                          {userItem.role.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Aucun utilisateur trouvé</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;