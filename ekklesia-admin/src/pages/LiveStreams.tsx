import React, { useEffect, useState } from 'react';
import {
  fetchLiveStreams,
  checkYouTubeStatus,
  getYouTubeAuthUrl,
  createYouTubeLive,
  getStreamKey,
  deleteLiveStream,
  type LiveStream,
  type YouTubeLiveCreate,
  type StreamKeyInfo,
} from '../api/live';
import { parseDate, formatDateFrench, formatTimeFrench } from '../utils/dateUtils';

const LiveStreams: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('upcoming');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [streamKeys, setStreamKeys] = useState<Record<number, StreamKeyInfo>>({});
  const [formData, setFormData] = useState<YouTubeLiveCreate>({
    title: '',
    description: '',
    scheduled_start_time: new Date().toISOString().slice(0, 16), // datetime-local format
    privacy_status: 'public',
  });

  // Système de notification simple
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-effacement de la notification après 3 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Chargement initial
  useEffect(() => {
    loadData();

    // Vérifier si on vient d'être redirigé après connexion YouTube
    const params = new URLSearchParams(window.location.search);
    if (params.get('youtube_connected') === '1') {
      setNotification({ message: 'Compte YouTube connecté avec succès', type: 'success' });
      // Nettoyer l'URL pour éviter de re-afficher la notification au refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [streamsData, status] = await Promise.all([
        fetchLiveStreams(),
        checkYouTubeStatus(),
      ]);
      setStreams(streamsData);
      setYoutubeConnected(status.connected);
    } catch (error) {
      setNotification({ message: 'Erreur lors du chargement des données', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Connexion YouTube
  const handleConnectYouTube = async () => {
    try {
      const url = await getYouTubeAuthUrl();
      window.location.href = url; // Redirection vers Google
    } catch (error) {
      setNotification({ message: 'Impossible de démarrer la connexion YouTube', type: 'error' });
    }
  };

  // Création d'un live
  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convertir la date locale en ISO avec timezone
      const localDate = new Date(formData.scheduled_start_time);
      const isoString = localDate.toISOString();
      const payload = { ...formData, scheduled_start_time: isoString };
      await createYouTubeLive(payload);
      setNotification({ message: 'Live YouTube créé avec succès', type: 'success' });
      setShowCreateForm(false);
      loadData(); // recharger la liste
    } catch (error) {
      setNotification({ message: 'Échec de la création du live', type: 'error' });
    }
  };

  // Récupérer la clé de stream
  const handleShowStreamKey = async (streamId: number) => {
    if (streamKeys[streamId]) return; // déjà chargé
    try {
      const keyInfo = await getStreamKey(streamId);
      setStreamKeys((prev) => ({ ...prev, [streamId]: keyInfo }));
    } catch (error) {
      setNotification({ message: 'Impossible de récupérer la clé de diffusion', type: 'error' });
    }
  };

  // Suppression
  const handleDelete = async (streamId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce live ?')) return;
    try {
      await deleteLiveStream(streamId);
      setNotification({ message: 'Live supprimé', type: 'success' });
      loadData();
    } catch (error) {
      setNotification({ message: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  // Filtrer les streams selon l'onglet
  const now = new Date();
  const upcoming = streams.filter(
    (s) => !s.actual_start_date && parseDate(s.start_date)! > now
  );
  const liveNow = streams.filter(
    (s) => s.actual_start_date && !s.actual_end_date
  );
  const past = streams.filter(
    (s) => s.actual_end_date || parseDate(s.start_date)! < now
  );

  const filteredStreams =
    activeTab === 'upcoming' ? upcoming : activeTab === 'live' ? liveNow : past;

  // Fonction d'affichage sécurisée d'une date
  const formatDateSafe = (dateStr: string | null | undefined, formatFn: (d: Date) => string): string => {
    if (!dateStr) return '';
    const d = parseDate(dateStr);
    return d ? formatFn(d) : 'Date invalide';
  };

  if (loading) {
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
        <div
          className={`fixed top-4 right-4 p-4 rounded shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } z-50 transition-opacity duration-300`}
        >
          {notification.message}
        </div>
      )}

      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Lives
        </h1>
        <div className="space-x-4">
          {!youtubeConnected ? (
            <button
              onClick={handleConnectYouTube}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Connecter YouTube
            </button>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Nouveau live YouTube
            </button>
          )}
        </div>
      </div>

      {/* Formulaire de création (modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Créer un live YouTube</h2>
            <form onSubmit={handleCreateLive}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date et heure de début</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={formData.scheduled_start_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduled_start_time: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Confidentialité</label>
                <select
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={formData.privacy_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      privacy_status: e.target.value as any,
                    })
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="unlisted">Non répertorié</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'upcoming', label: 'À venir' },
            { key: 'live', label: 'En direct' },
            { key: 'past', label: 'Passés' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {tab.label} ({tab.key === 'upcoming' ? upcoming.length : tab.key === 'live' ? liveNow.length : past.length})
            </button>
          ))}
        </nav>
      </div>

      {/* Liste des streams */}
      <div className="grid gap-6">
        {filteredStreams.map((stream) => (
          <div
            key={stream.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{stream.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {stream.description}
                </p>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    Début prévu :{' '}
                    {formatDateSafe(stream.start_date, (d) =>
                      `${formatDateFrench(d)} à ${formatTimeFrench(d)}`
                    )}
                  </p>
                  {stream.actual_start_date && (
                    <p>
                      Début réel : {formatDateSafe(stream.actual_start_date, formatTimeFrench)}
                    </p>
                  )}
                  {stream.youtube_status && (
                    <p className="capitalize">Statut YouTube : {stream.youtube_status}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {/* Bouton pour afficher la clé de stream */}
                {stream.stream_key && (
                  <button
                    onClick={() => handleShowStreamKey(stream.id)}
                    className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"
                  >
                    Clé de diffusion
                  </button>
                )}
                <button
                  onClick={() => handleDelete(stream.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            </div>

            {/* Affichage de la clé de stream */}
            {streamKeys[stream.id] && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="font-mono text-sm break-all">
                  <span className="font-semibold">URL RTMP :</span>{' '}
                  {streamKeys[stream.id].ingestion_address}
                </p>
                <p className="font-mono text-sm break-all mt-1">
                  <span className="font-semibold">Clé :</span>{' '}
                  {streamKeys[stream.id].stream_name}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${streamKeys[stream.id].ingestion_address}/${streamKeys[stream.id].stream_name}`
                    );
                    setNotification({ message: 'Copié !', type: 'success' });
                  }}
                  className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Copier l'URL complète
                </button>
              </div>
            )}

            {/* Lien vers YouTube */}
            {stream.video_url && (
              <a
                href={stream.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 hover:underline"
              >
                Voir sur YouTube →
              </a>
            )}
          </div>
        ))}

        {filteredStreams.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Aucun live dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreams;