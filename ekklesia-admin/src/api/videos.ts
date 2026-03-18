import axiosInstance from './axiosInstance';

export interface Video {
  id: number;
  title: string;
  description: string | null;
  youtube_id: string;
  thumbnail_url: string | null;
  privacy_status: string;
  uploaded_at: string;
  user_id: number;
  uploader_email?: string;  // Ajouté
}

export interface YouTubeStatus {
  connected: boolean;
  channel?: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    customUrl?: string;
    publishedAt: string;
    videoCount: string;
    subscriberCount: string;
    viewCount: string;
  };
  error?: string;
}

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await axiosInstance.get('/api/v1/videos/');
  return response.data;
};

export const uploadVideo = async (data: {
  title: string;
  description: string;
  privacy_status: string;
  file: File;
}): Promise<Video> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('privacy_status', data.privacy_status);
  formData.append('video_file', data.file);
  const response = await axiosInstance.post('/api/v1/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteVideo = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/api/v1/videos/${id}`);
  return response.data;
};

export const getYouTubeStatus = async (): Promise<YouTubeStatus> => {
  const response = await axiosInstance.get('/api/v1/youtube/setup/status');
  return response.data;
};