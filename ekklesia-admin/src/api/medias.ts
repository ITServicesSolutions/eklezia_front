import axiosInstance from './axiosInstance';

export const getMedias = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/medias');
    return response.data;
  } catch (error) {
    console.error('Error fetching medias:', error);
    throw error;
  }
};
