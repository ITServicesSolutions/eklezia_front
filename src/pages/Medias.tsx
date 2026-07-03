import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getCurrentUser, canManageContent } from '../utils/auth';
import { getMedias, createMedia, deleteMedia } from '../api/medias';
import Pagination from '../components/Pagination';
import { Film, Plus, X, Eye, Trash2, FileText, AlertTriangle, Download, Image, Video } from 'lucide-react';

export interface Media {
  id: number;
  title?: string;
  description?: string;
  file_path: string;
  type: string;
  media_type?: string;
  file_size?: number;
  user_id?: number;
  event_id?: number;
  created_at: string;
  updated_at?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Medias: React.FC = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<Media | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [newMedia, setNewMedia] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  const fetchMedias = async () => {
    try {
      setLoading(true);
      const data = await getMedias();
      setMedias(data);
    } catch (error: any) {
      console.error('Failed to fetch medias', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des médias');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    initializeUser();
    fetchMedias();
  }, []);

  const hasManagementPermission = canManageContent(currentUser);
  const isAdmin = currentUser?.role?.name === 'admin';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMedia(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewMedia(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMedia.title.trim()) {
      setError('Le titre du média est requis');
      return;
    }

    if (!newMedia.file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newMedia.title);
      formData.append('description', newMedia.description);
      formData.append('file', newMedia.file);

      const createdMedia = await createMedia({
        title: newMedia.title,
        description: newMedia.description,
        file: newMedia.file,
      });
      setMedias(prev => [createdMedia, ...prev]);

      setNewMedia({ title: '', description: '', file: null });
      setShowForm(false);
      setError(null);

      Swal.fire({
        title: 'Succès',
        text: 'Média ajouté avec succès',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Failed to create media', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas les permissions nécessaires');
      } else if (error.response?.status === 413) {
        setError('Le fichier est trop volumineux');
      } else {
        setError(error.message || 'Erreur lors de l\'ajout du média');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de vouloir supprimer ce média ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fc5c7d',
      cancelButtonColor: '#6c63ff',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await deleteMedia(id);
        setMedias(prev => prev.filter(m => m.id !== id));
        Swal.fire({
          title: 'Supprimé',
          text: 'Le média a été supprimé',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error('Failed to delete media', error);
        Swal.fire({
          title: 'Erreur',
          text: error.response?.data?.detail || 'Impossible de supprimer le média',
          icon: 'error',
        });
      }
    }
  };

  const handleReconnect = () => {
    localStorage.removeItem('ekklesia-token');
    window.location.href = '/login';
  };



  const getMediaTypeLabel = (mediaType: string) => {
    const type = mediaType?.toLowerCase() || '';
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif') || type.includes('webp')) {
      return 'Image';
    }
    if (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi') || type.includes('webm')) {
      return 'Vidéo';
    }
    return 'Fichier';
  };

  const getMediaTypeColor = (mediaType: string) => {
    const type = mediaType?.toLowerCase() || '';
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif') || type.includes('webp')) {
      return '#48bb78';
    }
    if (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi') || type.includes('webm')) {
      return '#6c63ff';
    }
    return '#718096';
  };

  const getMediaTypeBg = (mediaType: string) => {
    const type = mediaType?.toLowerCase() || '';
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif') || type.includes('webp')) {
      return 'rgba(72, 187, 120, 0.12)';
    }
    if (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi') || type.includes('webm')) {
      return 'rgba(108, 99, 255, 0.12)';
    }
    return 'rgba(113, 128, 150, 0.12)';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMediaUrl = (media: Media) => {
    if (media.file_path.startsWith('http')) return media.file_path;
    return `${API_BASE}/uploads/medias/${media.file_path.split('/').pop()}`;
  };

  const totalPages = Math.max(1, Math.ceil(medias.length / itemsPerPage));
  const paginatedMedias = medias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-neo-text mb-6">Médias</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-neo-text">Médias</h3>
          <p className="text-sm text-neo-text-secondary">Gérez les images et vidéos de votre bibliothèque multimédia</p>
        </div>
        {hasManagementPermission && (
          <button
            onClick={() => {
              setNewMedia({ title: '', description: '', file: null });
              setShowForm(!showForm);
              setError(null);
            }}
            className="neo-btn-primary"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? 'Annuler' : 'Ajouter un Média'}</span>
          </button>
        )}
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="neo-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-neo-error" />
              <span className="font-medium text-neo-error">{error}</span>
            </div>
            {error.includes('Session expirée') && (
              <button onClick={handleReconnect} className="neo-btn-primary text-sm !py-1.5 !px-3">
                Se reconnecter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && hasManagementPermission && (
        <div className="neo-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: '#d1d8e0' }}>
            <h4 className="text-lg font-bold text-neo-text flex items-center gap-2">
              <Plus size={20} className="text-neo-primary" />
              <span>Ajouter un média</span>
            </h4>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neo-text">Titre du média *</label>
              <input
                type="text"
                name="title"
                value={newMedia.title}
                onChange={handleInputChange}
                className="neo-input"
                placeholder="Donnez un titre à votre média..."
                required
                maxLength={100}
              />
              <div className="text-right text-xs text-neo-text-secondary">{newMedia.title.length}/100 caractères</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neo-text">Description</label>
              <textarea
                name="description"
                value={newMedia.description}
                onChange={handleInputChange}
                rows={3}
                className="neo-input resize-none"
                placeholder="Décrivez votre média..."
                maxLength={500}
              />
              <div className="text-right text-xs text-neo-text-secondary">{newMedia.description.length}/500 caractères</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neo-text">Fichier *</label>
              <div className="neo-inset p-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-neo-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-neo-primary file:text-white hover:file:bg-neo-primary-dark cursor-pointer"
                  accept="image/*,video/*"
                  required
                />
                {newMedia.file && (
                  <p className="mt-2 text-xs text-neo-text-secondary">
                    Fichier sélectionné: {newMedia.file.name} ({formatFileSize(newMedia.file.size)})
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="neo-btn-primary">
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Ajout en cours...</span></>
                ) : (
                  <><Plus size={18} /><span>Ajouter le média</span></>
                )}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="neo-btn-ghost">
                <X size={18} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="neo-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#d1d8e0' }}>
          <h2 className="text-lg font-bold text-neo-text">
            Bibliothèque <span className="text-neo-primary">({medias.length})</span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-neo-text-secondary">
            <div className="flex items-center gap-1"><Video size={14} className="text-neo-primary" /> Vidéos</div>
            <div className="flex items-center gap-1"><Image size={14} className="text-neo-success" /> Images</div>
          </div>
        </div>

        {medias.length === 0 ? (
          <div className="py-16 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Film size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-neo-text mb-1">Aucun média</h3>
            <p className="text-sm text-neo-text-secondary mb-4">Aucun média n'a été ajouté pour le moment.</p>
            {hasManagementPermission && (
              <button onClick={() => setShowForm(true)} className="neo-btn-primary">
                <Plus size={18} /> Ajouter le premier média
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {paginatedMedias.map(media => (
                <div key={media.id} className="neo-card-sm p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ boxShadow: 'inset 2px 2px 5px #c5ccd4, inset -2px -2px 5px #ffffff' }}
                    >
                      {media.media_type?.toLowerCase().includes('image') || media.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={getMediaUrl(media)} alt={media.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(108, 99, 255, 0.1)' }}>
                          <Video size={24} className="text-neo-primary" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-neo-text truncate">{media.title}</h3>
                      <p className="text-xs text-neo-text-secondary mt-0.5">{media.description || 'Aucune description'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: getMediaTypeColor(media.media_type ?? ''), background: getMediaTypeBg(media.media_type ?? '') }}
                        >
                          {getMediaTypeLabel(media.media_type ?? '')}
                        </span>
                        <span className="text-xs text-neo-text-secondary">{formatFileSize(media.file_size ?? 0)}</span>
                        <span className="text-xs text-neo-text-secondary">{formatDate(media.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1">
                    <button onClick={() => setViewingMedia(media)} className="neo-icon-btn" title="Voir">
                      <Eye size={16} className="text-neo-text-secondary" />
                    </button>
                    <a href={getMediaUrl(media)} download className="neo-icon-btn" title="Télécharger">
                      <Download size={16} className="text-neo-primary" />
                    </a>
                    {isAdmin && (
                      <button onClick={() => handleDelete(media.id)} className="neo-icon-btn" title="Supprimer">
                        <Trash2 size={16} className="text-neo-error" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#d1d8e0' }}>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Aperçu</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Titre</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Taille</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#d1d8e0' }}>
                  {paginatedMedias.map(media => (
                    <tr key={media.id} className="transition-colors hover:bg-black/[0.02]">
                      <td className="px-5 py-4">
                        <div
                          className="w-12 h-12 rounded-xl overflow-hidden"
                          style={{ boxShadow: 'inset 2px 2px 5px #c5ccd4, inset -2px -2px 5px #ffffff' }}
                        >
                          {media.media_type?.toLowerCase().includes('image') || media.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={getMediaUrl(media)} alt={media.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(108, 99, 255, 0.1)' }}>
                              <Video size={20} className="text-neo-primary" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-neo-text truncate max-w-[200px]">{media.title}</p>
                        {media.description && (
                          <p className="text-xs text-neo-text-secondary truncate max-w-[200px]">{media.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getMediaTypeColor(media.media_type ?? ''), background: getMediaTypeBg(media.media_type ?? '') }}
                        >
                          {getMediaTypeLabel(media.media_type ?? '')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-neo-text-secondary">{formatFileSize(media.file_size ?? 0)}</td>
                      <td className="px-5 py-4 text-sm text-neo-text-secondary">{formatDate(media.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => setViewingMedia(media)} className="neo-icon-btn" title="Voir">
                            <Eye size={16} className="text-neo-text-secondary" />
                          </button>
                          <a href={getMediaUrl(media)} download className="neo-icon-btn" title="Télécharger">
                            <Download size={16} className="text-neo-primary" />
                          </a>
                          {isAdmin && (
                            <button onClick={() => handleDelete(media.id)} className="neo-icon-btn" title="Supprimer">
                              <Trash2 size={16} className="text-neo-error" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={medias.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="medias"
            />
          </>
        )}
      </div>

      {/* Statistiques */}
      <div className="neo-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neo-primary">{medias.length}</p>
            <p className="text-sm text-neo-text-secondary">Médias au total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-success">
              {medias.filter(m => m.media_type?.toLowerCase().includes('image') || m.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length}
            </p>
            <p className="text-sm text-neo-text-secondary">Images</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-primary">
              {medias.filter(m => m.media_type?.toLowerCase().includes('video') || m.file_path?.match(/\.(mp4|mov|avi|webm)$/i)).length}
            </p>
            <p className="text-sm text-neo-text-secondary">Vidéos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-accent">{hasManagementPermission ? 'Actif' : 'Lecture'}</p>
            <p className="text-sm text-neo-text-secondary">Vos permissions</p>
          </div>
        </div>
      </div>

      {/* Modal de visualisation */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setViewingMedia(null)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block w-full max-w-3xl p-6 overflow-hidden text-left align-bottom transition-all transform sm:my-8 sm:align-middle sm:p-8">
              <div className="neo-card p-0 overflow-hidden relative">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neo-text">{viewingMedia.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getMediaTypeColor(viewingMedia.media_type ?? ''), background: getMediaTypeBg(viewingMedia.media_type ?? '') }}
                        >
                          {getMediaTypeLabel(viewingMedia.media_type ?? '')}
                        </span>
                        <span className="text-xs text-neo-text-secondary">{formatFileSize(viewingMedia.file_size ?? 0)}</span>
                        <span className="text-xs text-neo-text-secondary">ID: #{viewingMedia.id}</span>
                      </div>
                    </div>
                    <button onClick={() => setViewingMedia(null)} className="neo-icon-btn flex-shrink-0">
                      <X size={18} className="text-neo-text-secondary" />
                    </button>
                  </div>

                  {/* Aperçu du média */}
                  <div className="neo-inset p-2 mb-4 rounded-2xl">
                    {viewingMedia.media_type?.toLowerCase().includes('image') || viewingMedia.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={getMediaUrl(viewingMedia)}
                        alt={viewingMedia.title}
                        className="w-full max-h-96 object-contain rounded-xl"
                      />
                    ) : (
                      <video
                        src={getMediaUrl(viewingMedia)}
                        controls
                        className="w-full max-h-96 rounded-xl"
                      >
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    )}
                  </div>

                  {viewingMedia.description && (
                    <div className="mb-4">
                      <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neo-text-secondary mb-2">
                        <FileText size={14} /> Description
                      </h4>
                      <div className="neo-inset p-4">
                        <p className="text-sm text-neo-text">{viewingMedia.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-primary">
                        <FileText size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Type de fichier</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{viewingMedia.media_type || 'Inconnu'}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-accent">
                        <Download size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Taille</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatFileSize(viewingMedia.file_size ?? 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#d1d8e0' }}>
                  <div className="flex items-center gap-1 text-xs text-neo-text-secondary">
                    <FileText size={14} /> Ajouté le {formatDate(viewingMedia.created_at)}
                  </div>
                  <div className="flex gap-2">
                    <a href={getMediaUrl(viewingMedia)} download className="neo-btn-ghost">
                      <Download size={16} /> Télécharger
                    </a>
                    <button onClick={() => setViewingMedia(null)} className="neo-btn-primary">
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medias;
