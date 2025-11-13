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

export const createMedia = async (eventId: number, file: File, title?: string, type?: string): Promise<any> => {
  const formData = new FormData();
  formData.append('event_id', eventId.toString());
  formData.append('file', file);
  
  // Ajouter les champs optionnels s'ils sont fournis
  if (title) formData.append('title', title);
  if (type) formData.append('type', type);

  try {
    const response = await axiosInstance.post('/api/v1/medias/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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