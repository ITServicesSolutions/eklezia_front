import React, { useEffect, useMemo, useState } from 'react';
import { getContributions } from '../api/contributions';
import Pagination from '../components/Pagination';

export interface Contribution {
  id: number;
  user_id: number;
  type: 'don' | 'offrande' | 'dime';
  amount: number;
  payment_method_id: number;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  delete_user_id?: number;
  delete_date?: string;
}

const ITEMS_PER_PAGE = 10;

const Contributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState('');
  const [sortDate, setSortDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContributions();
      setContributions(data);
    } catch (err) {
      setError('Erreur lors du chargement des contributions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const sortedContributions = useMemo(() => {
    let sorted = [...contributions];

    if (sortType) {
      sorted = sorted.filter((contribution) => contribution.type === sortType);
    }

    if (sortDate === 'asc') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortDate === 'desc') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [contributions, sortType, sortDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, sortDate]);

  const totalPages = Math.max(1, Math.ceil(sortedContributions.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedContributions = sortedContributions.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setSortType('');
    setSortDate('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completee';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Echouee';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'don':
        return '💰';
      case 'offrande':
        return '🙏';
      case 'dime':
        return '⛪';
      default:
        return '💳';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'don':
        return 'Don';
      case 'offrande':
        return 'Offrande';
      case 'dime':
        return 'Dime';
      default:
        return type;
    }
  };

  const stats = useMemo(() => {
    const total = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
    const completed = contributions
      .filter((contribution) => contribution.status === 'completed')
      .reduce((sum, contribution) => sum + contribution.amount, 0);
    const pending = contributions.filter((contribution) => contribution.status === 'pending').length;
    const failed = contributions.filter((contribution) => contribution.status === 'failed').length;

    return { total, completed, pending, failed };
  }, [contributions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des contributions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl xl:text-5xl">
            Contributions
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg xl:text-xl">
            Suivez toutes les contributions et dons de notre communaute
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total collecte</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString('fr-FR')} Fcfa</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed.toLocaleString('fr-FR')} Fcfa</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-900">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Echouees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-red-800 dark:text-red-200">{error}</span>
              </div>
              <button
                onClick={fetchContributions}
                className="min-h-[44px] rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Reessayer
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Filtres et tris</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sortedContributions.length} contribution{sortedContributions.length !== 1 ? 's' : ''} trouvee
                {sortedContributions.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-[minmax(0,15rem)_minmax(0,15rem)_auto]">
              <div>
                <label htmlFor="type-sort" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Type de contribution
                </label>
                <select
                  id="type-sort"
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="don">Don</option>
                  <option value="offrande">Offrande</option>
                  <option value="dime">Dime</option>
                </select>
              </div>

              <div>
                <label htmlFor="date-sort" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Tri par date
                </label>
                <select
                  id="date-sort"
                  value={sortDate}
                  onChange={(e) => setSortDate(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Date par defaut</option>
                  <option value="asc">Plus ancienne</option>
                  <option value="desc">Plus recente</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="min-h-[44px] rounded-xl bg-gray-100 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Reinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {sortedContributions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <span className="text-3xl">💸</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                {contributions.length === 0 ? 'Aucune contribution' : 'Aucun resultat'}
              </h3>
              <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
                {contributions.length === 0
                  ? "Aucune contribution n'a ete enregistree pour le moment."
                  : 'Aucune contribution ne correspond a vos criteres de filtrage.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 p-4">
                {paginatedContributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 sm:p-5"
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]">
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getTypeIcon(contribution.type)}</span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{getTypeText(contribution.type)}</p>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(contribution.status)}`}>
                                {getStatusText(contribution.status)}
                              </span>
                            </div>
                            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {contribution.amount.toLocaleString('fr-FR')} Fcfa
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {new Date(contribution.created_at).toLocaleDateString('fr-FR')} a{' '}
                              {new Date(contribution.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Contributeur</p>
                          <p className="text-gray-900 dark:text-white">#{contribution.user_id}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Paiement</p>
                          <p className="text-gray-900 dark:text-white">#{contribution.payment_method_id}</p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Transaction</p>
                        <p className="mt-1 break-all font-mono text-sm text-gray-500 dark:text-gray-400">
                          {contribution.transaction_id || 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-start lg:justify-end">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          ID #{contribution.id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={sortedContributions.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemLabel="contributions"
              />
            </>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{contributions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributions totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {contributions.filter((contribution) => contribution.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributions completees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(contributions.map((contribution) => contribution.user_id)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributeurs uniques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">En attente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contributions;
