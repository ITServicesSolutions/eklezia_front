import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole, getRoles, getUsersMe } from '../api/users';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, rolesData, currentUserData] = await Promise.all([
          getUsers(),
          getRoles(),
          getUsersMe()
        ]);
        setUsers(usersData);
        setRoles(rolesData);
        setCurrentUser(currentUserData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
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
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? updatedUser : user
        )
      );
      
    } catch (err: any) {
      setUpdateError(err.response?.data?.detail || 'Erreur lors de la mise à jour du rôle');
      console.error('Error updating role:', err);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Vérifie si l'utilisateur peut modifier le rôle
  const canModifyRole = (targetUser: User) => {
    // Si pas d'utilisateur connecté, impossible
    if (!currentUser) return false;
    
    // Le superadmin ne peut pas modifier son propre rôle
    if (currentUser.role.name === 'superadmin' && currentUser.id === targetUser.id) {
      return false;
    }
    
    // L'admin peut modifier tous les rôles sauf le sien et ceux des superadmins
    if (currentUser.role.name === 'admin') {
      // L'admin ne peut pas modifier son propre rôle
      if (currentUser.id === targetUser.id) return false;
      // L'admin ne peut pas modifier les superadmins
      if (targetUser.role.name === 'superadmin') return false;
      return true;
    }
    
    // Les autres rôles ne peuvent pas modifier les rôles
    return false;
  };

  const stats = {
    total: users.length,
    superadmin: users.filter(user => user.role.name.toLowerCase().includes('superadmin')).length,
    admin: users.filter(user => user.role.name.toLowerCase().includes('admin') && !user.role.name.toLowerCase().includes('superadmin')).length,
    moderator: users.filter(user => user.role.name.toLowerCase().includes('moderator')).length,
    user: users.filter(user => user.role.name.toLowerCase().includes('user') && !user.role.name.toLowerCase().includes('admin')).length
  };

  const getRoleColor = (roleName: string) => {
    const role = roleName.toLowerCase();
    if (role.includes('superadmin')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (role.includes('admin')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (role.includes('moderator')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (role.includes('user')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userId: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    return colors[userId % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Erreur</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Gestion des Utilisateurs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez tous les utilisateurs et leurs permissions
          </p>
          {currentUser && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser.role.name)} mr-2`}>
                {currentUser.role.name}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Connecté en tant que <strong>{currentUser.name || currentUser.email}</strong>
              </span>
            </div>
          )}
        </div>

        {updateError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700 dark:text-red-400">{updateError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl mr-4">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Super Admin</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.superadmin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl mr-4">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.admin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl mr-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modérateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.moderator}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl mr-4">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.user}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Liste des utilisateurs
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {users.length} utilisateur{users.length !== 1 ? 's' : ''} au total
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>Super Admin - </span>
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-2"></div>
                  <span>Admin - </span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full mx-2"></div>
                  <span>Modérateur - </span>
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-2"></div>
                  <span>Utilisateur</span>
                </div>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun utilisateur</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucun utilisateur n'a été trouvé dans le système.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr 
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getUserColor(user.id)}`}>
                            {getInitials(user.name || user.email)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || 'Non renseigné'}
                              {currentUser && user.id === currentUser.id && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.name ? user.email : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role.name)}`}>
                          {user.role.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {canModifyRole(user) ? (
                            <>
                              <select
                                value={user.role.id}
                                onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                                disabled={updatingUser === user.id}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                {roles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                              {updatingUser === user.id && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                              Modification non autorisée
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs totaux</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.superadmin}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Super Admin</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.admin}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Administrateurs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.moderator}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Modérateurs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.user}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs standard</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;