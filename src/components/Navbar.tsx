import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, FileText, LogOut, Menu,
  Search, Settings, User, Users, X,
} from 'lucide-react';
import { getUsersMe } from '../api/users';
import { logoutUser } from '../api/auth';
import axiosInstance from '../api/axiosInstance';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface Program  { id: number; program_day: string; description: string }
interface Event    { id: number; title: string; start_date: string; description: string }
interface UserResult { id: number; email: string; role: { name: string } }
interface SearchResults { programs: Program[]; events: Event[]; users: UserResult[] }
interface CurrentUser   { email: string; role: { name: string } }
interface NavbarProps   { onToggleMenu: () => void }

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
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, programs, events, users] = await Promise.all([
          getUsersMe(),
          axiosInstance.get('/api/v1/programs/').then(r => r.data).catch(() => []),
          axiosInstance.get('/api/v1/events/').then(r => r.data).catch(() => []),
          axiosInstance.get('/api/v1/users/').then(r => r.data).catch(() => []),
        ]);
        setUser(userData);
        setAllPrograms(Array.isArray(programs) ? programs : []);
        setAllEvents(Array.isArray(events) ? events : []);
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (err: any) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults({ programs: [], events: [], users: [] });
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = debouncedQuery.toLowerCase();
    setSearchResults({
      programs: allPrograms.filter(p => p.description.toLowerCase().includes(q)),
      events:   allEvents.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)),
      users:    allUsers.filter(u => u.email.toLowerCase().includes(q) || u.role.name.toLowerCase().includes(q)),
    });
    setIsSearching(false);
  }, [debouncedQuery, allPrograms, allEvents, allUsers]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsModalOpen(false); setShowResults(false); setIsDropdownOpen(false); }
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleEsc);
    return () => { document.removeEventListener('mousedown', handleClick); window.removeEventListener('keydown', handleEsc); };
  }, []);

  const handleLogout = async () => { await logoutUser(); navigate('/login'); };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalResults = searchResults.programs.length + searchResults.events.length + searchResults.users.length;
  const getInitials = (email: string) => email.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <>
      <header
        className="sticky top-0 z-50 flex-shrink-0"
        style={{
          background: '#e8ecef',
          boxShadow: '0 4px 12px #c5ccd4',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          {/* Burger mobile */}
          <button
            onClick={onToggleMenu}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }}
          >
            <Menu size={20} className="text-neo-text-secondary" />
          </button>

          {/* Titre */}
          <div className="min-w-0 flex-1 hidden sm:block">
            <p className="text-sm font-bold text-neo-text truncate">
              Eglise Évangélique des Assemblées de Dieu — Temple Universitaire
            </p>
          </div>

          {/* Barre de recherche */}
          <div ref={searchRef} className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neo-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              className="neo-input pl-9 pr-9 py-2 text-sm h-10"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-neo-text-secondary" />
              </button>
            )}

            {/* Dropdown résultats */}
            {showResults && searchQuery.trim() && (
              <div
                className="absolute inset-x-0 top-[calc(100%+8px)] z-50 neo-card py-2 max-h-80 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-neo-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : totalResults === 0 ? (
                  <p className="px-4 py-4 text-sm text-neo-text-secondary text-center">Aucun résultat pour "{searchQuery}"</p>
                ) : (
                  <>
                    {[
                      { label: 'Programmes', icon: <FileText size={14} className="text-neo-primary" />, items: searchResults.programs.map(p => ({ key: `p${p.id}`, title: p.description.substring(0, 50), sub: formatDate(p.program_day) })) },
                      { label: 'Événements', icon: <Calendar size={14} className="text-neo-success" />,  items: searchResults.events.map(e => ({ key: `e${e.id}`, title: e.title, sub: formatDate(e.start_date) })) },
                      { label: 'Utilisateurs', icon: <Users size={14} className="text-neo-accent" />,  items: searchResults.users.map(u => ({ key: `u${u.id}`, title: u.email, sub: u.role.name })) },
                    ].map(group => group.items.length > 0 && (
                      <div key={group.label}>
                        <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-neo-text-secondary">
                          {group.label}
                        </p>
                        {group.items.map(item => (
                          <div key={item.key} className="flex items-start gap-2 px-4 py-2 hover:bg-black/5 cursor-pointer">
                            <span className="mt-0.5 flex-shrink-0">{group.icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-neo-text truncate">{item.title}</p>
                              <p className="text-xs text-neo-text-secondary capitalize">{item.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <button
                      onClick={() => { setShowResults(false); setIsModalOpen(true); }}
                      className="w-full py-2 text-sm text-neo-primary font-medium hover:text-neo-primary-dark transition-colors border-t"
                      style={{ borderColor: '#d1d8e0' }}
                    >
                      Voir tous les résultats
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cloche */}
            <button
              className="relative w-10 h-10 flex items-center justify-center rounded-xl"
              style={{ boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }}
            >
              <Bell size={17} className="text-neo-text-secondary" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-neo-error rounded-full" />
            </button>

            {/* Avatar / dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(p => !p)}
                className="flex items-center gap-2 px-3 h-10 rounded-xl"
                style={{ boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
                >
                  {user?.email ? getInitials(user.email) : <User size={14} />}
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-xs font-semibold text-neo-text truncate max-w-[100px]">
                    {user?.email?.split('@')[0] || 'Compte'}
                  </p>
                  <p className="text-[10px] text-neo-text-secondary capitalize">{user?.role.name || '—'}</p>
                </div>
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 neo-card py-2"
                >
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: '#d1d8e0' }}>
                    <p className="text-xs font-semibold text-neo-text truncate">{user?.email}</p>
                    <p className="text-[10px] text-neo-text-secondary capitalize">{user?.role.name}</p>
                  </div>
                  <button
                    onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neo-text hover:bg-black/5 transition-colors"
                  >
                    <Settings size={15} className="text-neo-text-secondary" /> Paramètres
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors"
                    style={{ color: '#fc5c7d' }}
                  >
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal résultats */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="neo-card w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#d1d8e0' }}>
              <div>
                <h2 className="font-bold text-neo-text">Résultats pour "{searchQuery}"</h2>
                <p className="text-xs text-neo-text-secondary mt-0.5">{totalResults} résultat{totalResults > 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="neo-icon-btn">
                <X size={18} className="text-neo-text-secondary" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 overflow-y-auto flex-1">
              {[
                { label: 'Programmes', icon: <FileText size={14} className="text-neo-primary" />, items: searchResults.programs.map(p => ({ key: p.id, title: p.description, sub: formatDate(p.program_day) })) },
                { label: 'Événements', icon: <Calendar size={14} className="text-neo-success" />,  items: searchResults.events.map(e => ({ key: e.id, title: e.title, sub: formatDate(e.start_date) })) },
                { label: 'Utilisateurs', icon: <Users size={14} className="text-neo-accent" />,  items: searchResults.users.map(u => ({ key: u.id, title: u.email, sub: u.role.name })) },
              ].map(group => (
                <div key={group.label} className="neo-inset rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neo-text mb-3">
                    {group.icon} {group.label} ({group.items.length})
                  </h3>
                  <div className="space-y-2">
                    {group.items.length === 0
                      ? <p className="text-xs italic text-neo-text-secondary">Aucun résultat</p>
                      : group.items.map(item => (
                          <div key={item.key} className="neo-card-sm p-3">
                            <p className="text-sm font-medium text-neo-text">{item.title}</p>
                            <p className="text-xs text-neo-text-secondary capitalize mt-0.5">{item.sub}</p>
                          </div>
                        ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
