import axiosInstance from './axiosInstance';

export const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUsersMe = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: number, roleId: number) => {
  try {
    const response = await axiosInstance.put(`/api/v1/users/${userId}/role?role_id=${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getRoles = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export interface UserUpdateData {
  name?: string;
  phone_number?: string;
}

export const updateCurrentUser = async (data: UserUpdateData) => {
  const response = await axiosInstance.patch('/api/v1/users/me', data);
  return response.data;
};