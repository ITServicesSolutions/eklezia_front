import { getUsersMe } from '../api/users';

export interface User {
  id: number;
  email: string;
  name: string;
  role: {
    id: number;
    name: string;
  };
}

let currentUser: User | null = null;

export const getCurrentUser = async (): Promise<User | null> => {
  if (currentUser) {
    return currentUser;
  }

  try {
    const user = await getUsersMe();
    currentUser = user;
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

export const hasPermission = (user: User | null, requiredRole: string): boolean => {
  if (!user) return false;
  
  const userRole = user.role.name.toLowerCase();
  const required = requiredRole.toLowerCase();

  const roleHierarchy = {
    'superadmin': ['superadmin', 'admin', 'moderator', 'user'],
    'admin': ['admin', 'moderator', 'user'],
    'moderator': ['moderator', 'user'],
    'user': ['user']
  };

  const allowedRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || ['user'];
  return allowedRoles.includes(required);
};

export const canManageContent = (user: User | null): boolean => {
  return hasPermission(user, 'moderator');
};

export const canManageUsers = (user: User | null): boolean => {
  return hasPermission(user, 'admin');
};

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role.name.toLowerCase() === 'superadmin';
};

export const clearUserCache = (): void => {
  currentUser = null;
};