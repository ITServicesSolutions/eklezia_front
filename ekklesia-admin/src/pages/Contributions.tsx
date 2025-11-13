import React, { useEffect, useState, useMemo } from 'react';
import { getContributions } from '../api/contributions';

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

const Contributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState('');
  const [sortDate, setSortDate] = useState('');

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await getContributions();
      setContributions(data);
    } catch (err) {
      setError('Failed to fetch contributions');
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
      sorted = sorted.filter(c => c.type === sortType);
    }
    if (sortDate === 'asc') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortDate === 'desc') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [contributions, sortType, sortDate]);

  const handleReset = () => {
    setSortType('');
    setSortDate('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contributions</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end items-center mb-4 space-x-4">
        <div>
          <label htmlFor="type-sort" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Trier par type :
          </label>
          <select
            id="type-sort"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Par défaut</option>
            <option value="don">Don</option>
            <option value="offrande">Offrande</option>
            <option value="dime">Dîme</option>
          </select>
        </div>
        <div>
          <label htmlFor="date-sort" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Trier par date :
          </label>
          <select
            id="date-sort"
            value={sortDate}
            onChange={(e) => setSortDate(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Par défaut</option>
            <option value="asc">Plus ancienne</option>
            <option value="desc">Plus récente</option>
          </select>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 mt-5 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          Réinitialiser
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b dark:border-gray-700">Type</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Amount</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Payment Method ID</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Status</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedContributions.map((contribution) => (
              <tr key={contribution.id}>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.type}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.amount}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.payment_method_id}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.status}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{new Date(contribution.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contributions;
