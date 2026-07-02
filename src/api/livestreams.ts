import axiosInstance from './axiosInstance';

export interface Livestream {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_live: boolean;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  user_id: number;
}

export const fetchLivestreams = async (): Promise<Livestream[]> => {
  const response = await axiosInstance.get('/api/v1/livestreams/');
  return Array.isArray(response.data) ? response.data : [];
};

export const createLivestream = async (data: {
  title: string;
  description: string;
  start_date: string;
  video_url?: string;
}): Promise<Livestream> => {
  let url = `/api/v1/livestreams/?title=${encodeURIComponent(data.title)}&description=${encodeURIComponent(data.description || '')}`;
  if (data.video_url) url += `&video_url=${encodeURIComponent(data.video_url)}`;
  if (data.start_date) url += `&start_date=${encodeURIComponent(data.start_date)}`;
  const response = await axiosInstance.post(url);
  return response.data;
};

export const deleteLivestream = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/livestreams/${id}`);
};

export const startLivestream = async (id: number): Promise<Livestream> => {
  const response = await axiosInstance.post(`/api/v1/livestreams/${id}/start`);
  return response.data;
};

export const stopLivestream = async (id: number): Promise<Livestream> => {
  const response = await axiosInstance.post(`/api/v1/livestreams/${id}/stop`);
  return response.data;
};

export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:v=|v\/|embed\/|shorts\/|live\/|youtu\.be\/|\/v\/|watch\?v=|\?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};
