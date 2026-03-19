import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Play, Globe, Radio, Square, Trash2 } from 'lucide-react';
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
  type Video,
  type PublicationPlatform,
} from '../api/videos';
import axiosInstance from '../api/axiosInstance';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [platforms, setPlatforms] = useState<PublicationPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [videoType, setVideoType] = useState('VOD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('unlisted');
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Publish Modal State
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [selectedVideoToPublish, setSelectedVideoToPublish] = useState<Video | null>(null);
  const [publishDetails, setPublishDetails] = useState<Record<string, string>>({});
  
  // Player Modal State
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (title: string, icon: 'success' | 'error' = 'success') => {
    Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    }).fire({ icon, title });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const v = await fetchVideos();
      setVideos(v);
      const p = await fetchPlatforms();
      setPlatforms(p);
    } catch (error) {
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
      if (videoType === 'LIVE') {
          await createLiveStream({ title, description, start_date: startDate });
      } else {
          newVideo = await createVideo({ title, description, privacy_status: privacy, video_type: videoType });
      }
      
      // If VOD and file present
      if (videoType === 'VOD' && file && newVideo) {
          await uploadVideoSource(newVideo.id, file);
      }
      
      showToast('Vidéo/Live créé avec succès', 'success');
      setShowCreateForm(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast("Échec de la création", 'error');
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
    } catch (error) {
       showToast('Erreur de publication', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment supprimer cet élément ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
        try {
          await deleteVideo(id);
          showToast('Suppression réussie', 'success');
          loadData();
        } catch (error) {
          Swal.fire('Erreur', 'Erreur de suppression', 'error');
        }
    }
  };

  const handleStartLive = async (liveId: number) => {
    try {
        await startLive(liveId);
        showToast('Live démarré !', 'success');
        loadData();
    } catch (e) {
        showToast('Erreur au démarrage du live', 'error');
    }
  };

  const handleStopLive = async (liveId: number) => {
    const result = await Swal.fire({
      title: 'Arrêter le live ?',
      text: "Voulez-vous arrêter ce live définitivement ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, arrêter !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
        try {
            await stopLive(liveId);
            showToast('Live arrêté.', 'success');
            loadData();
        } catch (e) {
            Swal.fire('Erreur', 'Erreur arrêt du live', 'error');
        }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrivacy('unlisted');
    setFile(null);
    setStartDate('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion Vidéos & Lives</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
        >
          + Ajouter un Contenu
        </button>
      </div>

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Nouveau Contenu</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Type de contenu</label>
                <select 
                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    value={videoType} onChange={(e) => setVideoType(e.target.value)}
                >
                   <option value="VOD">Vidéo en différé (VOD Upload)</option>
                   <option value="LIVE">Diffusion en Direct (Live RTMP/HLS)</option>
                   <option value="EXTERNAL">Lien Externe (YouTube, etc.)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Titre</label>
                <input
                  type="text" required
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du contenu..."
                />
              </div>

              {videoType === 'LIVE' && (
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Date de début prévue</label>
                    <input
                      type="datetime-local" required
                      className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
              )}

              {videoType === 'VOD' && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Fichier MP4</label>
                    <input
                      type="file" accept="video/*" required
                      className="w-full p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
              )}

              <div className="flex justify-end mt-8 space-x-3">
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-5 py-2.5 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
                  Annuler
                </button>
                <button type="submit" disabled={creating} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-all">
                  {creating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishForm && selectedVideoToPublish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Publier : {selectedVideoToPublish.title}</h2>
            <p className="text-sm text-gray-500 mb-6">Renseignez les informations demandées par la configuration unifiée.</p>
            <form onSubmit={handlePublish}>
               
               {/* Champs Dynamiques filtrés par type de contenu */}
               {platforms.length > 0 && platforms[0].config?.fields?.filter((f: any) => !f.target_type || f.target_type === 'ALL' || f.target_type === selectedVideoToPublish.video_type).map((f: any) => (
                  <div key={f.name} className="mb-4">
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                        {f.label} 
                        {f.target_type && f.target_type !== 'ALL' && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold">{f.target_type}</span>}
                    </label>
                    <input 
                      type={f.type || 'text'} 
                      placeholder={f.type === 'url' ? 'https://...' : ''}
                      className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                      value={publishDetails[f.name] || ''}
                      onChange={e => setPublishDetails({...publishDetails, [f.name]: e.target.value})}
                    />
                  </div>
               ))}

               {(!platforms.length || !platforms[0].config?.fields?.length) && (
                  <div className="text-center py-6 text-gray-400 italic text-sm border-2 border-dashed rounded-lg mb-4">
                    Aucun champ configuré. Allez dans "Configuration Vidéo" du menu pour définir les champs requis.
                  </div>
               )}

               <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowPublishForm(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Fermer</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Confirmer la publication</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {['Miniature', 'Titre', 'Plateformes', 'Date Création', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {videos.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucun contenu trouvé.</td></tr>
            ) : videos.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-14 w-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center relative cursor-pointer" onClick={() => setSelectedVideo(v)}>
                    {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" className="object-cover w-full h-full"/> : <span className="text-xl">🎬</span>}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 text-white font-bold transition-opacity">PLAY</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{v.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{v.description || 'Sans description.'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                      {v.publications.length === 0 && <span className="text-xs text-gray-400 italic">Non publié</span>}
                      {v.publications.map(pub => (
                          <span key={pub.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded border border-gray-200 dark:border-gray-600" title={pub.status}>
                              {platforms.find(p=>p.id === pub.platform_id)?.name || 'Platform'}
                          </span>
                      ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {formatDate(v.uploaded_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-3">
                      {/* Player */}
                      <button onClick={() => setSelectedVideo(v)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Voir">
                        <Play size={18} />
                      </button>
                      
                       {/* Publish (Caché si déjà publié) */}
                       {v.publications.length === 0 ? (
                          <button 
                            onClick={() => { 
                              setSelectedVideoToPublish(v); 
                              // Pré-remplir avec les détails de la première publication existante
                              let initialDetails = v.publications.length > 0 ? (v.publications[0].details || {}) : {};
                              
                              // Si c'est un VOD sans publication et qu'on a une source locale, pré-remplir l'URL avec le domaine
                              if (v.video_type === 'VOD' && v.publications.length === 0 && v.sources.length > 0) {
                                  let localUrl = v.sources[0].url;
                                  if (localUrl) {
                                      const urlField = platforms[0]?.config?.fields?.find((f: any) => f.type === 'url' || f.name.includes('url'));
                                      if (urlField) {
                                          const baseUrl = axiosInstance.defaults.baseURL || '';
                                          const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                                          const cleanPath = localUrl.startsWith('/') ? localUrl : `/${localUrl}`;
                                          initialDetails[urlField.name] = localUrl.startsWith('http') ? localUrl : `${cleanBase}${cleanPath}`;
                                      }
                                  }
                              }
                              setPublishDetails(initialDetails);
                              setShowPublishForm(true); 
                            }} 
                            className="text-emerald-600 hover:text-emerald-900 transition-colors p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" 
                            title="Publier"
                          >
                            <Globe size={18} />
                          </button>
                       ) : (
                          <div className="p-1.5 text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30" title="Déjà publié">
                            <Globe size={18} className="opacity-40" />
                          </div>
                       )}
                      
                      {/* Live Actions */}
                      {v.video_type === 'LIVE' && v.status === 'DRAFT' && (
                          <button onClick={() => handleStartLive(Number(v.id))} className="text-red-500 hover:text-red-700 transition-colors flex items-center bg-red-50 dark:bg-red-900/20 px-1.5 py-1 rounded" title="Go Live">
                            <Radio size={18} />
                          </button>
                      )}
                      {v.video_type === 'LIVE' && v.status === 'READY' && ( 
                          <button onClick={() => handleStopLive(Number(v.id))} className="text-red-600 hover:text-red-900 transition-colors" title="Arrêter">
                            <Square size={18} />
                          </button>
                      )}

                      {/* Delete */}
                      <button onClick={() => handleDelete(v.id)} className="text-gray-500 hover:text-red-600 transition-colors ml-1" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gray-900 rounded-xl p-4 w-full max-w-5xl shadow-2xl relative border border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white truncate pr-8">{selectedVideo.title} <span className="text-gray-400 text-sm ml-2 font-normal">{selectedVideo.video_type}</span></h2>
              <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-light leading-none">
                &times;
              </button>
            </div>
            
            <div className="w-full bg-black aspect-video rounded-lg overflow-hidden flex items-center justify-center border border-gray-800">
                {(() => {
                    // 1. Chercher l'URL externe depuis les publications
                    const externalUrl = selectedVideo.publications.find(p => p.external_url && p.external_url.trim() !== '')?.external_url || '';
                    
                    // 2. Détecter YouTube
                    const ytMatch = externalUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    
                    if (ytMatch) {
                        return (
                            <iframe 
                              src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`}
                              className="w-full h-full border-0" allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              title={selectedVideo.title}
                            />
                        );
                    }
                    
                    // 3. URL directe (.mp4, .webm, .m3u8) - Utiliser baseURL si relatif
                    if (externalUrl && /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(externalUrl)) {
                        const fullUrl = externalUrl.startsWith('http') ? externalUrl : (axiosInstance.defaults.baseURL + externalUrl);
                        return (
                            <video className="w-full h-full shadow-2xl" controls autoPlay src={fullUrl}>
                                Votre navigateur ne supporte pas la balise vidéo.
                            </video>
                        );
                    }
                    
                    // 4. URL externe générique (iframe)
                    if (externalUrl && (externalUrl.startsWith('http://') || externalUrl.startsWith('https://'))) {
                        return (
                            <iframe 
                              src={externalUrl}
                              className="w-full h-full border-0" allowFullScreen
                              title={selectedVideo.title}
                            />
                        );
                    }

                    // 5. Sources locales (fichier uploadé)
                    if (selectedVideo.sources.length > 0) {
                        const lastSource = selectedVideo.sources[selectedVideo.sources.length - 1];
                        if (lastSource.url) {
                            const fullUrl = lastSource.url.startsWith('http') ? lastSource.url : (axiosInstance.defaults.baseURL + lastSource.url);
                            return (
                                <video className="w-full h-full shadow-2xl" controls autoPlay src={fullUrl}>
                                  Votre navigateur ne supporte pas la balise vidéo.
                                </video>
                            );
                        }
                        // Source RTMP/Stream key
                        if (lastSource.stream_key) {
                            return (
                                <div className="text-gray-400 flex flex-col items-center space-y-3">
                                    <Radio size={48} className="text-red-500 animate-pulse" />
                                    <span className="text-lg font-semibold text-white">LIVE en cours</span>
                                    <span className="text-sm">Clé de flux : <code className="bg-gray-800 px-2 py-1 rounded text-amber-400">{lastSource.stream_key}</code></span>
                                    {lastSource.ingestion_url && <span className="text-xs text-gray-500">Serveur : {lastSource.ingestion_url}</span>}
                                </div>
                            );
                        }
                    }

                    // 6. Aucune source
                    return (
                        <div className="text-gray-500 flex flex-col items-center text-center p-6">
                            <span className="text-4xl mb-2">📹</span>
                            <span className="font-bold text-white">Aucun flux disponible</span>
                            <span className="text-xs mt-2 text-gray-400 max-w-xs">Pour activer la lecture, publiez cette vidéo avec un lien ou terminez l'upload.</span>
                        </div>
                    );
                })()}
            </div>
            
            <div className="mt-4 text-gray-400 text-sm flex flex-wrap gap-2">
                {selectedVideo.sources.map(s => (
                    <span key={s.id} className="bg-gray-800 px-3 py-1 rounded text-xs">Source: {s.source_type} {s.stream_key && `(Clé: ${s.stream_key})`}</span>
                ))}
                {selectedVideo.publications.map(pub => (
                    <span key={pub.id} className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded text-xs">
                        Publié : {pub.external_url?.substring(0, 50)}{(pub.external_url?.length || 0) > 50 ? '...' : ''}
                    </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;