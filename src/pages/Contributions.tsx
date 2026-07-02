import React, { useState, useEffect } from 'react';
import { getCurrentUser, canManageContent } from '../utils/auth';
import { getContributions } from '../api/contributions';
import Pagination from '../components/Pagination';
import { HandHeart, Plus, X, Eye, FileText, AlertTriangle, Calendar, CreditCard, User, Filter } from 'lucide-react';

export interface Contribution {
  id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  user_id: number;
  user_email?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

const Contributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewingContribution, setViewingContribution] = useState<Contribution | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await getContributions();
      setContributions(data);
    } catch (error: any) {
      console.error('Failed to fetch contributions', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des contributions');
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
    fetchContributions();
  }, []);

  useEffect(() => {
    filterContributions(currentFilter);
  }, [contributions, currentFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter]);

  const hasManagementPermission = canManageContent(currentUser);

  const filterContributions = (filter: string) => {
    setCurrentFilter(filter);
    switch (filter) {
      case 'completed':
        setFilteredContributions(contributions.filter(c => c.status === 'completed' || c.status === 'succeeded'));
        break;
      case 'pending':
        setFilteredContributions(contributions.filter(c => c.status === 'pending'));
        break;
      case 'failed':
        setFilteredContributions(contributions.filter(c => c.status === 'failed' || c.status === 'cancelled'));
        break;
      case 'all':
      default:
        setFilteredContributions(contributions);
        break;
    }
  };

  const handleReconnect = () => {
    localStorage.removeItem('ekklesia-token');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'succeeded') return '#48bb78';
    if (s === 'pending') return '#ed8936';
    if (s === 'failed' || s === 'cancelled') return '#fc5c7d';
    return '#718096';
  };

  const getStatusBg = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'succeeded') return 'rgba(72, 187, 120, 0.12)';
    if (s === 'pending') return 'rgba(237, 137, 54, 0.12)';
    if (s === 'failed' || s === 'cancelled') return 'rgba(252, 92, 125, 0.12)';
    return 'rgba(113, 128, 150, 0.12)';
  };

  const getStatusText = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'succeeded') return 'Complété';
    if (s === 'pending') return 'En attente';
    if (s === 'failed') return 'Échoué';
    if (s === 'cancelled') return 'Annulé';
    return status || 'Inconnu';
  };

  const getPaymentMethodIcon = (method: string) => {
    const m = method?.toLowerCase() || '';
    if (m.includes('card') || m.includes('visa') || m.includes('mastercard')) return '💳';
    if (m.includes('mobile') || m.includes('mtn') || m.includes('orange') || m.includes('moov')) return '📱';
    if (m.includes('paypal')) return '🅿️';
    if (m.includes('bank') || m.includes('transfer')) return '🏦';
    return '💰';
  };

  const getContributionCountByStatus = (status: string) => {
    if (status === 'all') return contributions.length;
    if (status === 'completed') return contributions.filter(c => c.status === 'completed' || c.status === 'succeeded').length;
    if (status === 'pending') return contributions.filter(c => c.status === 'pending').length;
    if (status === 'failed') return contributions.filter(c => c.status === 'failed' || c.status === 'cancelled').length;
    return 0;
  };

  const totalAmount = contributions
    .filter(c => c.status === 'completed' || c.status === 'succeeded')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPages = Math.max(1, Math.ceil(filteredContributions.length / itemsPerPage));
  const paginatedContributions = filteredContributions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-neo-text mb-6">Contributions</h3>
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
          <h3 className="text-2xl font-bold text-neo-text">Contributions</h3>
          <p className="text-sm text-neo-text-secondary">Suivez les dons et contributions des fidèles</p>
        </div>
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

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Contributions', value: contributions.length, icon: <HandHeart size={22} />, color: '#6c63ff' },
          { label: 'Montant total', value: formatAmount(totalAmount, 'XOF'), icon: <CreditCard size={22} />, color: '#48bb78' },
          { label: 'Complétées', value: getContributionCountByStatus('completed'), icon: <HandHeart size={22} />, color: '#48bb78' },
          { label: 'En attente', value: getContributionCountByStatus('pending'), icon: <HandHeart size={22} />, color: '#ed8936' },
        ].map((card) => (
          <div key={card.label} className="neo-card p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`, boxShadow: '4px 4px 8px #c5ccd4, -2px -2px 6px #ffffff' }}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-neo-text-secondary">{card.label}</p>
              <p className="text-2xl font-bold text-neo-text">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres et liste */}
      <div className="neo-card overflow-hidden">
        <div className="px-5 py-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ borderColor: '#d1d8e0' }}>
          <h2 className="text-lg font-bold text-neo-text">
            {currentFilter === 'all' && 'Toutes les contributions'}
            {currentFilter === 'completed' && 'Contributions complétées'}
            {currentFilter === 'pending' && 'Contributions en attente'}
            {currentFilter === 'failed' && 'Contributions échouées'}
            <span className="text-neo-primary ml-2">({filteredContributions.length})</span>
          </h2>

          <div className="flex gap-2">
            {(['all', 'completed', 'pending', 'failed'] as string[]).map((filter) => (
              <button
                key={filter}
                onClick={() => filterContributions(filter)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  currentFilter === filter
                    ? 'text-white'
                    : 'text-neo-text-secondary hover:text-neo-text'
                }`}
                style={
                  currentFilter === filter
                    ? { background: filter === 'completed' ? '#48bb78' : filter === 'pending' ? '#ed8936' : filter === 'failed' ? '#fc5c7d' : '#6c63ff', boxShadow: '3px 3px 6px #c5ccd4, -3px -3px 6px #ffffff' }
                    : {}
                }
              >
                {filter === 'all' ? 'Toutes' : filter === 'completed' ? 'Complétées' : filter === 'pending' ? 'En attente' : 'Échouées'} ({getContributionCountByStatus(filter)})
              </button>
            ))}
          </div>
        </div>

        {filteredContributions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="neo-circle w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <HandHeart size={32} className="text-neo-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-neo-text mb-1">Aucune contribution</h3>
            <p className="text-sm text-neo-text-secondary mb-4">
              {currentFilter === 'all' && 'Aucune contribution n\'a été enregistrée pour le moment.'}
              {currentFilter === 'completed' && 'Aucune contribution complétée.'}
              {currentFilter === 'pending' && 'Aucune contribution en attente.'}
              {currentFilter === 'failed' && 'Aucune contribution échouée.'}
            </p>
            {currentFilter !== 'all' && (
              <button onClick={() => filterContributions('all')} className="neo-btn-ghost">
                Voir toutes les contributions
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-4 lg:hidden">
              {paginatedContributions.map(contribution => (
                <div key={contribution.id} className="neo-card-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-neo-text">{formatAmount(contribution.amount, contribution.currency)}</span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: getStatusColor(contribution.status), background: getStatusBg(contribution.status) }}
                        >
                          {getStatusText(contribution.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-neo-text-secondary">
                        <User size={12} />
                        <span>{contribution.user_name || contribution.user_email || `Utilisateur #${contribution.user_id}`}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neo-text-secondary mt-0.5">
                        <Calendar size={12} />
                        <span>{formatDate(contribution.created_at)} à {formatTime(contribution.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neo-text-secondary mt-0.5">
                        <CreditCard size={12} />
                        <span>{contribution.payment_method || 'Inconnu'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1">
                    <button onClick={() => setViewingContribution(contribution)} className="neo-icon-btn" title="Voir">
                      <Eye size={16} className="text-neo-text-secondary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#d1d8e0' }}>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Donateur</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Montant</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Statut</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Méthode</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-neo-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#d1d8e0' }}>
                  {paginatedContributions.map(contribution => (
                    <tr key={contribution.id} className="transition-colors hover:bg-black/[0.02]">
                      <td className="px-5 py-4 text-sm text-neo-text-secondary">#{contribution.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="neo-circle w-8 h-8 flex items-center justify-center text-xs font-bold text-neo-primary">
                            {(contribution.user_name || contribution.user_email || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neo-text truncate max-w-[150px]">
                              {contribution.user_name || contribution.user_email || `Utilisateur #${contribution.user_id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-neo-text">{formatAmount(contribution.amount, contribution.currency)}</td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getStatusColor(contribution.status), background: getStatusBg(contribution.status) }}
                        >
                          {getStatusText(contribution.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-neo-text-secondary">{contribution.payment_method || '—'}</td>
                      <td className="px-5 py-4 text-sm text-neo-text-secondary whitespace-nowrap">
                        {formatDate(contribution.created_at)}<br />
                        <span className="text-xs">{formatTime(contribution.created_at)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setViewingContribution(contribution)} className="neo-icon-btn" title="Voir">
                          <Eye size={16} className="text-neo-text-secondary" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredContributions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="contributions"
            />
          </>
        )}
      </div>

      {/* Statistiques */}
      <div className="neo-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neo-primary">{contributions.length}</p>
            <p className="text-sm text-neo-text-secondary">Contributions total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-success">{getContributionCountByStatus('completed')}</p>
            <p className="text-sm text-neo-text-secondary">Complétées</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-warning">{getContributionCountByStatus('pending')}</p>
            <p className="text-sm text-neo-text-secondary">En attente</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neo-error">{getContributionCountByStatus('failed')}</p>
            <p className="text-sm text-neo-text-secondary">Échouées</p>
          </div>
        </div>
      </div>

      {/* Modal de visualisation */}
      {viewingContribution && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setViewingContribution(null)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block w-full max-w-lg p-6 overflow-hidden text-left align-bottom transition-all transform sm:my-8 sm:align-middle sm:p-8">
              <div className="neo-card p-0 overflow-hidden relative">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neo-text">Détails de la contribution</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: getStatusColor(viewingContribution.status), background: getStatusBg(viewingContribution.status) }}
                        >
                          {getStatusText(viewingContribution.status)}
                        </span>
                        <span className="text-xs text-neo-text-secondary">ID: #{viewingContribution.id}</span>
                      </div>
                    </div>
                    <button onClick={() => setViewingContribution(null)} className="neo-icon-btn flex-shrink-0">
                      <X size={18} className="text-neo-text-secondary" />
                    </button>
                  </div>

                  <div className="text-center mb-4">
                    <div className="neo-circle w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                      <HandHeart size={32} className="text-neo-primary" />
                    </div>
                    <p className="text-3xl font-bold text-neo-text">{formatAmount(viewingContribution.amount, viewingContribution.currency)}</p>
                    <p className="text-sm text-neo-text-secondary">{viewingContribution.currency || 'XOF'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-primary">
                        <User size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Donateur</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">
                        {viewingContribution.user_name || viewingContribution.user_email || `Utilisateur #${viewingContribution.user_id}`}
                      </p>
                      {viewingContribution.user_email && (
                        <p className="text-xs text-neo-text-secondary">{viewingContribution.user_email}</p>
                      )}
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-accent">
                        <CreditCard size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Méthode</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{viewingContribution.payment_method || 'Non spécifiée'}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-primary">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatDate(viewingContribution.created_at)}</p>
                      <p className="text-xs text-neo-text-secondary">{formatTime(viewingContribution.created_at)}</p>
                    </div>
                    <div className="neo-inset p-4">
                      <div className="flex items-center gap-2 mb-2 text-neo-accent">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Mise à jour</span>
                      </div>
                      <p className="text-sm font-semibold text-neo-text">{formatDate(viewingContribution.updated_at)}</p>
                      <p className="text-xs text-neo-text-secondary">{formatTime(viewingContribution.updated_at)}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#d1d8e0' }}>
                  <button onClick={() => setViewingContribution(null)} className="neo-btn-primary">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contributions;
