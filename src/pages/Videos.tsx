import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Globe, Radio, Square, Trash2, Video, UploadCloud, Eye, X,
  Plus, Film, Activity,
} from 'lucide-react';
import {
  fetchVideos,
  fetchPlatforms,
  createVideo,
  uploadVideoSource,
  createLiveStream,
  deleteVideo,
  startLive,
  stopLive,
  publishVideo,
  extractYoutubeId,
  setupObsStream,
  getStreamInfo,
  type Video as VideoType,
  type PublicationPlatform,
  type StreamInfo,
  type PlatformForward,
} from '../api/videos';
import axiosInstance from '../api/axiosInstance';
import Pagination from '../components/Pagination';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [platforms, setPlatforms] = useState<PublicationPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [videoType, setVideoType] = useState('VOD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('unlisted');
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Publish modal
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [selectedVideoToPublish, setSelectedVideoToPublish] = useState<VideoType | null>(null);
  const [publishDetails, setPublishDetails] = useState<Record<string, string>>({});

  // OBS stream setup modal
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsVideo, setObsVideo] = useState<VideoType | null>(null);
  const [obsRtmpServer, setObsRtmpServer] = useState('rtmp://');
  const [obsHlsBase, setObsHlsBase] = useState('http://');
  const [obsForwards, setObsForwards] = useState<{name:string;rtmp_url:string;stream_key:string}[]>([]);
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [obsLoading, setObsLoading] = useState(false);

  // Player modal
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

  // Search / filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { loadData(); }, []);

  const showToast = (toastTitle: string, icon: 'success' | 'error' = 'success') => {
    Swal.mixin({
      toast: true, position: 'top-end', showConfirmButton: false,
      timer: 3000, timerProgressBar: true,
    }).fire({ icon, title: toastTitle });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const v = await fetchVideos();
      setVideos(v);
      const p = await fetchPlatforms();
      setPlatforms(p);
    } catch {
      showToast('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      let newVideo;
      const youtubeId = youtubeUrl ? extractYoutubeId(youtubeUrl) : undefined;
      if (videoType === 'LIVE' && !youtubeUrl) {
        await createLiveStream({ title, description, start_date: startDate });
      } else {
        newVideo = await createVideo({
          title,
          description,
          privacy_status: 'public',
          video_type: videoType,
          youtube_id: youtubeId ?? undefined,
          video_url: youtubeUrl || undefined,
        });
      }
      if (videoType === 'VOD' && file && newVideo) {
        await uploadVideoSource(newVideo.id, file);
      }
      if ((videoType === 'LIVE' || videoType === 'EXTERNAL') && youtubeUrl && newVideo) {
        // youtube_id déjà envoyé lors de la création
      }
      showToast('Vidéo/Live créé avec succès', 'success');
      setShowCreateForm(false);
      resetForm();
      loadData();
    } catch {
      showToast('Échec de la création', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideoToPublish || !platforms.length) return;
    try {
      await publishVideo(selectedVideoToPublish.id, platforms[0].id, publishDetails);
      showToast('Publication réussie', 'success');
      setShowPublishForm(false);
      setPublishDetails({});
      loadData();
    } catch {
      showToast('Erreur de publication', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?', text: 'Voulez-vous vraiment supprimer cet élément ?',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !', cancelButtonText: 'Annuler',
    });
    if (result.isConfirmed) {
      try {
        await deleteVideo(id);
        showToast('Suppression réussie', 'success');
        loadData();
      } catch {
        Swal.fire('Erreur', 'Erreur de suppression', 'error');
      }
    }
  };

  const openObsModal = async (video: VideoType) => {
    setObsVideo(video);
    setStreamInfo(null);
    setShowObsModal(true);
    try {
      const info = await getStreamInfo(video.id);
      setStreamInfo(info);
      setObsRtmpServer(info.rtmp_ingest_url || 'rtmp://');
      setObsHlsBase(info.hls_url?.replace(/\/[^/]+\.m3u8$/, '') || 'http://');
      setObsForwards(info.platform_forwards || []);
    } catch { /* pas encore configuré */ }
  };

  const handleObsSetup = async () => {
    if (!obsVideo) return;
    setObsLoading(true);
    try {
      const info = await setupObsStream(obsVideo.id, obsRtmpServer, obsHlsBase, obsForwards);
      setStreamInfo(info);
      showToast('Stream OBS configuré !', 'success');
    } catch {
      showToast('Erreur de configuration OBS', 'error');
    } finally {
      setObsLoading(false);
    }
  };

  const addForward = () =>
    setObsForwards(prev => [...prev, { name: '', rtmp_url: '', stream_key: '' }]);

  const updateForward = (i: number, field: keyof PlatformForward, val: string) =>
    setObsForwards(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  const removeForward = (i: number) =>
    setObsForwards(prev => prev.filter((_, idx) => idx !== i));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copié !', 'success');
  };

  const handleStartLive = async (liveId: number) => {
    try {
      await startLive(liveId);
      showToast('Live démarré !', 'success');
      loadData();
    } catch {
      showToast('Erreur au démarrage du live', 'error');
    }
  };

  const handleStopLive = async (liveId: number) => {
    const result = await Swal.fire({
      title: 'Arrêter le live ?', text: 'Voulez-vous arrêter ce live définitivement ?',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, arrêter !', cancelButtonText: 'Annuler',
    });
    if (result.isConfirmed) {
      try {
        await stopLive(liveId);
        showToast('Live arrêté.', 'success');
        loadData();
      } catch {
        Swal.fire('Erreur', 'Erreur arrêt du live', 'error');
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrivacy('public');
    setFile(null);
    setStartDate('');
    setYoutubeUrl('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const openPublishModal = (v: VideoType) => {
    setSelectedVideoToPublish(v);
    let initialDetails: Record<string, string> = v.publications.length > 0
      ? (v.publications[0].details || {})
      : {};
    if (v.video_type === 'VOD' && v.publications.length === 0 && v.sources.length > 0) {
      const localUrl = v.sources[0].url;
      if (localUrl) {
        const urlField = platforms[0]?.config?.fields?.find(
          (f: any) => f.type === 'url' || f.name.includes('url')
        );
        if (urlField) {
          const baseUrl = axiosInstance.defaults.baseURL || '';
          const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          const cleanPath = localUrl.startsWith('/') ? localUrl : `/${localUrl}`;
          initialDetails[urlField.name] = localUrl.startsWith('http')
            ? localUrl
            : `${cleanBase}${cleanPath}`;
        }
      }
    }
    setPublishDetails(initialDetails);
    setShowPublishForm(true);
  };

  // Filtered videos
  const filteredVideos = videos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'ALL' || v.video_type === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / itemsPerPage));
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  // Stats
  const totalLive = videos.filter(v => v.video_type === 'LIVE' && v.status === 'READY').length;
  const totalPublished = videos.filter(v => v.publications.length > 0).length;

  const getTypeGradient = (type: string) => {
    if (type === 'LIVE') return 'linear-gradient(135deg,#fc5c7d,#c0392b)';
    if (type === 'EXTERNAL') return 'linear-gradient(135deg,#a78bfa,#6c63ff)';
    return 'linear-gradient(135deg,#6c63ff,#574fd6)';
  };

  if (loading) {
    return (
      <div className="bg-neo-bg min-h-screen flex items-center justify-center">
        <div className="neo-circle w-16 h-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neo-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neo-bg min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="neo-circle w-12 h-12 flex items-center justify-center">
              <Video size={20} className="text-neo-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neo-text">Vidéos &amp; Directs</h1>
              <p className="text-sm text-neo-text-secondary">Gérez vos contenus VOD et Live</p>
            </div>
          </div>
          <button onClick={() => setShowCreateForm(true)} className="neo-btn-primary">
            <Play size={16} />
            Nouvelle vidéo
          </button>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7"
        >
          {[
            { label: 'Total vidéos', value: videos.length, icon: <Film size={20} />, color: '#6c63ff' },
            { label: 'En direct',    value: totalLive,     icon: <Radio size={20} />, color: '#fc5c7d' },
            { label: 'Publiées',     value: totalPublished, icon: <Globe size={20} />, color: '#48bb78' },
          ].map(stat => (
            <div key={stat.label} className="neo-card-sm p-5 flex items-center gap-4">
              <div
                className="neo-circle w-11 h-11 flex items-center justify-center flex-shrink-0"
                style={{ color: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-neo-text">{stat.value}</p>
                <p className="text-xs text-neo-text-secondary">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filtres / Search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input
            type="text"
            placeholder="Rechercher une vidéo..."
            className="neo-input flex-1"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="neo-input sm:w-52"
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">Tous les types</option>
            <option value="VOD">VOD</option>
            <option value="LIVE">LIVE</option>
            <option value="EXTERNAL">Externe</option>
          </select>
        </motion.div>

        {/* Empty state */}
        {filteredVideos.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Video size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-neo-text mb-2">Aucun contenu trouvé</h3>
            <p className="text-neo-text-secondary text-sm mb-6">
              {searchQuery || filterType !== 'ALL'
                ? 'Aucun résultat pour ces filtres.'
                : 'Commencez par créer votre premier contenu.'}
            </p>
            {!searchQuery && filterType === 'ALL' && (
              <button onClick={() => setShowCreateForm(true)} className="neo-btn-primary">
                <Plus size={16} />
                Créer un contenu
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid cards vidéos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {paginatedVideos.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="neo-card p-4 flex flex-col gap-3"
                >
                  {/* Thumbnail */}
                  <div
                    className="w-full h-36 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center relative"
                    style={{ background: getTypeGradient(v.video_type) }}
                    onClick={() => setSelectedVideo(v)}
                  >
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-white/80">
                        {v.video_type === 'LIVE'
                          ? <Radio size={32} className="text-white" />
                          : <Play size={32} className="text-white" />}
                      </div>
                    )}
                    {/* Badge status */}
                    <div className="absolute top-2 right-2">
                      {v.video_type === 'LIVE' && v.status === 'READY' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      ) : v.video_type === 'LIVE' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                          LIVE
                        </span>
                      ) : v.video_type === 'EXTERNAL' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neo-primary text-white">
                          EXT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                          VOD
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Titre + desc */}
                  <div className="flex-1">
                    <h3 className="font-bold text-neo-text leading-snug line-clamp-1">{v.title}</h3>
                    <p className="text-xs text-neo-text-secondary mt-1 line-clamp-2">
                      {v.description || 'Aucune description.'}
                    </p>
                    <p className="text-xs text-neo-text-secondary mt-1">{formatDate(v.uploaded_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid #c5ccd4' }}>
                    {/* Voir */}
                    <button
                      onClick={() => setSelectedVideo(v)}
                      className="neo-icon-btn text-neo-primary"
                      title="Voir"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Publier */}
                    {v.publications.length === 0 ? (
                      <button
                        onClick={() => openPublishModal(v)}
                        className="neo-icon-btn text-neo-success"
                        title="Publier"
                        style={{ color: '#48bb78' }}
                      >
                        <Globe size={15} />
                      </button>
                    ) : (
                      <div
                        className="neo-icon-btn opacity-40 cursor-default"
                        title="Déjà publié"
                      >
                        <Globe size={15} style={{ color: '#48bb78' }} />
                      </div>
                    )}

                    {/* Config OBS */}
                    {v.video_type === 'LIVE' && (
                      <button
                        onClick={() => openObsModal(v)}
                        className="neo-icon-btn"
                        style={{ color: '#6c63ff' }}
                        title="Configuration OBS"
                      >
                        <Activity size={15} />
                      </button>
                    )}

                    {/* Démarrer live */}
                    {v.video_type === 'LIVE' && v.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStartLive(Number(v.id))}
                        className="neo-icon-btn"
                        style={{ color: '#fc5c7d' }}
                        title="Démarrer le live"
                      >
                        <Radio size={15} />
                      </button>
                    )}

                    {/* Arrêter live */}
                    {v.video_type === 'LIVE' && v.status === 'READY' && (
                      <button
                        onClick={() => handleStopLive(Number(v.id))}
                        className="neo-icon-btn"
                        style={{ color: '#fc5c7d' }}
                        title="Arrêter le live"
                      >
                        <Square size={15} />
                      </button>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Supprimer */}
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="neo-icon-btn"
                      style={{ color: '#fc5c7d' }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVideos.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="contenus"
            />
          </>
        )}

        {/* ===== Modal — Créer vidéo ===== */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              key="create-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(45,55,72,0.45)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="neo-card p-6 w-full max-w-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="neo-circle w-10 h-10 flex items-center justify-center">
                      <Plus size={18} className="text-neo-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-neo-text">Nouveau contenu</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="neo-icon-btn text-neo-text-secondary"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Tabs VOD / LIVE */}
                <div className="flex gap-2 mb-5">
                  {(['VOD', 'LIVE', 'EXTERNAL'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setVideoType(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-0 ${
                        videoType === t ? 'bg-neo-primary text-white' : 'text-neo-text-secondary'
                      }`}
                      style={
                        videoType === t
                          ? { boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }
                          : { boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff', background: '#e8ecef' }
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                      Titre *
                    </label>
                    <input
                      type="text" required
                      className="neo-input"
                      placeholder="Titre du contenu"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      className="neo-inset w-full px-4 py-2.5 text-neo-text text-sm resize-none outline-none"
                      rows={3}
                      placeholder="Description du contenu..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  {videoType !== 'LIVE' && (
                    <div>
                      <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                        Confidentialité
                      </label>
                      <select
                        className="neo-input"
                        value={privacy}
                        onChange={e => setPrivacy(e.target.value)}
                      >
                        <option value="unlisted">Non répertorié</option>
                        <option value="public">Public</option>
                        <option value="private">Privé</option>
                      </select>
                    </div>
                  )}

                  {(videoType === 'LIVE' || videoType === 'EXTERNAL') && (
                    <div>
                      <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                        URL YouTube (live ou vidéo)
                      </label>
                      <input
                        type="url"
                        className="neo-input"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={e => setYoutubeUrl(e.target.value)}
                      />
                      {youtubeUrl && extractYoutubeId(youtubeUrl) && (
                        <p className="mt-1 text-xs text-neo-success">
                          ✓ ID détecté : {extractYoutubeId(youtubeUrl)}
                        </p>
                      )}
                      {youtubeUrl && !extractYoutubeId(youtubeUrl) && (
                        <p className="mt-1 text-xs text-neo-error">URL YouTube invalide</p>
                      )}
                    </div>
                  )}

                  {videoType === 'LIVE' && !youtubeUrl && (
                    <div>
                      <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                        Date de début prévue
                      </label>
                      <input
                        type="datetime-local"
                        className="neo-input"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>
                  )}

                  {videoType === 'VOD' && (
                    <div>
                      <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-2">
                        Fichier vidéo *
                      </label>
                      <label className="neo-inset p-6 flex flex-col items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-transparent hover:border-neo-primary transition-colors">
                        <UploadCloud size={28} className="text-neo-text-secondary" />
                        <span className="text-sm text-neo-text-secondary">
                          {file ? file.name : 'Cliquez pour sélectionner un fichier'}
                        </span>
                        <input
                          type="file" accept="video/*" required
                          className="sr-only"
                          onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="neo-btn-primary flex-1 justify-center"
                    >
                      {creating ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Création...
                        </span>
                      ) : (
                        'Créer'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="neo-btn-ghost"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Modal — Publier ===== */}
        <AnimatePresence>
          {showPublishForm && selectedVideoToPublish && (
            <motion.div
              key="publish-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(45,55,72,0.45)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowPublishForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="neo-card p-6 w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neo-circle w-10 h-10 flex items-center justify-center">
                      <Globe size={18} className="text-neo-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-neo-text">Publier</h2>
                      <p className="text-xs text-neo-text-secondary line-clamp-1">
                        {selectedVideoToPublish.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPublishForm(false)}
                    className="neo-icon-btn text-neo-text-secondary"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-sm text-neo-text-secondary mb-4">
                  Renseignez les informations demandées par la configuration unifiée.
                </p>

                <form onSubmit={handlePublish} className="space-y-4">
                  {platforms.length > 0
                    && platforms[0].config?.fields
                      ?.filter((f: any) =>
                        !f.target_type
                        || f.target_type === 'ALL'
                        || f.target_type === selectedVideoToPublish.video_type
                      )
                      .map((f: any) => (
                        <div key={f.name}>
                          <label className="block text-xs font-semibold text-neo-text-secondary uppercase tracking-wider mb-1">
                            {f.label}
                            {f.target_type && f.target_type !== 'ALL' && (
                              <span className="ml-2 text-neo-primary text-[10px] uppercase font-bold">
                                {f.target_type}
                              </span>
                            )}
                          </label>
                          <input
                            type={f.type || 'text'}
                            placeholder={f.type === 'url' ? 'https://...' : ''}
                            className="neo-input"
                            value={publishDetails[f.name] || ''}
                            onChange={e =>
                              setPublishDetails({ ...publishDetails, [f.name]: e.target.value })
                            }
                          />
                        </div>
                      ))}

                  {(!platforms.length || !platforms[0].config?.fields?.length) && (
                    <div className="neo-inset p-5 text-center rounded-xl">
                      <p className="text-neo-text-secondary text-sm italic">
                        Aucun champ configuré. Allez dans "Configuration Vidéo" pour définir les champs requis.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="neo-btn-primary flex-1 justify-center">
                      Confirmer la publication
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPublishForm(false)}
                      className="neo-btn-ghost"
                    >
                      Fermer
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Modal — Player ===== */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              key="player-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.88)' }}
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="neo-card p-4 w-full max-w-5xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #c5ccd4' }}>
                  <h2 className="text-lg font-bold text-neo-text truncate pr-8 flex items-center gap-2">
                    {selectedVideo.title}
                    <span className="text-xs text-neo-text-secondary font-normal">
                      {selectedVideo.video_type}
                    </span>
                  </h2>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="neo-icon-btn text-neo-text-secondary flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="w-full bg-neo-text aspect-video rounded-xl overflow-hidden flex items-center justify-center">
                  {(() => {
                    const externalUrl =
                      selectedVideo.publications.find(
                        p => p.external_url && p.external_url.trim() !== ''
                      )?.external_url || '';
                    const ytMatch = externalUrl.match(
                      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                    );
                    if (ytMatch) {
                      return (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`}
                          className="w-full h-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={selectedVideo.title}
                        />
                      );
                    }
                    if (externalUrl && /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(externalUrl)) {
                      const fullUrl = externalUrl.startsWith('http')
                        ? externalUrl
                        : (axiosInstance.defaults.baseURL + externalUrl);
                      return (
                        <video className="w-full h-full" controls autoPlay src={fullUrl}>
                          Votre navigateur ne supporte pas la balise vidéo.
                        </video>
                      );
                    }
                    if (externalUrl && (externalUrl.startsWith('http://') || externalUrl.startsWith('https://'))) {
                      return (
                        <iframe
                          src={externalUrl}
                          className="w-full h-full border-0"
                          allowFullScreen
                          title={selectedVideo.title}
                        />
                      );
                    }
                    if (selectedVideo.sources.length > 0) {
                      const lastSource = selectedVideo.sources[selectedVideo.sources.length - 1];
                      if (lastSource.url) {
                        const fullUrl = lastSource.url.startsWith('http')
                          ? lastSource.url
                          : (axiosInstance.defaults.baseURL + lastSource.url);
                        return (
                          <video className="w-full h-full" controls autoPlay src={fullUrl}>
                            Votre navigateur ne supporte pas la balise vidéo.
                          </video>
                        );
                      }
                      if (lastSource.stream_key) {
                        return (
                          <div className="text-white flex flex-col items-center gap-3 p-6">
                            <Radio size={48} className="text-red-400 animate-pulse" />
                            <span className="text-lg font-semibold">LIVE en cours</span>
                            <span className="text-sm text-gray-400">
                              Clé de flux :{' '}
                              <code className="bg-black/40 px-2 py-0.5 rounded text-yellow-400">
                                {lastSource.stream_key}
                              </code>
                            </span>
                            {lastSource.ingestion_url && (
                              <span className="text-xs text-gray-500">
                                Serveur : {lastSource.ingestion_url}
                              </span>
                            )}
                          </div>
                        );
                      }
                    }
                    return (
                      <div className="text-white flex flex-col items-center gap-3 p-6 text-center">
                        <Activity size={40} className="text-gray-500" />
                        <span className="font-bold">Aucun flux disponible</span>
                        <span className="text-xs text-gray-400 max-w-xs">
                          Publiez cette vidéo avec un lien ou terminez l'upload pour activer la lecture.
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Sources info */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedVideo.sources.map(s => (
                    <span key={s.id} className="neo-inset px-3 py-1 text-xs text-neo-text-secondary">
                      Source: {s.source_type} {s.stream_key && `(Clé: ${s.stream_key})`}
                    </span>
                  ))}
                  {selectedVideo.publications.map(pub => (
                    <span key={pub.id} className="neo-inset px-3 py-1 text-xs" style={{ color: '#48bb78' }}>
                      Publié : {pub.external_url?.substring(0, 50)}
                      {(pub.external_url?.length || 0) > 50 ? '...' : ''}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Modale OBS Stream ── */}
      <AnimatePresence>
        {showObsModal && obsVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowObsModal(false)} />
            <motion.div
              className="neo-card relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-neo-text flex items-center gap-2">
                      <Activity size={20} className="text-neo-primary" /> Configuration OBS
                    </h2>
                    <p className="text-xs text-neo-text-secondary mt-1">{obsVideo.title}</p>
                  </div>
                  <button className="neo-icon-btn" onClick={() => setShowObsModal(false)}><X size={18}/></button>
                </div>

                {/* Étape 1 — Serveur RTMP */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neo-text-secondary">1. Serveur de réception</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neo-text mb-1">URL RTMP du serveur *</label>
                      <input className="neo-input text-sm" placeholder="rtmp://mon-serveur.com/live"
                        value={obsRtmpServer} onChange={e => setObsRtmpServer(e.target.value)} />
                      <p className="text-xs text-neo-text-secondary mt-1">nginx-rtmp, SRS, Mux…</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neo-text mb-1">URL de base HLS *</label>
                      <input className="neo-input text-sm" placeholder="http://mon-serveur.com/hls"
                        value={obsHlsBase} onChange={e => setObsHlsBase(e.target.value)} />
                      <p className="text-xs text-neo-text-secondary mt-1">Pour le mobile</p>
                    </div>
                  </div>
                </div>

                {/* Étape 2 — Plateformes */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neo-text-secondary">2. Diffusion multi-plateformes</h3>
                    <button className="neo-btn-ghost text-xs !py-1 !px-3" onClick={addForward}><Plus size={14}/> Ajouter</button>
                  </div>

                  {/* Préréglages rapides */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { name: 'YouTube', rtmp_url: 'rtmp://a.rtmp.youtube.com/live2', stream_key: '' },
                      { name: 'Facebook', rtmp_url: 'rtmps://live-api-s.facebook.com:443/rtmp', stream_key: '' },
                    ].map(preset => (
                      <button key={preset.name}
                        className="neo-btn-ghost text-xs !py-1 !px-3"
                        onClick={() => setObsForwards(p => [...p, { ...preset }])}
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>

                  {obsForwards.map((f, i) => (
                    <div key={i} className="neo-inset p-3 space-y-2 rounded-xl">
                      <div className="flex gap-2">
                        <input className="neo-input text-xs flex-1" placeholder="Nom (YouTube, Facebook…)"
                          value={f.name} onChange={e => updateForward(i, 'name', e.target.value)} />
                        <button className="neo-icon-btn flex-shrink-0" onClick={() => removeForward(i)}><X size={14}/></button>
                      </div>
                      <input className="neo-input text-xs" placeholder="URL RTMP de la plateforme"
                        value={f.rtmp_url} onChange={e => updateForward(i, 'rtmp_url', e.target.value)} />
                      <input className="neo-input text-xs" placeholder="Clé de stream (depuis YouTube Studio, Meta…)"
                        value={f.stream_key} onChange={e => updateForward(i, 'stream_key', e.target.value)} />
                    </div>
                  ))}
                </div>

                <button className="neo-btn-primary w-full justify-center mb-6" onClick={handleObsSetup} disabled={obsLoading}>
                  {obsLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération…</> : <><Activity size={16}/> Générer la clé de stream</>}
                </button>

                {/* Résultat — info OBS */}
                {streamInfo && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neo-text-secondary">3. Configurer OBS Studio</h3>
                    <div className="neo-inset p-4 rounded-xl space-y-3">
                      <p className="text-xs font-semibold text-neo-text-secondary uppercase">Dans OBS → Paramètres → Flux</p>
                      {[
                        { label: 'Service', value: 'Personnalisé' },
                        { label: 'URL du serveur', value: `${streamInfo.rtmp_ingest_url}` },
                        { label: 'Clé de stream', value: streamInfo.rtmp_stream_key ?? '' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-neo-text w-32">{row.label}</span>
                          <code className="flex-1 text-xs bg-neo-primary/10 text-neo-primary px-2 py-1 rounded-lg break-all">{row.value}</code>
                          <button className="neo-icon-btn flex-shrink-0" onClick={() => copyToClipboard(row.value)} title="Copier">
                            <Eye size={13}/>
                          </button>
                        </div>
                      ))}
                    </div>

                    {streamInfo.hls_url && (
                      <div className="neo-inset p-3 rounded-xl">
                        <p className="text-xs font-semibold text-neo-text-secondary uppercase mb-2">URL de lecture HLS (mobile)</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs text-neo-success break-all">{streamInfo.hls_url}</code>
                          <button className="neo-icon-btn flex-shrink-0" onClick={() => copyToClipboard(streamInfo.hls_url!)}><Eye size={13}/></button>
                        </div>
                      </div>
                    )}

                    {(streamInfo.platform_forwards ?? []).length > 0 && (
                      <div className="neo-inset p-3 rounded-xl space-y-2">
                        <p className="text-xs font-semibold text-neo-text-secondary uppercase mb-1">Config nginx-rtmp (push)</p>
                        <pre className="text-xs text-neo-primary overflow-x-auto bg-neo-primary/5 p-2 rounded-lg">
{(streamInfo.platform_forwards ?? []).map((f: any) =>
  `push ${f.rtmp_url}/${f.stream_key};`
).join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Videos;
