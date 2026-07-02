import React, { useEffect, useState } from 'react';
import { getRoles, getUsers, getUsersMe, updateUserRole } from '../api/users';
import Pagination from '../components/Pagination';
import { Shield, ShieldCheck, User, Users as UsersIcon, ChevronDown } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, rolesData, currentUserData] = await Promise.all([getUsers(), getRoles(), getUsersMe()]);
        setUsers(usersData);
        setRoles(rolesData);
        setCurrentUser(currentUserData);
      } catch (err) {
        setError('Erreur lors du chargement des donnees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      setUpdatingUser(userId);
      setUpdateError(null);
      const updatedUser = await updateUserRole(userId, newRoleId);
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? updatedUser : user)));
    } catch (err: any) {
      setUpdateError(err.response?.data?.detail || 'Erreur lors de la mise a jour du role');
      console.error('Error updating role:', err);
    } finally {
      setUpdatingUser(null);
    }
  };

  const canModifyRole = (targetUser: User) => {
    if (!currentUser) return false;
    if (currentUser.role.name === 'admin') {
      if (currentUser.id === targetUser.id) return false;
      return true;
    }
    return false;
  };

  const stats = {
    total: users.length,
    admin: users.filter((user) => user.role.name.toLowerCase().includes('admin') && !user.role.name.toLowerCase().includes('superadmin')).length,
    moderator: users.filter((user) => user.role.name.toLowerCase().includes('moderator')).length,
    user: users.filter((user) => user.role.name.toLowerCase().includes('user') && !user.role.name.toLowerCase().includes('admin')).length,
  };

  const getRoleColor = (roleName: string) => {
    const role = roleName.toLowerCase();
    if (role.includes('admin')) return 'text-neo-error';
    if (role.includes('moderator')) return 'text-neo-primary';
    if (role.includes('user')) return 'text-neo-success';
    return 'text-neo-text-secondary';
  };

  const getRoleBadgeBg = (roleName: string) => {
    const role = roleName.toLowerCase();
    if (role.includes('admin')) return 'rgba(252, 92, 125, 0.12)';
    if (role.includes('moderator')) return 'rgba(108, 99, 255, 0.12)';
    if (role.includes('user')) return 'rgba(72, 187, 120, 0.12)';
    return 'rgba(113, 128, 150, 0.12)';
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getUserColor = (userId: number) => {
    const colors = ['#6c63ff', '#48bb78', '#a78bfa', '#fc5c7d', '#3b82f6', '#ed8936', '#f56565', '#38b2ac'];
    return colors[userId % colors.length];
  };

  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-neo-text mb-6">Utilisateurs</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-neo-text mb-6">Utilisateurs</h3>
        <div className="neo-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(252, 92, 125, 0.12)' }}>
              <Shield size={20} className="text-neo-error" />
            </div>
            <div>
              <p className="font-semibold text-neo-text">Erreur</p>
              <p className="text-sm text-neo-text-secondary">{error}</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="neo-btn-primary mt-4">
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neo-text">Utilisateurs</h3>
          <p className="text-sm text-neo-text-secondary">Gere tous les utilisateurs et leurs permissions</p>
        </div>
        {currentUser && (
          <div className="neo-card-sm px-4 py-2 flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: getRoleColor(currentUser.role.name), background: getRoleBadgeBg(currentUser.role.name) }}
            >
              {currentUser.role.name}
            </span>
            <span className="text-sm text-neo-text-secondary">
              Connecte en tant que <strong className="text-neo-text">{currentUser.name || currentUser.email}</strong>
            </span>
          </div>
        )}
      </div>

      {updateError && (
        <div className="neo-card p-4">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-neo-error" />
            <p className="text-sm font-medium text-neo-error">{updateError}</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Utilisateurs', value: stats.total, icon: <UsersIcon size={22} />, color: '#6c63ff' },
          { label: 'Administrateurs', value: stats.admin, icon: <ShieldCheck size={22} />, color: '#fc5c7d' },
          { label: 'Moderateurs', value: stats.moderator, icon: <Shield size={22} />, color: '#a78bfa' },
          { label: 'Utilisateurs', value: stats.user, icon: <User size={22} />, color: '#48bb78' },
        ].map((card) => (
          <div key={card.label} className="neo-card p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`, boxShadow: '4px 4px 8px #c5ccd4, -2px -2px 6px #ffffff' }}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-neo-text-secondary">{card.label}</p>
              <p className="text-2xl font-bold text-neo-text">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="neo-card overflow-hidden">
        <div className="px-5 py-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ borderColor: '#d1d8e0' }}>
          <div>
            <h2 className="text-lg font-bold text-neo-text">Liste des utilisateurs</h2>
            <p className="text-sm text-neo-text-secondary">
              {users.length} utilisateur{users.length !== 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neo-text-secondary">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fc5c7d' }} /> Admin</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#a78bfa' }} /> Moderateurs</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#48bb78' }} /> Utilisateurs</div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <UsersIcon size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-neo-text mb-1">Aucun utilisateur</h3>
            <p className="text-sm text-neo-text-secondary">Aucun utilisateur n'a ete trouve dans le systeme.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="neo-card-sm p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: getUserColor(user.id) }}
                    >
                      {getInitials(user.name || user.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-neo-text truncate">{user.name || 'Non renseigne'}</p>
                        {currentUser && user.id === currentUser.id && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: '#6c63ff', background: 'rgba(108, 99, 255, 0.12)' }}>
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neo-text-secondary break-all">{user.email}</p>
                      <div className="mt-2">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getRoleColor(user.role.name), background: getRoleBadgeBg(user.role.name) }}
                        >
                          {user.role.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 neo-inset p-3">
                    {canModifyRole(user) ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Changer le role</label>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <select
                              value={user.role.id}
                              onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                              disabled={updatingUser === user.id}
                              className="neo-input appearance-none pr-8"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-text-secondary pointer-events-none" />
                          </div>
                          {updatingUser === user.id && (
                            <div className="w-4 h-4 border-2 border-neo-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs italic text-neo-text-secondary">Modification non autorisee</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#d1d8e0' }}>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Utilisateur</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#d1d8e0' }}>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-black/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: getUserColor(user.id) }}
                          >
                            {getInitials(user.name || user.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neo-text truncate">
                              {user.name || 'Non renseigne'}
                              {currentUser && user.id === currentUser.id && (
                                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: '#6c63ff', background: 'rgba(108, 99, 255, 0.12)' }}>
                                  Vous
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-neo-text">{user.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getRoleColor(user.role.name), background: getRoleBadgeBg(user.role.name) }}
                        >
                          {user.role.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {canModifyRole(user) ? (
                          <div className="relative inline-block">
                            <select
                              value={user.role.id}
                              onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                              disabled={updatingUser === user.id}
                              className="neo-input pr-8 py-1.5 text-sm appearance-none"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-text-secondary pointer-events-none" />
                            {updatingUser === user.id && (
                              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neo-primary border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-neo-text-secondary">Modification non autorisee</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="utilisateurs"
            />
          </>
        )}
      </div>

      {/* Stats footer */}
      <div className="neo-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neo-primary">{stats.total}</p>
            <p className="text-sm text-neo-text-secondary">Utilisateurs totaux</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-error">{stats.admin}</p>
            <p className="text-sm text-neo-text-secondary">Administrateurs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-accent">{stats.moderator}</p>
            <p className="text-sm text-neo-text-secondary">Moderateurs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-success">{stats.user}</p>
            <p className="text-sm text-neo-text-secondary">Utilisateurs standard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
