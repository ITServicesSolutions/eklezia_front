import React, { useEffect, useState } from 'react';
import {
  fetchVideos,
  uploadVideo,
  deleteVideo,
  getYouTubeStatus,
  type Video,
  type YouTubeStatus,
} from '../api/videos';
import axiosInstance from '../api/axiosInstance';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('unlisted');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [youtubeStatus, setYoutubeStatus] = useState<YouTubeStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Détection du retour OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setupStatus = params.get('youtube_setup');
    if (setupStatus === 'success') {
      setNotification({ message: 'Compte YouTube connecté avec succès', type: 'success' });
      window.history.replaceState({}, document.title, window.location.pathname);
      loadYoutubeStatus();
    } else if (setupStatus === 'error') {
      setNotification({ message: 'Erreur de connexion YouTube', type: 'error' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    loadVideos();
    loadYoutubeStatus();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await fetchVideos();
      setVideos(data);
    } catch (error) {
      setNotification({ message: 'Erreur de chargement des vidéos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadYoutubeStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await getYouTubeStatus();
      setYoutubeStatus(status);
    } catch (error) {
      console.error('Erreur statut YouTube', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const getYouTubeAuthUrl = async (): Promise<string | null> => {
    try {
      const response = await axiosInstance.get('/api/v1/youtube/setup/auth-url');
      return response.data.authorization_url;
    } catch (error) {
      setNotification({ message: 'Impossible de générer l\'URL d\'autorisation', type: 'error' });
      return null;
    }
  };

  const handleConnectYouTube = async () => {
    const url = await getYouTubeAuthUrl();
    if (url) {
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        url,
        'connect-youtube',
        `width=${width},height=${height},top=${top},left=${left}`
      );
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await uploadVideo({ title, description, privacy_status: privacy, file });
      setNotification({ message: 'Vidéo uploadée avec succès', type: 'success' });
      setShowUploadForm(false);
      setTitle('');
      setDescription('');
      setPrivacy('unlisted');
      setFile(null);
      loadVideos();
    } catch (error) {
      setNotification({ message: "Échec de l'upload", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette vidéo ?')) return;
    try {
      await deleteVideo(id);
      setNotification({ message: 'Vidéo supprimée', type: 'success' });
      loadVideos();
    } catch (error) {
      setNotification({ message: 'Erreur de suppression', type: 'error' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || loadingStatus) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded shadow-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } z-50`}>
          {notification.message}
        </div>
      )}

      {/* Section YouTube Connection */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Compte YouTube maître</h2>
        {youtubeStatus?.connected ? (
          <div className="flex items-center space-x-4">
            {youtubeStatus.channel?.thumbnail && (
              <img
                src={youtubeStatus.channel.thumbnail}
                alt={youtubeStatus.channel.title}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{youtubeStatus.channel?.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {youtubeStatus.channel?.customUrl && `@${youtubeStatus.channel.customUrl}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {parseInt(youtubeStatus.channel?.subscriberCount || '0').toLocaleString()} abonnés
              </p>
            </div>
            <button
              onClick={handleConnectYouTube}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              aria-label="Reconnecter le compte YouTube"
            >
              Reconnecter
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">Aucun compte connecté</p>
            <button
              onClick={handleConnectYouTube}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              aria-label="Connecter un compte YouTube"
            >
              Connecter YouTube
            </button>
          </div>
        )}
      </div>

      {/* En-tête et bouton d'upload */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vidéos</h1>
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          aria-label="Uploader une nouvelle vidéo"
        >
          Uploader une vidéo
        </button>
      </div>

      {/* Formulaire d'upload (modal) */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Uploader une vidéo</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded dark:bg-gray-700"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-gray-700"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Confidentialité</label>
                <select
                  className="w-full p-2 border rounded dark:bg-gray-700"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="unlisted">Non répertorié</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Fichier vidéo</label>
                <input
                  type="file"
                  accept="video/*"
                  required
                  className="w-full"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {uploading ? 'Upload...' : 'Uploader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des vidéos */}
      {videos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucune vidéo.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Miniature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Confidentialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uploadé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uploadé par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {video.thumbnail_url && (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-12 w-20 object-cover rounded cursor-pointer"
                        onClick={() => setSelectedVideo(video)}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{video.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {video.description || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      video.privacy_status === 'public' ? 'bg-green-100 text-green-800' :
                      video.privacy_status === 'private' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {video.privacy_status === 'public' ? 'Public' :
                       video.privacy_status === 'private' ? 'Privé' : 'Non répertorié'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(video.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {video.uploader_email || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="text-blue-600 hover:text-blue-900 mr-3 text-lg"
                      aria-label={`Regarder ${video.title}`}
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-900 mr-3 text-lg"
                      aria-label={`Supprimer ${video.title}`}
                    >
                      🗑
                    </button>
                    <a
                      href={`https://youtu.be/${video.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 text-lg"
                      aria-label={`Voir sur YouTube : ${video.title}`}
                    >
                      ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lecteur vidéo modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-6xl" style={{ height: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold truncate">{selectedVideo.title}</h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Fermer le lecteur"
              >
                &times;
              </button>
            </div>
            <div className="w-full h-full pb-16">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;