import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { getUsersMe } from '../api/users';
import { logoutUser } from '../api/auth';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

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

interface NavbarProps {
  onToggleMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleMenu }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({ programs: [], events: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem('ekklesia-token');
        if (!token) {
          throw new Error('Non authentifie.');
        }

        const baseURL =
          import.meta.env.VITE_API_BASE_URL ??
          import.meta.env.VITE_API_URL;

        if (!baseURL) {
          throw new Error('Missing VITE_API_BASE_URL (or VITE_API_URL) for backend requests.');
        }
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const userData = await getUsersMe();
        setUser(userData);

        const [programsRes, eventsRes, usersRes] = await Promise.all([
          fetch(`${baseURL}/api/v1/programs/`, { headers }),
          fetch(`${baseURL}/api/v1/events/`, { headers }),
          fetch(`${baseURL}/api/v1/users/`, { headers }),
        ]);

        const [programs, events, users] = await Promise.all([
          programsRes.ok ? programsRes.json() : [],
          eventsRes.ok ? eventsRes.json() : [],
          usersRes.ok ? usersRes.json() : [],
        ]);

        setAllPrograms(Array.isArray(programs) ? programs : []);
        setAllEvents(Array.isArray(events) ? events : []);
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults({ programs: [], events: [], users: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const queryLower = debouncedQuery.toLowerCase();

    const filteredPrograms = allPrograms.filter((prog) => prog.description.toLowerCase().includes(queryLower));
    const filteredEvents = allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(queryLower) || event.description.toLowerCase().includes(queryLower)
    );
    const filteredUsers = allUsers.filter(
      (userItem) =>
        userItem.email.toLowerCase().includes(queryLower) || userItem.role.name.toLowerCase().includes(queryLower)
    );

    setSearchResults({
      programs: filteredPrograms,
      events: filteredEvents,
      users: filteredUsers,
    });
    setIsSearching(false);
  }, [debouncedQuery, allPrograms, allEvents, allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        setShowResults(false);
        setIsDropdownOpen(false);
      }
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
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMenu}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 min-w-[3.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 px-3 text-sm font-bold text-white shadow-md sm:text-base">
                  EEAD-TU
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                    Eglise Evangelique des Assemblees de Dieu
                  </h1>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">Temple Universitaire</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
              </button>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <div className="hidden min-w-0 sm:block">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                      {user?.email.split('@')[0] || 'Compte'}
                    </span>
                    <span className="block truncate text-xs text-slate-500 capitalize dark:text-slate-400">
                      {user?.role.name || 'profil'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400 dark:border-slate-900" />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user?.email}</p>
                      <p className="text-xs text-slate-500 capitalize dark:text-slate-400">{user?.role.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Parametres
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} />
                      Deconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div ref={searchRef} className="relative w-full">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Rechercher programmes, evenements, utilisateurs..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults({ programs: [], events: [], users: [] });
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Effacer la recherche"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {showResults && (searchQuery.trim() !== '' || totalResults > 0) && (
              <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                {initialLoading || isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500" />
                  </div>
                ) : totalResults === 0 && searchQuery.trim() !== '' ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Aucun resultat trouve pour "{searchQuery}"
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <div className="bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                        Programmes ({searchResults.programs.length})
                      </div>
                      {searchResults.programs.length > 0 ? (
                        searchResults.programs.map((program) => (
                          <div
                            key={`prog-${program.id}`}
                            className="flex items-start gap-3 px-4 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <FileText size={16} className="mt-0.5 shrink-0 text-blue-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                {program.description.substring(0, 60)}...
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(program.program_day)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm italic text-slate-500 dark:text-slate-400">Aucun programme trouve</div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                        Evenements ({searchResults.events.length})
                      </div>
                      {searchResults.events.length > 0 ? (
                        searchResults.events.map((event) => (
                          <div
                            key={`evt-${event.id}`}
                            className="flex items-start gap-3 px-4 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Calendar size={16} className="mt-0.5 shrink-0 text-green-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(event.start_date)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm italic text-slate-500 dark:text-slate-400">Aucun evenement trouve</div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                        Utilisateurs ({searchResults.users.length})
                      </div>
                      {searchResults.users.length > 0 ? (
                        searchResults.users.map((userItem) => (
                          <div
                            key={`user-${userItem.id}`}
                            className="flex items-start gap-3 px-4 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Users size={16} className="mt-0.5 shrink-0 text-purple-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{userItem.email}</p>
                              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{userItem.role.name}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm italic text-slate-500 dark:text-slate-400">Aucun utilisateur trouve</div>
                      )}
                    </div>

                    {totalResults > 0 && (
                      <button
                        onClick={openModal}
                        className="mt-2 min-h-[44px] w-full border-t border-slate-100 px-4 py-2 text-center text-sm text-blue-600 transition hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        Voir tous les resultats
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-800"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-700">
              <h2 className="min-w-0 text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                <span className="block truncate">Resultats pour "{searchQuery}"</span>
                <span className="mt-1 block text-sm font-normal text-slate-500 dark:text-slate-400">
                  {totalResults} resultat{totalResults > 1 ? 's' : ''}
                </span>
              </h2>
              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Fermer la fenetre"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid max-h-[calc(90vh-88px)] grid-cols-1 gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <FileText size={16} className="text-blue-500" />
                  Programmes ({searchResults.programs.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.programs.length > 0 ? (
                    searchResults.programs.map((program) => (
                      <div key={program.id} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{program.description}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(program.program_day)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">Aucun programme trouve</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Calendar size={16} className="text-green-500" />
                  Evenements ({searchResults.events.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.events.length > 0 ? (
                    searchResults.events.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.description}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(event.start_date)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">Aucun evenement trouve</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Users size={16} className="text-purple-500" />
                  Utilisateurs ({searchResults.users.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.users.length > 0 ? (
                    searchResults.users.map((userItem) => (
                      <div key={userItem.id} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{userItem.email}</p>
                        <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">{userItem.role.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">Aucun utilisateur trouve</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
