import axiosInstance from './axiosInstance';

export interface FeedItem {
  type: 'verse' | 'motivation' | 'live' | 'announcement';
  id: number;
  date: string;
  data: Record<string, any>;
}

export interface VerseOfDay {
  id: number;
  content_type: 'verse' | 'video' | 'message';
  text?: string;
  reference?: string;
  video_url?: string;
  date: string;
  created_at: string;
}

export interface Motivation {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const getFeed = async (limit = 20): Promise<FeedItem[]> => {
  const res = await axiosInstance.get(`/api/v1/feed/?limit=${limit}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getTodayVerse = async (): Promise<VerseOfDay | null> => {
  const res = await axiosInstance.get('/api/v1/verse-of-day/today');
  return res.data || null;
};

export const getAllVerses = async (): Promise<VerseOfDay[]> => {
  const res = await axiosInstance.get('/api/v1/verse-of-day/');
  return Array.isArray(res.data) ? res.data : [];
};

export const createOrUpdateVerse = async (data: {
  content_type?: string;
  text?: string;
  reference?: string;
  video_url?: string;
  verse_date?: string;
}): Promise<VerseOfDay> => {
  const params = new URLSearchParams();
  if (data.content_type) params.append('content_type', data.content_type);
  if (data.text)         params.append('text', data.text);
  if (data.reference)    params.append('reference', data.reference);
  if (data.video_url)    params.append('video_url', data.video_url);
  if (data.verse_date)   params.append('verse_date', data.verse_date);
  const res = await axiosInstance.post(`/api/v1/verse-of-day/?${params.toString()}`);
  return res.data;
};

export const deleteVerse = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/verse-of-day/${id}`);
};

export const getAllMotivations = async (): Promise<Motivation[]> => {
  const res = await axiosInstance.get('/api/v1/motivations/all');
  return Array.isArray(res.data) ? res.data : [];
};

export const getPublicMotivations = async (): Promise<Motivation[]> => {
  const res = await axiosInstance.get('/api/v1/motivations/');
  return Array.isArray(res.data) ? res.data : [];
};

export const createMotivation = async (data: {
  title: string;
  content: string;
  image_url?: string;
}): Promise<Motivation> => {
  let url = `/api/v1/motivations/?title=${encodeURIComponent(data.title)}&content=${encodeURIComponent(data.content)}`;
  if (data.image_url) url += `&image_url=${encodeURIComponent(data.image_url)}`;
  const res = await axiosInstance.post(url);
  return res.data;
};

export const updateMotivation = async (
  id: number,
  data: { title: string; content: string; image_url?: string; is_published?: boolean }
): Promise<Motivation> => {
  let url = `/api/v1/motivations/${id}?title=${encodeURIComponent(data.title)}&content=${encodeURIComponent(data.content)}`;
  if (data.image_url) url += `&image_url=${encodeURIComponent(data.image_url)}`;
  if (data.is_published !== undefined) url += `&is_published=${data.is_published}`;
  const res = await axiosInstance.put(url);
  return res.data;
};

export const deleteMotivation = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/motivations/${id}`);
};
