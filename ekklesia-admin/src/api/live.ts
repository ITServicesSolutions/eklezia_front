import axiosInstance from './axiosInstance';

// ============================================
// Types
// ============================================

export interface LiveStream {
  id: number;
  title: string;
  description?: string | null;
  start_date: string;          // ISO date
  duration?: number | null;
  video_url?: string | null;
  youtube_broadcast_id?: string | null;
  youtube_stream_id?: string | null;
  youtube_status?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  end_date?: string | null;
  thumbnail_url?: string | null;
  concurrent_viewers?: number;
  stream_key?: string | null;
  ingestion_url?: string | null;
  user_id: number;
  delete_user_id?: number | null;
  delete_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface YouTubeLiveCreate {
  title: string;
  description: string;
  scheduled_start_time: string;  // ISO format, ex: "2025-03-23T09:00:00Z"
  privacy_status: 'public' | 'private' | 'unlisted';
}

export interface StreamKeyInfo {
  stream_name: string;
  ingestion_address: string;
  backup_ingestion_address?: string;
}

export interface LiveStats {
  concurrent_viewers: number | null;
  total_views: number;
  likes: number;
  comments: number;
  actual_start_time?: string;
  scheduled_start_time?: string;
}

// ============================================
// YouTube OAuth
// ============================================

/**
 * Récupère l'URL d'autorisation Google pour connecter YouTube.
 * @returns L'URL de redirection vers Google.
 */
export const getYouTubeAuthUrl = async (): Promise<string> => {
  const response = await axiosInstance.get('/api/v1/auth/youtube/login');
  return response.data.authorization_url;
};

/**
 * Vérifie si l'utilisateur courant a déjà connecté son compte YouTube.
 * @returns { connected: boolean }
 */
export const checkYouTubeStatus = async (): Promise<{ connected: boolean }> => {
  const response = await axiosInstance.get('/api/v1/auth/youtube/status');
  return response.data;
};

// ============================================
// Live streams
// ============================================

/**
 * Récupère la liste des live streams (soft delete exclus).
 */
export const fetchLiveStreams = async (): Promise<LiveStream[]> => {
  const response = await axiosInstance.get('/api/v1/livestreams/');
  return response.data;
};

/**
 * Récupère un live stream par son ID.
 */
export const fetchLiveStream = async (id: number): Promise<LiveStream> => {
  const response = await axiosInstance.get(`/api/v1/livestreams/${id}`);
  return response.data;
};

/**
 * Crée un nouveau live stream via YouTube.
 * Les paramètres sont passés en query string (conformément à l'API).
 */
export const createYouTubeLive = async (data: YouTubeLiveCreate): Promise<LiveStream> => {
  const params = new URLSearchParams({
    title: data.title,
    description: data.description,
    scheduled_start_time: data.scheduled_start_time,
    privacy_status: data.privacy_status,
  });
  const response = await axiosInstance.post(`/api/v1/livestreams/youtube?${params.toString()}`);
  return response.data;
};

/**
 * Récupère la clé de diffusion et l'URL RTMP pour un live (réservé au créateur).
 */
export const getStreamKey = async (id: number): Promise<StreamKeyInfo> => {
  const response = await axiosInstance.get(`/api/v1/livestreams/${id}/stream-key`);
  return response.data;
};

/**
 * Récupère les statistiques en direct d'un live (concurrent viewers, likes, etc.)
 */
export const getLiveStats = async (id: number): Promise<LiveStats> => {
  const response = await axiosInstance.get(`/api/v1/livestreams/${id}/stats`);
  return response.data;
};

/**
 * Supprime (soft delete) un live stream.
 */
export const deleteLiveStream = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/api/v1/livestreams/${id}`);
  return response.data;
};