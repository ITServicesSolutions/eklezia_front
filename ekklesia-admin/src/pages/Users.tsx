import React, { useEffect, useState } from 'react';
import { getRoles, getUsers, getUsersMe, updateUserRole } from '../api/users';
import Pagination from '../components/Pagination';

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
    if (role.includes('admin')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (role.includes('moderator')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (role.includes('user')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getUserColor = (userId: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'];
    return colors[userId % colors.length];
  };

  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-6 dark:from-gray-900 dark:to-gray-800 sm:py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-6 dark:from-gray-900 dark:to-gray-800 sm:py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Erreur</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="min-h-[44px] rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-6 dark:from-gray-900 dark:to-gray-800 sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl xl:text-5xl">
            Gestion des Utilisateurs
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg xl:text-xl">
            Gere tous les utilisateurs et leurs permissions
          </p>
          {currentUser && (
            <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(currentUser.role.name)}`}>
                {currentUser.role.name}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Connecte en tant que <strong>{currentUser.name || currentUser.email}</strong>
              </span>
            </div>
          )}
        </div>

        {updateError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700 dark:text-red-400">{updateError}</p>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Utilisateurs', value: stats.total, icon: '👥', bg: 'bg-indigo-100 dark:bg-indigo-900' },
            { label: 'Administrateurs', value: stats.admin, icon: '⚡', bg: 'bg-red-100 dark:bg-red-900' },
            { label: 'Moderateurs', value: stats.moderator, icon: '🛡️', bg: 'bg-blue-100 dark:bg-blue-900' },
            { label: 'Utilisateurs', value: stats.user, icon: '👤', bg: 'bg-green-100 dark:bg-green-900' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${card.bg}`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Liste des utilisateurs</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {users.length} utilisateur{users.length !== 1 ? 's' : ''} au total
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="mx-2 h-3 w-3 rounded-full bg-red-500" />
                <span>Admin - </span>
                <div className="mx-2 h-3 w-3 rounded-full bg-blue-500" />
                <span>Moderateur - </span>
                <div className="mx-2 h-3 w-3 rounded-full bg-green-500" />
                <span>Utilisateur</span>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Aucun utilisateur</h3>
              <p className="text-gray-600 dark:text-gray-400">Aucun utilisateur n'a ete trouve dans le systeme.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 p-4 md:hidden">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getUserColor(user.id)}`}>
                        {getInitials(user.name || user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name || 'Non renseigne'}</p>
                          {currentUser && user.id === currentUser.id && (
                            <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              Vous
                            </span>
                          )}
                        </div>
                        <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(user.role.name)}`}>
                            {user.role.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white p-3 dark:bg-gray-800">
                      {canModifyRole(user) ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Changer le role
                          </label>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <select
                              value={user.role.id}
                              onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                              disabled={updatingUser === user.id}
                              className="min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            {updatingUser === user.id && (
                              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-indigo-600" />
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs italic text-gray-500 dark:text-gray-400">Modification non autorisee</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ${getUserColor(user.id)}`}>
                              {getInitials(user.name || user.email)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {user.name || 'Non renseigne'}
                                {currentUser && user.id === currentUser.id && (
                                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    Vous
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-xs text-gray-500 dark:text-gray-400">{user.name ? user.email : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="break-all px-6 py-4 text-sm text-gray-900 dark:text-white">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(user.role.name)}`}>
                            {user.role.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {canModifyRole(user) ? (
                              <>
                                <select
                                  value={user.role.id}
                                  onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                                  disabled={updatingUser === user.id}
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                  {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                                {updatingUser === user.id && (
                                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-indigo-600" />
                                )}
                              </>
                            ) : (
                              <span className="text-xs italic text-gray-500 dark:text-gray-400">Modification non autorisee</span>
                            )}
                          </div>
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

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs totaux</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.admin}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Administrateurs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.moderator}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Moderateurs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.user}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs standard</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
