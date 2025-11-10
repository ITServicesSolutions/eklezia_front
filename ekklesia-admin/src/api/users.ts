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
