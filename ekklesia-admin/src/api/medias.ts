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

export const createMedia = async (eventId: number, file: File, title?: string): Promise<any> => {
  const formData = new FormData();
  formData.append('event_id', eventId.toString());
  formData.append('file', file);

  // Ajouter le champ optionnel s'il est fourni
  if (title) formData.append('title', title);

  try {
    const response = await axiosInstance.post('/api/v1/medias/', formData);
    return response.data;
  } catch (error: any) {
    // Extraire le message du serveur si disponible
    const serverMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
    console.error('Error creating media:', error);
    throw new Error(serverMessage || 'Erreur lors de l\'ajout du média');
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