import axiosInstance from './axiosInstance';

export interface VideoSource {
  id: number;
  source_type: string;
  url?: string;
  stream_key?: string;
  ingestion_url?: string;
}

export interface VideoPublication {
  id: number;
  platform_id: number;
  external_id?: string;
  status: string;
  external_url?: string;
  details?: any;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  video_type: 'VOD' | 'LIVE' | 'EXTERNAL';
  status: 'DRAFT' | 'READY' | 'ERROR';
  thumbnail_url: string | null;
  privacy_status: string;
  duration?: number;
  uploaded_at: string;
  user_id: number;
  uploader_email?: string;
  youtube_id?: string;
  video_url?: string;
  sources: VideoSource[];
  publications: VideoPublication[];
}

export interface LiveStream {
    id: number;
    video_id: number;
    actual_start_date?: string;
    actual_end_date?: string;
    concurrent_viewers: number;
    is_live: boolean;
    is_scheduled: boolean;
    is_ended: boolean;
}

export interface PublicationPlatform {
    id: number;
    name: string;
    config?: any;
}

// APIs
export const fetchVideos = async (): Promise<Video[]> => {
  const response = await axiosInstance.get('/api/v1/videos/');
  return response.data;
};

export const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:v=|v\/|embed\/|shorts\/|live\/|youtu\.be\/|\/v\/|watch\?v=|\?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const createVideo = async (data: {
  title: string;
  description: string;
  privacy_status: string;
  video_type: string;
  status?: string;
  youtube_id?: string;
  video_url?: string;
}): Promise<Video> => {
    const response = await axiosInstance.post('/api/v1/videos/', {
        title: data.title,
        description: data.description,
        privacy_status: data.privacy_status,
        video_type: data.video_type,
        status: data.status || 'DRAFT',
        youtube_id: data.youtube_id || null,
        video_url: data.video_url || null,
    });
    return response.data;
}

export const createLiveStream = async (data: { title: string; description: string; start_date: string }): Promise<any> => {
    // Le backend attend title et description en query params et start_date en body
    const response = await axiosInstance.post(`/api/v1/livestreams/?title=${encodeURIComponent(data.title)}&description=${encodeURIComponent(data.description)}`, {
        start_date: data.start_date
    });
    return response.data;
}

export const uploadVideoSource = async (videoId: number, file: File): Promise<VideoSource> => {
  const formData = new FormData();
  formData.append('video_file', file);
  const response = await axiosInstance.post(`/api/v1/videos/${videoId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteVideo = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/api/v1/videos/${id}`);
  return response.data;
};

export const startLive = async (liveId: number): Promise<LiveStream> => {
    const response = await axiosInstance.post(`/api/v1/livestreams/${liveId}/start`);
    return response.data;
}

export const stopLive = async (liveId: number): Promise<LiveStream> => {
    const response = await axiosInstance.post(`/api/v1/livestreams/${liveId}/stop`);
    return response.data;
}

export const fetchPlatforms = async (): Promise<PublicationPlatform[]> => {
    const response = await axiosInstance.get('/api/v1/publications/platforms');
    return response.data;
}

export const publishVideo = async (videoId: number, platformId: number, details?: any): Promise<VideoPublication> => {
    const response = await axiosInstance.post(`/api/v1/publications/publish?video_id=${videoId}`, {
        platform_id: platformId,
        details: details || {}
    });
    return response.data;
}

export const updatePlatformConfig = async (platformId: number, config: any): Promise<PublicationPlatform> => {
    const response = await axiosInstance.put(`/api/v1/publications/platforms/${platformId}`, { config });
    return response.data;
};

export interface PlatformForward { name: string; rtmp_url: string; stream_key: string; }
export interface StreamInfo {
  id: number; video_id: number;
  rtmp_stream_key?: string; rtmp_ingest_url?: string; hls_url?: string;
  is_live: boolean; is_scheduled: boolean; is_ended: boolean;
  platform_forwards?: PlatformForward[];
}

export const setupObsStream = async (
  videoId: number,
  rtmpServerUrl: string,
  hlsBaseUrl: string,
  platformForwards?: PlatformForward[]
): Promise<StreamInfo> => {
  const response = await axiosInstance.post(`/api/v1/videos/${videoId}/stream/setup`, {
    rtmp_server_url: rtmpServerUrl,
    hls_base_url: hlsBaseUrl,
    platform_forwards: platformForwards ?? [],
  });
  return response.data;
};

export const getStreamInfo = async (videoId: number): Promise<StreamInfo> => {
  const response = await axiosInstance.get(`/api/v1/videos/${videoId}/stream`);
  return response.data;
};