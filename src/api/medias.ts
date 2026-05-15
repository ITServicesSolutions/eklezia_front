import axiosInstance from './axiosInstance';

const normalizeMedia = (m: any) => ({
  ...m,
  media_type: m.media_type ?? m.type,
});

export const getMedias = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/medias');
    return response.data.map(normalizeMedia);
  } catch (error) {
    console.error('Error fetching medias:', error);
    throw error;
  }
};

export const createMedia = async (data: { title: string; description: string; file: File; eventId?: number }): Promise<any> => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.eventId !== undefined) formData.append('event_id', data.eventId.toString());

  try {
    const response = await axiosInstance.post('/api/v1/medias/', formData);
    return normalizeMedia(response.data);
  } catch (error: any) {
    const detail = error.response?.data?.detail;
    const serverMessage = Array.isArray(detail)
      ? detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
      : (typeof detail === 'string' ? detail : error.response?.data?.message || error.message);
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