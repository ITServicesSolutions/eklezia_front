import axiosInstance from './axiosInstance';

export interface Media {
  id: number;
  title: string;
  type: string;
  url: string;
}

export const getMedias = async (): Promise<Media[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/medias');
    return response.data;
  } catch (error) {
    console.error('Error fetching medias:', error);
    throw error;
  }
};

export const createMedia = async (data: Omit<Media, 'id'>): Promise<Media> => {
  try {
    const response = await axiosInstance.post('/api/v1/medias', data);
    return response.data;
  } catch (error) {
    console.error('Error creating media:', error);
    throw error;
  }
};

export const deleteMedia = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/medias/${id}`);
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};
